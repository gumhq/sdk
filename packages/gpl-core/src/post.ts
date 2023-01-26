import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";

export class Post {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(postAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.post.fetch(postAccount);
  }

  public async create(
    metadata: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const randomHash = randomBytes(32);
    const program = this.sdk.program.methods
      .createPost(metadata, randomHash)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
    const pubKeys = await program.pubkeys();
    const postPDA = pubKeys.post as anchor.web3.PublicKey;
    return {
      program,
      postPDA,
    };
  }

  public update(
    newMetadata: String,
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .updatePost(newMetadata)
      .accounts({
        post: postAccount,
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
  }


  public delete(
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deletePost()
      .accounts({
        post: postAccount,
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
  }
}