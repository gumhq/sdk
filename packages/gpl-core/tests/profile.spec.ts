import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import randombytes from "randombytes";
import { airdrop } from "./utils";
import * as dotenv from 'dotenv';
import { expect } from "chai";
import {
  sendAndConfirmTransaction,
} from "@solana/web3.js";

dotenv.config()
const opts = {
  preflightCommitment: "processed" as anchor.web3.ConfirmOptions,
};

describe("Profile", async () => {
  let sdk: SDK;
  let user: anchor.web3.Keypair;
  let userWallet: NodeWallet;
  let rpcConnection: anchor.web3.Connection;
  let provider: anchor.Provider;
  let randomHash: Buffer;
  let profileAccount: anchor.web3.PublicKey;

  before(async () => {
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    user = anchor.web3.Keypair.generate();
    userWallet = new NodeWallet(user);
    const preflightCommitment = "confirmed";
    rpcConnection = new anchor.web3.Connection(
      "http://127.0.0.1:8899",
      preflightCommitment
    );
    sdk = new SDK(
      userWallet as NodeWallet,
      rpcConnection,
      opts.preflightCommitment,
      "localnet",
    );
    await airdrop(user.publicKey);
    randomHash = randombytes(32);

    // Create a user
    const userInstruction = await sdk.user.create(user.publicKey, randomHash);
    const transaction = new anchor.web3.Transaction().add(userInstruction);
    transaction.recentBlockhash = (
      await rpcConnection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = user.publicKey;
    const signedTransaction = await userWallet.signTransaction(transaction);
    await sendAndConfirmTransaction(
      rpcConnection,
      signedTransaction,
      [user]
    );
  });

  it("should create a profile", async () => {
    const [userAccount] = sdk.user.userPDA(randomHash);
    const profileInstruction = await sdk.profile.create(
      userAccount,
      "Personal",
      user.publicKey,
    );
    const transaction = new anchor.web3.Transaction().add(profileInstruction);
    transaction.recentBlockhash = (
      await rpcConnection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = user.publicKey;
    const signedTransaction = await userWallet.signTransaction(transaction);
    const tx = await sendAndConfirmTransaction(
      rpcConnection,
      signedTransaction,
      [user]
    );
    expect(tx).to.not.be.null;
    [profileAccount] = sdk.profile.profilePDA("Personal", userAccount);
    const profile = await sdk.profile.get(profileAccount);
    expect(profile.user.toString()).is.equal(userAccount.toString());
    expect(profile.namespace.toString()).is.equal({ personal: {} }.toString());
  });

  it("should delete a profile", async () => {
    const [userAccount] = sdk.user.userPDA(randomHash);
    console.log(`userAccount: ${userAccount.toString()}`);
    console.log(`profileAccount: ${profileAccount.toString()}`);
    const profileInstruction = await sdk.profile.delete(
      profileAccount,
      userAccount,
      user.publicKey,
    );
    const transaction = new anchor.web3.Transaction().add(profileInstruction);
    transaction.recentBlockhash = (
      await rpcConnection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = user.publicKey;
    const signedTransaction = await userWallet.signTransaction(transaction);
    try {
      const tx = await sendAndConfirmTransaction(
        rpcConnection,
        signedTransaction,
        [user]
      );
      expect(tx).to.not.be.null;
      await sdk.profile.get(profileAccount);
    } catch (error: any) {
      console.log(error);
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${profileAccount.toString()}`);
    }
  });
});