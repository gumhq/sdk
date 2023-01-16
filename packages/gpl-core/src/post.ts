import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randombytes from "randombytes";
import { SEED_PREFIXES } from "./constants";

export class Post {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  postPDA(randomHash: Buffer) {
    const { program } = this.sdk;
    return anchor.web3.PublicKey.findProgramAddressSync(
      [SEED_PREFIXES["post"], randomHash],
      program.programId
    );
  }

  public async create(
    metadata: String, 
    randomHash: Buffer,
    profileAccount: anchor.web3.PublicKey, 
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const [postAccount, _] = this.postPDA(randombytes(32));
    const postIx = program.methods
    .createPost(metadata, randomHash)
    .accounts({
      post: postAccount,
      profile: profileAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return postIx;
  }

  public async update(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    newMetadata: String,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const postIx = program.methods
    .updatePost(newMetadata)
    .accounts({
      post: postAccount,
      profile: profileAccount,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return postIx;
  }


  public async delete(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey, 
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const postIx = program.methods
    .deleteProfile()
    .accounts({
      post: postAccount,
      profile: profileAccount,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    return postIx;
  }
}