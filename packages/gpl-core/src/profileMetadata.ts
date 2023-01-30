import { SDK } from ".";
import * as anchor from "@project-serum/anchor";

export class ProfileMetadata {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileMetadataAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profileMetadata.fetch(profileMetadataAccount);
  }

  public async create(
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const program = this.sdk.program.methods
      .createProfileMetadata(metadataUri)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
    const pubKeys = await program.pubkeys();
    const profileMetadataPDA = pubKeys.profileMetadata as anchor.web3.PublicKey;
    return {
      program,
      profileMetadataPDA,
    };
  }

  public update(
    metadataUri: String,
    profileMetadataAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .updateProfileMetadata(metadataUri)
      .accounts({
        profileMetadata: profileMetadataAccount,
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
  }

  public delete(
    profileMetadataAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deleteProfileMetadata()
      .accounts({
        profileMetadata: profileMetadataAccount,
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
  }
}
