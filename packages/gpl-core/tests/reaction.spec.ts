import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { createGumTld, createGumDomain } from "./utils";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Reaction", async () => {
  let sdk: SDK;
  let profilePDA: anchor.web3.PublicKey;
  let postPDA: anchor.web3.PublicKey;
  let reactionPDA: anchor.web3.PublicKey;

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
    const screenNameAccount = await createGumDomain(sdk, gumTld, "reactiontest");

    // Create a profile
    const profileMetdataUri = "https://example.com";
    const profile = await sdk.profile.create(
      profileMetdataUri,
      screenNameAccount,
      user.publicKey,
    );
    profilePDA = profile.profilePDA;
    await profile.instructionMethodBuilder.rpc();

    // Create a post
    const metadataUri = "https://da3z62f3lqfkdsdfhl5cssin2hrfcnec6qlhkyxg4aiwp23c3xea.arweave.net/GDefaLtcCqHIZTr6KUkN0eJRNIL0FnVi5uARZ-ti3cg";
    const post = await sdk.post.create(
      metadataUri,
      profilePDA,
      user.publicKey,
    );
    postPDA = post.postPDA as anchor.web3.PublicKey;
    await post.instructionMethodBuilder.rpc();
  });

  it("should create a reaction", async () => {
    const reaction = await sdk.reaction.create(
      profilePDA,
      postPDA,
      "🧈",
      user.publicKey,
    );
    reactionPDA = reaction.reactionPDA as anchor.web3.PublicKey;
    await reaction.instructionMethodBuilder.rpc();

    const reactionAccount = await sdk.reaction.get(reactionPDA);
    expect(reactionAccount.toPost.toBase58()).to.equal(postPDA.toBase58());
    expect(reactionAccount.fromProfile.toBase58()).to.equal(profilePDA.toBase58());
    expect(reactionAccount.reactionType).to.equal("🧈");
  });

  it("should delete a reaction", async () => {
    const reaction = sdk.reaction.delete(
      reactionPDA,
      postPDA,
      profilePDA,
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