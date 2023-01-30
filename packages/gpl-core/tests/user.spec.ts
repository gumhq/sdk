import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { airdrop } from "./utils";
import { expect } from "chai";
import { sendAndConfirmTransaction } from "@solana/web3.js";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("User", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let randomUser: anchor.web3.Keypair;

  before(async () => {
    sdk = new SDK(
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "localnet"
    );
    randomUser = anchor.web3.Keypair.generate();
    await airdrop(randomUser.publicKey);
  });

  it("should create a user", async () => {
    const userIx = await sdk.user.create(user.publicKey);
    await userIx.program.rpc();
    userPDA = userIx.userPDA as anchor.web3.PublicKey;
    const userAccount = await sdk.user.get(userPDA);
    expect(userAccount.authority.toString()).is.equal(user.publicKey.toString());
  });

  it("should update a user", async () => {
    const tx = sdk.user.update(userPDA, randomUser.publicKey, user.publicKey);
    const pubKeys = await tx.pubkeys();
    const randomUserPDA = pubKeys.user as anchor.web3.PublicKey;
    await tx.rpc();
    const userAccount = await sdk.user.get(randomUserPDA);
    expect(userAccount.authority.toString()).is.equal(randomUser.publicKey.toString());
  });

  it("should delete a user", async () => {
    const randomUserWallet = new NodeWallet(randomUser);
    const tx = sdk.user.delete(userPDA, randomUser.publicKey);
    const pubKeys = await tx.pubkeys();
    const randomUserPDA = pubKeys.user as anchor.web3.PublicKey;
    const transaction = await tx.transaction();
    transaction.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
    transaction.feePayer = randomUser.publicKey;
    const signedTransaction = await randomUserWallet.signTransaction(transaction);
    await sendAndConfirmTransaction(
      sdk.rpcConnection,
      signedTransaction,
      [randomUser],
    );
    try {
      await sdk.user.get(randomUserPDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${randomUserPDA.toString()}`);
    }
  });
});