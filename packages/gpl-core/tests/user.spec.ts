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

describe("User", async () => {
  let sdk: SDK;
  let user: anchor.web3.Keypair;
  let userWallet: NodeWallet;
  let rpcConnection: anchor.web3.Connection;
  let provider: anchor.Provider;
  let randomHash: Buffer;
  let randomUser: anchor.web3.Keypair;

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
  });

  it("should create a user", async () => {
    randomHash = randombytes(32);
    const userInstruction = await sdk.user.create(user.publicKey, randomHash);
    const transaction = new anchor.web3.Transaction().add(userInstruction);
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
      const userAccount = await sdk.user.get(randomHash);
      expect(userAccount.authority.toString()).is.equal(user.publicKey.toString());
    } catch (e) {
      console.log(e);
    }
  });

  it("should update a user", async () => {
    randomUser = anchor.web3.Keypair.generate();
    const [userAccount] = sdk.user.userPDA(randomHash);
    const userInstructionUpdate = await sdk.user.update(userAccount, randomUser.publicKey, user.publicKey);
    const transactionUpdate = new anchor.web3.Transaction().add(userInstructionUpdate);
    transactionUpdate.recentBlockhash = (
      await rpcConnection.getLatestBlockhash()
    ).blockhash;
    transactionUpdate.feePayer = user.publicKey;
    const signedTransactionUpdate = await userWallet.signTransaction(transactionUpdate);

    try {
      const txUpdate = await sendAndConfirmTransaction(
        rpcConnection,
        signedTransactionUpdate,
        [user]
      );
      expect(txUpdate).to.not.be.null;
      const userAccount = await sdk.user.get(randomHash);
      expect(userAccount.authority.toString()).is.equal(randomUser.publicKey.toString());
    } catch (e) {
      console.log(e);
    }
  });

  it("should delete a user", async () => {
    await airdrop(randomUser.publicKey);
    const randomUserWallet = new NodeWallet(randomUser);
    const [userAccount] = sdk.user.userPDA(randomHash);
    const userInstructionDelete = await sdk.user.delete(userAccount, randomUser.publicKey);
    const transactionDelete = new anchor.web3.Transaction().add(userInstructionDelete);
    transactionDelete.recentBlockhash = (
      await rpcConnection.getLatestBlockhash()
    ).blockhash;
    transactionDelete.feePayer = randomUser.publicKey;
    const signedTransactionDelete = await randomUserWallet.signTransaction(transactionDelete);

    try {
      const txDelete = await sendAndConfirmTransaction(
        rpcConnection,
        signedTransactionDelete,
        [randomUser]
      );
      expect(txDelete).to.not.be.null;
      await sdk.user.get(randomHash);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${userAccount.toString()}`);
    }
  });
});