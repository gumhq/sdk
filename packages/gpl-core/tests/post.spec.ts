import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import randombytes from "randombytes";
import { expect } from "chai";
import {
  sendAndConfirmTransaction,
} from "@solana/web3.js";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Post", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;
  let postPDA: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "processed" as anchor.web3.ConfirmOptions,
      "localnet"
    );

    // Create a user
    const randomHash = randombytes(32);
    const userTx = sdk.user.create(user.publicKey, randomHash)
    const userPubKeys = await userTx.pubkeys();
    userPDA = userPubKeys.user as anchor.web3.PublicKey;
    await userTx.rpc();

    // Create a profile
    const profileTx = sdk.profile.create(userPDA, "Personal", user.publicKey);
    const profilePubKeys = await profileTx.pubkeys();
    profilePDA = profilePubKeys.profile as anchor.web3.PublicKey;
    await profileTx.rpc();
  });

  it("should create a post", async () => {
    const randomHash = randombytes(32);
    const post = await sdk.post.create(
      "This is a test post",
      randomHash,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    const postPubKeys = await post.pubkeys();
    postPDA = postPubKeys.post as anchor.web3.PublicKey;
    await post.rpc();
    const postAccount = await sdk.post.get(postPDA);
    expect(postAccount.metadataUri).is.equal("This is a test post");
    expect(postAccount.profile.toString()).is.equal(profilePDA.toString());
  });

  it("should update a post", async () => {
    const post = await sdk.post.update(
      "This is a test post updated",
      postPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await post.rpc();
    const postAccount = await sdk.post.get(postPDA);
    expect(postAccount.metadataUri).is.equal("This is a test post updated");
    expect(postAccount.profile.toString()).is.equal(profilePDA.toString());
  });

  it("should delete a post", async () => {
    const post = await sdk.post.delete(
      postPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await post.rpc();
    try {
      await sdk.post.get(postPDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${postPDA.toString()}`);
    }
  });
});