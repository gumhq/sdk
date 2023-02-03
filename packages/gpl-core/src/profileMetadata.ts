import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";
import { Namespace } from "./profile";

export class ProfileMetadata {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileMetadataAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profileMetadata.fetch(profileMetadataAccount);
  }

  public async getProfileMetadataAccountsByUser(user: anchor.web3.PublicKey): Promise<anchor.ProgramAccount<any>[]> {
    const profiles = await this.sdk.profile.getProfileAccountsByUser(user);
    const profilePDAs = profiles.map((p) => p.publicKey);
    let profileMetadataList = [];
    for (const profilePDA of profilePDAs) {
      const profileMetadata = await this.sdk.program.account.profileMetadata.all([
        { memcmp: { offset: 8, bytes: profilePDA.toBase58() } },
      ])
      if (profileMetadata.length > 0) profileMetadataList = [...profileMetadataList, profileMetadata];
    }
    return profileMetadataList;
  }

  public async create(
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createProfileMetadata(metadataUri)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const profileMetadataPDA = pubKeys.profileMetadata as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
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

  // GraphQL Query methods

  public async getAllProfileMetadata(): Promise<any> {
    const query = gql`
      query GetAllProfileMetadata {
        gum_0_1_0_decoded_profilemetadata {
          cl_pubkey
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_profilemetadata;
  }

  public async getProfileMetadataByUser(userPubKey: anchor.web3.PublicKey): Promise<any> {
    const profiles = await this.sdk.profile.getProfilesByUser(userPubKey);
    const profilePDAs = profiles.map((p) => p.cl_pubkey) as anchor.web3.PublicKey[];
    const query = gql`
      query GetProfileMetadataByUser {
        gum_0_1_0_decoded_profilemetadata(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_profilemetadata;
  }

  public async getProfileMetadataByUserAndNamespace(userPubKey: anchor.web3.PublicKey, namespace: Namespace): Promise<any> {
    const profiles = await this.sdk.profile.getProfilesByUserAndNamespace(userPubKey, namespace);
    const profilePDAs = profiles.map((p) => p.cl_pubkey) as anchor.web3.PublicKey[];
    const query = gql`
      query GetProfileMetadataByUserAndNamespace {
        gum_0_1_0_decoded_profilemetadata(where: {profile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          cl_pubkey
          metadatauri
          profile
        }
      }`
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_profilemetadata;
  }
}
