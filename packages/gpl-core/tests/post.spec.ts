import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";

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
      { preflightCommitment: "processed" },
      "localnet"
    );

    // Create a user
    const createUser = await sdk.user.create(user.publicKey)
    userPDA = createUser.userPDA as anchor.web3.PublicKey;
    await createUser.instructionMethodBuilder.rpc();

    // Create a profile
    const profile = await sdk.profile.create(userPDA, "Personal", user.publicKey);
    profilePDA = profile.profilePDA as anchor.web3.PublicKey;
    await profile.instructionMethodBuilder.rpc();
  });

  it("should create a post", async () => {
    const metadataUri = "https://da3z62f3lqfkdsdfhl5cssin2hrfcnec6qlhkyxg4aiwp23c3xea.arweave.net/GDefaLtcCqHIZTr6KUkN0eJRNIL0FnVi5uARZ-ti3cg";
    const post = await sdk.post.create(
      metadataUri,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    postPDA = post.postPDA as anchor.web3.PublicKey;
    await post.instructionMethodBuilder.rpc();
    const postAccount = await sdk.post.get(postPDA);
    expect(postAccount.metadataUri).is.equal(metadataUri);
    expect(postAccount.profile.toString()).is.equal(profilePDA.toString());
  });

  it("should update a post", async () => {
    const metadataUri = "https://da3z62f3lqfkdsdfhl5cssin2hrfcnec6qlhkyxg4aiwp23c3xea.arweave.net/GDefaLtcCqHIZTr6KUkN0eJRNIL0FnVi5uARZ-ti3cg";
    const post = await sdk.post.update(
      metadataUri,
      postPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await post.rpc();
    const postAccount = await sdk.post.get(postPDA);
    expect(postAccount.metadataUri).is.equal(metadataUri);
    expect(postAccount.profile.toString()).is.equal(profilePDA.toString());
  });

  it("should delete a post", async () => {
    const post = sdk.post.delete(
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