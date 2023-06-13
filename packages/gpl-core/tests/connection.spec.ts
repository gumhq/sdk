import { GumNameService, SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { airdrop, createGumDomain, createGumTld } from "./utils";
import { expect } from "chai";
import { sendAndConfirmTransaction } from "@solana/web3.js";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Connection", async () => {
  let sdk: SDK;
  let nameservice: GumNameService;
  let testUser: anchor.web3.Keypair;
  let testUserWallet: NodeWallet;
  let profilePDA: anchor.web3.PublicKey;
  let testProfilePDA: anchor.web3.PublicKey;
  let connectionPDA: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet"
    );

    // Create a gum tld
    const gumTld = await createGumTld(sdk);

    // Create a domain for the wallet
    const screenNameAccount = await createGumDomain(sdk, gumTld, "foobar");

    // Create a profile
    const profileMetdataUri = "https://example.com";
    const profile = await sdk.profile.create(
      profileMetdataUri,
      screenNameAccount,
      user.publicKey,
    );
    profilePDA = profile.profilePDA;
    await profile.instructionMethodBuilder.rpc();

    // Create a testUser nameservice account
    testUser = anchor.web3.Keypair.generate();
    testUserWallet = new NodeWallet(testUser);
    await airdrop(testUser.publicKey);

    // Create a user nameservice account
    const screenNameAccount2 = await createGumDomain(sdk, gumTld, "foobarr");

    // Create a testProfile
    const testProfile = await sdk.profile.create(
      profileMetdataUri,
      screenNameAccount2,
      testUser.publicKey,
    );
    testProfilePDA = testProfile.profilePDA as anchor.web3.PublicKey;
    const testProfileTx = await testProfile.instructionMethodBuilder.transaction();
    testProfileTx.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
    testProfileTx.feePayer = testUser.publicKey;
    const signedTransaction = await testUserWallet.signTransaction(testProfileTx);
    await sendAndConfirmTransaction(sdk.rpcConnection, signedTransaction, [testUser]);
  });

  it("should create a connection", async () => {
    const connection = await sdk.connection.create(
      profilePDA,
      testProfilePDA,
      user.publicKey,
    );
    connectionPDA = connection.connectionPDA as anchor.web3.PublicKey;
    await connection.instructionMethodBuilder.rpc();
    const connectionAccount = await sdk.connection.get(connectionPDA);
    expect(connectionAccount.fromProfile.toBase58()).to.equal(profilePDA.toBase58());
    expect(connectionAccount.toProfile.toBase58()).to.equal(testProfilePDA.toBase58());
  });

  it("should delete a connection", async () => {
    const connection = sdk.connection.delete(
      connectionPDA,
      profilePDA,
      testProfilePDA,
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