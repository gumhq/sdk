import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import randombytes from "randombytes";
import { airdrop } from "./utils";
import { expect } from "chai";
import { sendAndConfirmTransaction } from "@solana/web3.js";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Connection", async () => {
  let sdk: SDK;
  let testUser: anchor.web3.Keypair;
  let testUserWallet: NodeWallet;
  let userPDA: anchor.web3.PublicKey;
  let testUserPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;
  let testProfilePDA: anchor.web3.PublicKey;
  let connectionPDA: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "processed" as anchor.web3.ConfirmOptions,
      "localnet"
    );
    testUser = anchor.web3.Keypair.generate();
    testUserWallet = new NodeWallet(testUser);
    await airdrop(testUser.publicKey);

    // Create a user
    const randomHash = randombytes(32);
    const userTx = sdk.user.create(user.publicKey, randomHash)
    const userPubKeys = await userTx.pubkeys();
    userPDA = userPubKeys.user as anchor.web3.PublicKey;
    await userTx.rpc();

    // Create a testUser
    const randomTestHash = randombytes(32);
    const createTestUser = sdk.user.create(testUser.publicKey, randomTestHash);
    const testUserPubKeys = await createTestUser.pubkeys();
    testUserPDA = testUserPubKeys.user as anchor.web3.PublicKey;
    const testUserTx = await createTestUser.transaction();
    testUserTx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
    testUserTx.feePayer = testUser.publicKey;
    const signedTestUserTransaction = await testUserWallet.signTransaction(testUserTx);
    await sendAndConfirmTransaction(sdk.rpcConnection, signedTestUserTransaction, [testUser]);

    // Create a profile
    const profileTx = sdk.profile.create(userPDA, "Personal", user.publicKey);
    const profilePubKeys = await profileTx.pubkeys();
    profilePDA = profilePubKeys.profile as anchor.web3.PublicKey;
    await profileTx.rpc();

    // Create a testProfile
    const testProfile = sdk.profile.create(
      testUserPDA,
      "Personal",
      testUser.publicKey,
    );
    const testProfilePubKeys = await testProfile.pubkeys();
    testProfilePDA = testProfilePubKeys.profile as anchor.web3.PublicKey;
    const testProfileTx = await testProfile.transaction();
    testProfileTx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
    testProfileTx.feePayer = testUser.publicKey;
    const signedTransaction = await testUserWallet.signTransaction(testProfileTx);
    await sendAndConfirmTransaction(sdk.rpcConnection, signedTransaction, [testUser]);
  });

  it("should create a connection", async () => {
    const connection = await sdk.connection.create(
      profilePDA,
      testProfilePDA,
      userPDA,
      user.publicKey,
    );
    const pubKeys = await connection.pubkeys();
    connectionPDA = pubKeys.connection as anchor.web3.PublicKey;
    await connection.rpc();

    const connectionAccount = await sdk.connection.get(connectionPDA);
    expect(connectionAccount.fromProfile.toBase58()).to.equal(profilePDA.toBase58());
    expect(connectionAccount.toProfile.toBase58()).to.equal(testProfilePDA.toBase58());
  });

  it("should delete a connection", async () => {
    const connection = await sdk.connection.delete(
      connectionPDA,
      profilePDA,
      testProfilePDA,
      userPDA,
      user.publicKey,
    );
    await connection.rpc();

    try {
      await sdk.connection.get(connectionPDA);
    }
    catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${connectionPDA.toString()}`);
    }
  });
});