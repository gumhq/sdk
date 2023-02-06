import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import { PostMetadata } from "./postmetadata";
import axios from "axios";
import { gql } from "graphql-request";

export class Post {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(postAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.post.fetch(postAccount);
  }

  public async getPostAccountsByUser(userPubKey: anchor.web3.PublicKey): Promise<anchor.ProgramAccount<any>[]> {
    const profiles = await this.sdk.profile.getProfileAccountsByUser(userPubKey);
    const profilePDAs = profiles.map((p) => p.publicKey);
    let posts = [];
    for (const profilePDA of profilePDAs) {
      const post = await this.sdk.program.account.post.all([
        { memcmp: { offset: 8, bytes: profilePDA.toBase58() } },
      ]);
      posts = [...posts, ...post];
    }
    return posts;
  }

  public async create(
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    const metadata = await axios.get(metadataUri as string);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }

    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      .createPost(metadataUri, randomHash)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: owner,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const postPDA = pubKeys.post as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      postPDA,
    };
  }

  public async update(
    newMetadataUri: String,
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {

    const metadata = await axios.get(newMetadataUri as string);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }

    return this.sdk.program.methods
      .updatePost(newMetadataUri)
      .accounts({
        post: postAccount,
        profile: profileAccount,
        user: userAccount,
        authority: owner,
      });
  }


  public delete(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deletePost()
      .accounts({
        post: postAccount,
        profile: profileAccount,
        user: userAccount,
        authority: owner,
      });
  }

  // GraphQL Query methods

  public async getAllPosts() {
    const query = gql`
      query GetAllPosts {
        gum_0_1_0_decoded_post {
          cl_pubkey
          metadatauri
          profile
          randomhash
        }
      }`
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_post;
  }

  public async getPostsByUser(userPubKey: anchor.web3.PublicKey) {
    const profiles = await this.sdk.profile.getProfilesByUser(userPubKey);
    const profilePDAs = profiles.map((p) => p.cl_pubkey) as anchor.web3.PublicKey[];
    const query = gql`
      query GetPostsByUser {
        gum_0_1_0_decoded_post(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadatauri
          profile
          randomhash
        }
      }`
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_post;
  }
}