import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import { PostMetadata } from "./postMetadata";
import axios from "axios";
import { gql } from "graphql-request";

export interface GraphQLPost {
  address: string;
  metadata: any;
  metadata_uri: string;
  profile: string;
  random_hash: number;
  reply_to?: string;
  refreshed_at?: Date;
  slot_created_at?: Date;
  slot_updated_at?: Date;
  created_at?: Date;
}

export interface GraphQLFeed extends GraphQLPost { }

export class Post {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(postAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.post.fetch(postAccount);
  }

  public async create(
    metadataUri: string,
    profileAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = owner) {
    const metadata = await axios.get(metadataUri);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      // @ts-ignore
      .createPost(metadataUri, randomHash)
      .accounts({
        profile: profileAccount,
        sessionToken: null,
        authority: owner,
        payer: payer,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const postPDA = pubKeys.post as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      postPDA,
    };
  }

  public async createWithSession(
    metadataUri: string,
    profileAccount: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = sessionPublicKey) {
    const metadata = await axios.get(metadataUri);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      // @ts-ignore
      .createPost(metadataUri, randomHash)
      .accounts({
        profile: profileAccount,
        sessionToken: sessionTokenAccount,
        authority: sessionPublicKey,
        payer: payer,
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
    owner: anchor.web3.PublicKey) {

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
        sessionToken: null,
        authority: owner,
      });
  }

  public async updateWithSession(
    newMetadataUri: string,
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey) {

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
        sessionToken: sessionTokenAccount,
        authority: sessionPublicKey,
      });
  }

  public delete(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    refundReceiver: anchor.web3.PublicKey = owner) {
    return this.sdk.program.methods
      .deletePost()
      .accounts({
        post: postAccount,
        profile: profileAccount,
        sessionToken: null,
        authority: owner,
        refundReceiver,
      });
  }

  public deleteWithSession(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey,
    refundReceiver: anchor.web3.PublicKey = sessionPublicKey) {
    return this.sdk.program.methods
      .deletePost()
      .accounts({
        post: postAccount,
        profile: profileAccount,
        sessionToken: sessionTokenAccount,
        authority: sessionPublicKey,
        refundReceiver,
      });
  }

  public async reply(
    replyToPostAccount: anchor.web3.PublicKey,
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = owner
  ) {
    const metadata = await axios.get(metadataUri as string);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      // @ts-ignore
      .createComment(metadataUri, randomHash)
      .accounts({
        profile: profileAccount,
        authority: owner,
        replyTo: replyToPostAccount,
        sessionToken: null,
        payer: payer,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const postPDA = pubKeys.post as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      postPDA,
    };
  }

  public async replyWithSession(
    replyToPostAccount: anchor.web3.PublicKey,
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = sessionPublicKey
  ) {
    const metadata = await axios.get(metadataUri as string);
    const postMetadata = new PostMetadata(metadata.data);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      // @ts-ignore
      .createComment(metadataUri, randomHash)
      .accounts({
        profile: profileAccount,
        authority: sessionPublicKey,
        replyTo: replyToPostAccount,
        sessionToken: sessionTokenAccount,
        payer: payer,
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
          reply_to
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query);
    return data.post;
  }

  public async getPostsByProfile(profilePubKey: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
    const query = gql`
      query GetPostsByProfile ($profilePubKey: String) {
        post(where: {profile: {_eq: $profilePubKey}}) {
          address
          metadata
          metadata_uri
          profile
          random_hash
          reply_to
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }`
    const variables = {
      profilePubKey: profilePubKey.toBase58(),
    };
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query, variables);
    return data.post;
  }

  public async getPostsByAuthority(authorityPubKey: anchor.web3.PublicKey): Promise<GraphQLPost[]> {
      // get all the profiles owned by the authority
      const profiles = await this.sdk.profile.getProfilesByAuthority(authorityPubKey);
      const profilePubKeys = profiles.map(profile => profile.address);
      const query = gql`
        query GetPostsByAuthority ($profilePubKeys: [String!]) {
          post(where: {profile: {_in: $profilePubKeys}}) {
            address
            metadata
            metadata_uri
            profile
            random_hash
            reply_to
            refreshed_at
            slot_created_at
            slot_updated_at
            created_at
          }
        }`
      const variables = {
        profilePubKeys,
      };

      const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query, variables);
      return data.post;
  }


  public async getFeedsByFollowedUsers(profileAccount: anchor.web3.PublicKey): Promise<GraphQLFeed[]> {
    const followedUsersProfileAccounts = await this.sdk.connection.getFollowingsByProfile(profileAccount);
    const query = gql`
      query GetFeedsByFollowedUsers ($followedUsersProfileAccounts: [String!]) {
        post(where: {profile: {_in: $followedUsersProfileAccounts}}) {
          address
          metadata
          metadata_uri
          profile
          random_hash
          reply_to
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }
    `;
    const variables = {
      followedUsersProfileAccounts,
    };
    const data = await this.sdk.gqlClient.request<{ post: GraphQLPost[] }>(query, variables);
    const feed = data.post;
    return feed;
  }
}