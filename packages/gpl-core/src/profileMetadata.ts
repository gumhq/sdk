import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";
import { Namespace } from "./profile";
import axios from "axios";

export type ProfileMetadataType = {
  name: string;
  bio: string;
  username: string;
  avatar: string;
};

export class ProfileMetadata {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileMetadataAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profileMetadata.fetch(profileMetadataAccount);
  }

  /**
   * @deprecated This function is slow and may cause performance issues. Consider using getProfileMetadataByUser instead.
   */
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
    owner: anchor.web3.PublicKey) {
    // Validate Profile Metadata before creating
    if (!await this.validateProfileMetadata(metadataUri as string)) {
      throw new Error("Invalid profile metadata");
    }

    const instructionMethodBuilder = this.sdk.program.methods
      .createProfileMetadata(metadataUri)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: owner,
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
    owner: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .updateProfileMetadata(metadataUri)
      .accounts({
        profileMetadata: profileMetadataAccount,
        profile: profileAccount,
        user: userAccount,
        authority: owner,
      });
  }

  public delete(
    profileMetadataAccount: anchor.web3.PublicKey,
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deleteProfileMetadata()
      .accounts({
        profileMetadata: profileMetadataAccount,
        profile: profileAccount,
        user: userAccount,
        authority: owner,
      });
  }

  public async validateProfileMetadata(metadataUri: string): Promise<boolean> {
    try {
      const uri = new URL(metadataUri);
      if (!uri.protocol.startsWith("http")) {
        throw new Error("Invalid URI protocol, must be http or https");
      }

      const { data } = await axios.get<ProfileMetadataType>(metadataUri);

      // Check if all required fields are present
      const requiredFields: Array<keyof ProfileMetadataType> = ["name", "bio", "username", "avatar"];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`${field} is required but missing`);
        }
      }

      // Check if the type of the fields are correct
      const fields = ["name", "bio", "username", "avatar"];
      for (const field of fields) {
        if (typeof data[field] !== "string") {
          throw new Error(`${field} must be a string`);
        }
      }

      // Check if avatar is a valid URI
      const avatarUri = new URL(data.avatar);
      if (!avatarUri.protocol.startsWith("http")) {
        throw new Error("Invalid avatar URI protocol, must be http or https");
      }

      // Check if the length of the fields are correct
      if (data.name.length > 32) {
        throw new Error("Name must be 32 characters or fewer");
      }

      if (data.username.length > 32) {
        throw new Error("Username must be 32 characters or fewer");
      }

      // Check if the fields are empty
      if (data.name.trim() === "") {
        throw new Error("Name cannot be empty");
      }

      if (data.username.trim() === "") {
        throw new Error("Username cannot be empty");
      }

      return true;
    } catch (error) {
      throw new Error(`Error validating profile metadata: ${error.message}`);
    }
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
