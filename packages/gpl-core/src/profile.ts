import { SDK } from ".";
import { gql } from "graphql-request";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";

export interface GumDecodedProfile {
  address: string;
  screen_name: string;
  authority: string;
  metadata_uri: string;
  slot_created_at: number;
  slot_updated_at: number;
}

export class Profile {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profile.fetch(profileAccount);
  }


  /**
   * Gets or creates a profile for a given user account and namespace.
   * 
   * To use this method, you must first initialize an instance of the SDK and pass a GraphQL client to the constructor.
   * The client will be used to fetch profile information.
   */
  public async getOrCreate(
    metadataUri: String,
    screenNameAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = authority): Promise<anchor.web3.PublicKey> {
    try {
      const profile = await this.getProfile(screenNameAccount, authority);
      if (profile?.address) {
        const { address: profilePDAstr } = profile;
        return new anchor.web3.PublicKey(profilePDAstr);
      }
      const { profilePDA, instructionMethodBuilder } = await this.create(metadataUri, screenNameAccount, authority, payer);
      await instructionMethodBuilder.rpc();
      return profilePDA;
    } catch (e) {
      throw new Error(`Error getting or creating profile: ${e.message}`);
    }
  }

  public async create(
    metadataUri: String,
    screenNameAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = authority) {
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      // @ts-ignore
      .createProfile(randomHash, metadataUri)
      .accounts({
        screenName: screenNameAccount,
        authority,
        payer,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const profilePDA = pubKeys.profile as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      profilePDA,
    };
  }

  public async update(
    metadataUri: String,
    profileAccount: anchor.web3.PublicKey,
    screenNameAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      // @ts-ignore
      .updateProfile(metadataUri)
      .accounts({
        profile: profileAccount,
        screenName: screenNameAccount,
        authority
      })
  }

  public delete(
    profileAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    return program.methods
      .deleteProfile()
      .accounts({
        profile: profileAccount,
        authority
      })
  }

  // GraphQL API methods

  public async getProfile(screenNameAccount: anchor.web3.PublicKey, authority: anchor.web3.PublicKey): Promise<GumDecodedProfile> {
    const query = gql`
      query GetProfile ($screenName: String, $authority: String) {
        profile(
          where: {
            screen_name: { _eq: $screenName },
            authority: { _eq: $authority }
          }
        ) {
          address
          screen_name
          authority
          metadata_uri
          slot_created_at
          slot_updated_at
        }
      }`;

    const variables = {
      screenName: screenNameAccount.toBase58(),
      authority: authority.toBase58()
    };

    const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, variables);
    return data.profile[0];
  }

  public async getAllProfiles(): Promise<GumDecodedProfile[]> {
    const query = gql`
      query AllProfiles {
        profile {
          address
          screen_name
          authority
          metadata_uri
          slot_created_at
          slot_updated_at
        }
      }`;
    const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query);
    return data.profile;
  }

  public async getProfilesByAuthority(authority: anchor.web3.PublicKey): Promise<GumDecodedProfile[]> {
      const query = gql`
        query ProfilesByAuthority ($authority: String) {
          profile(
            where: {
              authority: { _eq: $authority }
            }
          ) {
            address
            screen_name
            authority
            metadata_uri
            slot_created_at
            slot_updated_at
          }
        }
        `;
      const variables = {
        authority: authority.toBase58(),
      };

      const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, variables);
      return data.profile;
  }

  public async getProfilesByScreenName(screenNameAccount: anchor.web3.PublicKey): Promise<GumDecodedProfile[]> {
      const query = gql`
        query ProfilesByScreenName ($screenName: String) {
          profile(where: { screen_name: { _eq: $screenName } }) {
            address
            screen_name
            authority
            metadata_uri
            slot_created_at
            slot_updated_at
          }
        }
      `;
      const variables = {
        screenName: screenNameAccount.toBase58(),
      };

      const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, variables);
      return data.profile;
  }

  public async getProfilesByProfileAccount(profileAccount: anchor.web3.PublicKey): Promise<GumDecodedProfile[]> {
      const query = gql`
        query ProfilesByProfileAccount ($profileAccount: String) {
          profile(where: { address: { _eq: $profileAccount } }) {
            address
            screen_name
            authority
            metadata_uri
            slot_created_at
            slot_updated_at
          }
        }
      `;
      const variables = {
        profileAccount: profileAccount.toBase58(),
      };

      const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, variables);
      return data.profile;
  }
}