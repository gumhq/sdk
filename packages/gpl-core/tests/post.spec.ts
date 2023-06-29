import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { createGumTld, createGumDomain } from "./utils";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Post", async () => {
  let sdk: SDK;
  let profilePDA: anchor.web3.PublicKey;
  let postPDA: anchor.web3.PublicKey;

  before(async () => {
    // const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINTS["devnet"]);
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
      // gqlClient
    );

    // Create a gum tld
    const gumTld = await createGumTld(sdk);

    // Create a domain for the wallet
    const screenNameAccount = await createGumDomain(sdk, gumTld, "foobarpost");

    // Create a profile
    const profileMetdataUri = "https://example.com";
    const profile = await sdk.profile.create(
      profileMetdataUri,
      screenNameAccount,
      user.publicKey,
    );
    profilePDA = profile.profilePDA;
    await profile.instructionMethodBuilder.rpc();
  });

  it("should create a post", async () => {
    const metadataUri = "https://da3z62f3lqfkdsdfhl5cssin2hrfcnec6qlhkyxg4aiwp23c3xea.arweave.net/GDefaLtcCqHIZTr6KUkN0eJRNIL0FnVi5uARZ-ti3cg";
    const post = await sdk.post.create(
      metadataUri,
      profilePDA,
      user.publicKey,
    );
    postPDA = post.postPDA as anchor.web3.PublicKey;
    await post.instructionMethodBuilder.rpc();
    const postAccount = await sdk.post.get(postPDA);
    expect(postAccount.metadataUri).is.equal(metadataUri);
    expect(postAccount.profile.toString()).is.equal(profilePDA.toString());
  });

  it("should create a comment", async () => {
    const metadataUri = "https://da3z62f3lqfkdsdfhl5cssin2hrfcnec6qlhkyxg4aiwp23c3xea.arweave.net/GDefaLtcCqHIZTr6KUkN0eJRNIL0FnVi5uARZ-ti3cg";
    const comment = await sdk.post.reply(
      postPDA,
      metadataUri,
      profilePDA,
      user.publicKey,
    );
    await comment.instructionMethodBuilder.rpc();
    const commentPDA = comment.postPDA as anchor.web3.PublicKey;
    const commentAccount = await sdk.post.get(commentPDA);
    expect(commentAccount.metadataUri).is.equal(metadataUri);
    expect(commentAccount.profile.toString()).is.equal(profilePDA.toString());
  });

  it("should update a post", async () => {
    const metadataUri = "https://da3z62f3lqfkdsdfhl5cssin2hrfcnec6qlhkyxg4aiwp23c3xea.arweave.net/GDefaLtcCqHIZTr6KUkN0eJRNIL0FnVi5uARZ-ti3cg";
    const post = await sdk.post.update(
      metadataUri,
      postPDA,
      profilePDA,
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

  // describe("GraphQL Post Queries", async () => {
  //   let userPubKey: anchor.web3.PublicKey;

  //   before(async () => {
  //     userPubKey = new anchor.web3.PublicKey("FRpvmB2dbFRxXWFXihAdQVKndnzFaK31yWfhS6CRHXpn");
  //   });

  //   describe("getAllPosts", async () => {
  //     let posts: any;

  //     before(async () => {
  //       posts = await sdk.post.getAllPosts();
  //     });

  //     it("should return an array of posts", async () => {
  //       expect(posts).to.be.an("array");
  //     });

  //     it("should return at least one post", async () => {
  //       expect(posts.length).to.be.greaterThan(0);
  //     });

  //     it("should return a post with a metadataUri", async () => {
  //       expect(posts[0].metadata_uri).to.be.a("string");
  //     });
  //   });

  //   describe("getPostsByUser", async () => {
  //     let posts: any;

  //     before(async () => {
  //       posts = await sdk.post.getPostsByUser(userPubKey);
  //     });

  //     it("should return an array of posts", async () => {
  //       expect(posts).to.be.an("array");
  //     });

  //     it("should return at least one post", async () => {
  //       expect(posts.length).to.be.greaterThan(0);
  //     });

  //     it("should return a post with a metadataUri", async () => {
  //       expect(posts[0].metadata_uri).to.be.a("string");
  //     });
  //   });
  // });
});