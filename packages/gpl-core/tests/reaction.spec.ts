import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import randombytes from "randombytes";
import { expect } from "chai";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Reaction", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;
  let postPDA: anchor.web3.PublicKey;
  let reactionPDA: anchor.web3.PublicKey;

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

    // Create a post
    const postRandomHash = randombytes(32);
    const metadataUri = "This is a test post";
    const post = await sdk.post.create(
      metadataUri,
      postRandomHash,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    const postPubKeys = await post.pubkeys();
    postPDA = postPubKeys.post as anchor.web3.PublicKey;
    await post.rpc();
  });

  it("should create a reaction", async () => {
    const reaction = sdk.reaction.create(
      profilePDA,
      postPDA,
      "Haha",
      userPDA,
      user.publicKey,
    );
    const reactionPubKeys = await reaction.pubkeys();
    reactionPDA = reactionPubKeys.reaction as anchor.web3.PublicKey;
    await reaction.rpc();

    const reactionAccount = await sdk.reaction.get(reactionPDA);
    expect(reactionAccount.toPost.toBase58()).to.equal(postPDA.toBase58());
    expect(reactionAccount.fromProfile.toBase58()).to.equal(profilePDA.toBase58());
    expect(reactionAccount.reactionType.toString()).to.equal({ haha: {} }.toString());
  });

  it("should delete a reaction", async () => {
    const reaction = sdk.reaction.delete(
      reactionPDA,
      postPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await reaction.rpc();

    try {
      await sdk.reaction.get(reactionPDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${reactionPDA.toString()}`);
    }
  });
});