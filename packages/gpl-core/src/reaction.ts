import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";

export interface GraphQLReaction {
  from_profile: string;
  to_post: string;
  reaction_type: string;
  address: string;
  refreshed_at?: Date;
  slot_created_at?: Date;
  slot_updated_at?: Date;
  created_at?: Date;
}


export class Reaction {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(reactionAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.reaction.fetch(reactionAccount);
  }

  public async create(
    fromProfileAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    reactionType: string,
    owner: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = owner) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createReaction(reactionType)
      .accounts({
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        sessionToken: null,
        authority: owner,
        payer: payer,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const reactionPDA = pubKeys.reaction as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      reactionPDA,
    };
  }

  public async createWithSession(
    fromProfileAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    reactionType: string,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = sessionPublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createReaction(reactionType)
      .accounts({
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        sessionToken: sessionTokenAccount,
        authority: sessionPublicKey,
        payer: payer,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const reactionPDA = pubKeys.reaction as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      reactionPDA,
    };
  }

  public delete(
    reactionAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    fromProfileAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey,
    refundReceiver: anchor.web3.PublicKey = owner) {
    return this.sdk.program.methods
      .deleteReaction()
      .accounts({
        reaction: reactionAccount,
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        authority: owner,
        sessionToken: null,
        refundReceiver,
      });
  }

  public deleteWithSession(
    reactionAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    fromProfileAccount: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey,
    refundReceiver: anchor.web3.PublicKey = sessionPublicKey) {
    return this.sdk.program.methods
      .deleteReaction()
      .accounts({
        reaction: reactionAccount,
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        authority: sessionPublicKey,
        sessionToken: sessionTokenAccount,
        refundReceiver,
      });
  }

  // GraphQL Query methods

  public async getAllReactions(): Promise<GraphQLReaction[]> {
    const query = gql`
      query GetAllReactions {
        reaction {
          to_post
          reaction_type
          from_profile
          address
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
    }`;
    const result = await this.sdk.gqlClient.request<{ reaction: GraphQLReaction[] }>(query);
    return result.reaction;
  }

  public async getReactionsByPost(postAccount: anchor.web3.PublicKey): Promise<GraphQLReaction[]> {
    const query = gql`
      query GetReactionsByPost($postAccount: String!) {
        reaction(where: {to_post: {_eq: $postAccount}}) {
          to_post
          reaction_type
          from_profile
          address
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
    }`;
    const result = await this.sdk.gqlClient.request<{ reaction: GraphQLReaction[] }>(query, { postAccount: postAccount.toBase58() });
    return result.reaction;
  }
}