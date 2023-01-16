import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randombytes from "randombytes";
import { SEED_PREFIXES } from "./constants";

export enum ReactionType {
  Like,
  Dislike,
  Love,
  Haha,
  Wow,
  Sad,
  Angry,
}

export class Reaction {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  reactionPDA(fromProfile: anchor.web3.PublicKey, 
    toProfile: anchor.web3.PublicKey,
    reactionType: ReactionType
    ) {
    const { program } = this.sdk;
    return anchor.web3.PublicKey.findProgramAddressSync(
      [SEED_PREFIXES["reaction"], 
       Buffer.from(reactionType.toString()), 
       fromProfile.toBuffer(), 
       toProfile.toBuffer()],
      program.programId
    );
  }

  public async create(
    fromProfileAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    reactionType: ReactionType,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const [reactionAccount, _] = 
      this.reactionPDA(fromProfileAccount, toPostAccount, reactionType);
    const reactionIx = program.methods
    .createReaction(reactionType)
    .accounts({
      reaction: reactionAccount,
      toPost: toPostAccount,
      fromProfile: fromProfileAccount,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return reactionIx;
  }

  public async delete(
    reactionAccount: anchor.web3.PublicKey,
    fromProfileAccount: anchor.web3.PublicKey,
    toPostAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const reactionIx = program.methods
    .deleteReaction()
    .accounts({
      reaction: reactionAccount,
      toPost: toPostAccount,
      fromProfile: fromProfileAccount,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return reactionIx;
  }
}