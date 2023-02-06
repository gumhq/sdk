import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";

export type ReactionType = "Like" | "Dislike" | "Love" | "Haha" | "Wow" | "Sad" | "Angry";

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
    reactionType: ReactionType,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createReaction(reactionType)
      .accounts({
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        user: userAccount,
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
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deleteReaction()
      .accounts({
        reaction: reactionAccount,
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        user: userAccount,
        authority: owner,
      });
  }

  // GraphQL Query methods

  public async getAllReactions() {
    const query = gql`
      query GetAllReactions {
        gum_0_1_0_decoded_reaction {
          topost
          reactiontype
          fromprofile
          cl_pubkey
        }
    }`;
    const result = await this.sdk.gqlClient.request(query);
    return result.gum_0_1_0_decoded_reaction;
  }

  public async getReactionsByPost(postAccount: anchor.web3.PublicKey) {
    const query = gql`
      query GetReactionsByPost($postAccount: String!) {
        gum_0_1_0_decoded_reaction(where: {topost: {_eq: $postAccount}}) {
          topost
          reactiontype
          fromprofile
          cl_pubkey
        }
    }`;
    const result = await this.sdk.gqlClient.request(query, { postAccount: postAccount.toBase58() });
    return result.gum_0_1_0_decoded_reaction;
  }
} 