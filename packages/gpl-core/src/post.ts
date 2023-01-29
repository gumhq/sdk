import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import { PostMetadata } from "./postmetadata";
import axios from "axios";

export class Post {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(postAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.post.fetch(postAccount);
  }

  public async create(
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {

    const metadata = await axios.get(metadataUri as string);
    const postMetadata = new PostMetadata(metadata);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }

    const randomHash = randomBytes(32);
    const program = this.sdk.program.methods
      .createPost(metadataUri, randomHash)
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

  public async update(
    newMetadataUri: String,
    postAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {

    const metadata = await axios.get(newMetadataUri as string);
    const postMetadata = new PostMetadata(metadata);
    if (!postMetadata.validate()) {
      throw new Error("Invalid post metadata");
    }

    return this.sdk.program.methods
      .updatePost(newMetadataUri)
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