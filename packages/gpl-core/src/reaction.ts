import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";

export interface GraphQLReaction {
  from_profile: string;
  to_post: string;
  reaction_type: string;
  address: string;
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
    sessionTokenAccount: anchor.web3.PublicKey | null = null) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createReaction(reactionType)
      .accounts({
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        sessionToken: sessionTokenAccount,
        authority: owner,
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
    sessionTokenAccount: anchor.web3.PublicKey | null = null,
    refundReceiver: anchor.web3.PublicKey = owner) {
    return this.sdk.program.methods
      .deleteReaction()
      .accounts({
        reaction: reactionAccount,
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        authority: owner,
        sessionToken: sessionTokenAccount,
        refundReceiver,
      });
  }

  // // GraphQL Query methods

  // public async getAllReactions(): Promise<GraphQLReaction[]> {
  //   const query = gql`
  //     query GetAllReactions {
  //       reaction {
  //         to_post
  //         reaction_type
  //         from_profile
  //         address
  //         slot_created_at
  //         slot_updated_at
  //       }
  //   }`;
  //   const result = await this.sdk.gqlClient.request<{ reaction: GraphQLReaction[] }>(query);
  //   return result.reaction;
  // }

  // public async getReactionsByPost(postAccount: anchor.web3.PublicKey): Promise<GraphQLReaction[]> {
  //   const query = gql`
  //     query GetReactionsByPost($postAccount: String!) {
  //       reaction(where: {to_post: {_eq: $postAccount}}) {
  //         to_post
  //         reaction_type
  //         from_profile
  //         address
  //         slot_created_at
  //         slot_updated_at
  //       }
  //   }`;
  //   const result = await this.sdk.gqlClient.request<{ reaction: GraphQLReaction[] }>(query, { postAccount: postAccount.toBase58() });
  //   return result.reaction;
  // }
} 