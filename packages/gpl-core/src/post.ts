import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import { PostMetadata } from "./postMetadata";
import axios from "axios";
import { gql } from "graphql-request";
import { Namespace } from "./profile";

export interface GraphQLPost {
  address: string;
  metadata: string;
  metadata_uri: string;
  profile: string;
}

export interface GraphQLFeed {
  address: string;
  metadata: string;
  metadata_uri: string;
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
    metadataUri: string,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey | null = null) {
    const metadata = await axios.get(metadataUri);
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
        sessionToken: sessionTokenAccount,
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
    newMetadataUri: string,
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey | null = null) {

    const metadata = await axios.get(newMetadataUri);
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
        sessionToken: sessionTokenAccount,
        authority: owner,
      });
  }

  public delete(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey | null = null,
    refundReceiver: anchor.web3.PublicKey = owner) {
    return this.sdk.program.methods
      .deletePost()
      .accounts({
        post: postAccount,
        profile: profileAccount,
        user: userAccount,
        sessionToken: sessionTokenAccount,
        authority: owner,
        refundReceiver,
      });
  }
  
  public async reply(
    replyToPostAccount: anchor.web3.PublicKey,
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey | null = null
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
        sessionToken: sessionTokenAccount,
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
        post {
          address
          metadata
          metadata_uri
          profile
          slot_created_at
          slot_updated_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    return data.post;
  }

  public async getPostsByUser(userPubKey: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const profiles = await this.sdk.profile.getProfilesByUser(userPubKey);
    const profilePDAs = profiles.map((p) => p.address) as string[];
    const query = gql`
      query GetPostsByUser {
        post(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          address
          metadata
          metadata_uri
          profile
          slot_created_at
          slot_updated_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    return data.post;
  }

  public async getPostsByProfile(profilePubKey: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const query = gql`
      query GetPostsByProfile {
        post(where: {profile: {_eq: "${profilePubKey}"}}) {
          address
          metadata
          metadata_uri
          profile
          slot_created_at
          slot_updated_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    return data.post;
  }

  public async getPostsByNamespace(namespace: Namespace): Promise<GraphQLPost[]> {
    const profiles = await this.sdk.profile.getProfilesByNamespace(namespace);
    const profilePDAs = profiles.map((p) => p.address) as string[];
    const query = gql`
      query GetPostsByNamespace {
        post(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          address
          metadata
          metadata_uri
          profile
          slot_created_at
          slot_updated_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    return data.post;
  }

  public async getPostsByFollowedUsers(profileAccount: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const followedUsersProfileAccounts = await this.sdk.connection.getFollowingsByProfile(profileAccount);
    const query = gql`
      query GetPostsByFollowedUsers {
        post(where: {profile: {_in: [${followedUsersProfileAccounts.map((pda) => `"${pda}"`).join(",")}] }}) {
          address
          metadata
          metadata_uri
          profile
          slot_created_at
          slot_updated_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    return data.post;
  }

  public async getFeedsByFollowedUsers(profileAccount: anchor.web3.PublicKey): Promise<GraphQLFeed[]> {
    const followedUsersProfileAccounts = await this.sdk.connection.getFollowingsByProfile(profileAccount);
    const query = gql`
      query GetFeedsByFollowedUsers {
        post(where: {profile: {_in: [${followedUsersProfileAccounts.map((pda) => `"${pda}"`).join(",")}] }}) {
          address
          metadata
          metadata_uri
          profile
          slot_created_at
          slot_updated_at
        }
      }
    `;
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    const feed = await Promise.all(data.post.map(async (post: GraphQLPost) => {
      const profileData = await this.sdk.profileMetadata.getProfileMetadataByProfile(new anchor.web3.PublicKey(post.profile));
      return {
        address: post.address,
        metadata: post.metadata,
        metadata_uri: post.metadata_uri,
        profile: profileData.profile,
        profile_metadata: profileData.metadata,
        profile_metadata_uri: profileData.metadata_uri,
      };
    }));
    return feed;
  }
}