import { SDK } from ".";
import * as anchor from "@project-serum/anchor";

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
    user: anchor.web3.PublicKey) {
    const program = this.sdk.program.methods
      .createReaction(reactionType)
      .accounts({
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        user: userAccount,
        authority: user,
      });
    const pubKeys = await program.pubkeys();
    const reactionPDA = pubKeys.reaction as anchor.web3.PublicKey;
    return {
      program,
      reactionPDA,
    };
  }

  public delete(
    reactionAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    fromProfileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deleteReaction()
      .accounts({
        reaction: reactionAccount,
        toPost: toPostAccount,
        fromProfile: fromProfileAccount,
        user: userAccount,
        authority: user,
      });
  }
}