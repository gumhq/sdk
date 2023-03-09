import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import { PostMetadata } from "./postmetadata";
import axios from "axios";
import { gql } from "graphql-request";
import { Namespace } from "./profile";

export interface GraphQLPost {
  cl_pubkey: string;
  metadata: string;
  metadatauri: string;
  profile: string;
}

export interface GraphQLFeed {
  cl_pubkey: string;
  metadata: string;
  metadatauri: string;
  profile: string;
  profile_metadata: string;
  profile_metadata_uri: string;
}
  
export class Post {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(postAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.post.fetch(postAccount);
  }

  /**
   * @deprecated This function is slow and may cause performance issues. Consider using getPostsByUser instead.
   */
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
  public async reply(
    replyToPostAccount: anchor.web3.PublicKey,
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const metadata = await axios.get(metadataUri as string);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      .createComment(metadataUri, randomHash)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: owner,
        replyTo: replyToPostAccount,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const postPDA = pubKeys.post as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      postPDA,
    };
  }

  // GraphQL Query methods

  public async getAllPosts(): Promise<GraphQLPost[]> {
    const query = gql`
      query GetAllPosts {
        gum_0_1_0_decoded_post {
          cl_pubkey
          metadata
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_post: GraphQLPost[]}>(query);
    return data.gum_0_1_0_decoded_post;
  }

  public async getPostsByUser(userPubKey: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const profiles = await this.sdk.profile.getProfilesByUser(userPubKey);
    const profilePDAs = profiles.map((p) => p.cl_pubkey) as string[];
    const query = gql`
      query GetPostsByUser {
        gum_0_1_0_decoded_post(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadata
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_post: GraphQLPost[]}>(query);
    return data.gum_0_1_0_decoded_post;
  }

  public async getPostsByProfile(profilePubKey: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const query = gql`
      query GetPostsByProfile {
        gum_0_1_0_decoded_post(where: {profile: {_eq: "${profilePubKey}"}}) {
          cl_pubkey
          metadata
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_post: GraphQLPost[]}>(query);
    return data.gum_0_1_0_decoded_post;
  }

  public async getPostsByNamespace(namespace: Namespace): Promise<GraphQLPost[]> {
    const profiles = await this.sdk.profile.getProfilesByNamespace(namespace);
    const profilePDAs = profiles.map((p) => p.cl_pubkey) as string[];
    const query = gql`
      query GetPostsByNamespace {
        gum_0_1_0_decoded_post(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadata
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_post: GraphQLPost[]}>(query);
    return data.gum_0_1_0_decoded_post;
  }

  public async getPostsByFollowedUsers(profileAccount: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const followedUsersProfileAccounts = await this.sdk.connection.getFollowingsByProfile(profileAccount);
    const query = gql`
      query GetPostsByFollowedUsers {
        gum_0_1_0_decoded_post(where: {profile: {_in: [${followedUsersProfileAccounts.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadata
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_post: GraphQLPost[]}>(query);
    return data.gum_0_1_0_decoded_post;
  }

  public async getFeedsByFollowedUsers(profileAccount: anchor.web3.PublicKey): Promise<GraphQLFeed[]> {
    const followedUsersProfileAccounts = await this.sdk.connection.getFollowingsByProfile(profileAccount);
    const query = gql`
      query GetFeedsByFollowedUsers {
        gum_0_1_0_decoded_post(where: {profile: {_in: [${followedUsersProfileAccounts.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadata
          metadatauri
          profile
        }
      }
    `;
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_post: GraphQLPost[]}>(query);
    const feed = await Promise.all(data.gum_0_1_0_decoded_post.map(async (post: GraphQLPost) => {
      const profileData = await this.sdk.profileMetadata.getProfileMetadataByProfile(new anchor.web3.PublicKey(post.profile));
      return {
        cl_pubkey: post.cl_pubkey,
        metadata: post.metadata,
        metadatauri: post.metadatauri,
        profile: profileData.profile,
        profile_metadata: profileData.metadata,
        profile_metadata_uri: profileData.metadatauri,
      };
    }));
    return feed;
  }
}