import { SDK } from ".";
import { gql } from "graphql-request";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";

export interface GumDecodedProfile {
  user: string;
  address: string;
}

export class Profile {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profile.fetch(profileAccount);
  }

  // /**
  //  * @deprecated This function is slow and may cause performance issues. Consider using getProfilesByUser instead.
  //  */
  // public async getProfileAccountsByUser(user: anchor.web3.PublicKey): Promise<anchor.ProgramAccount<any>[]> {
  //   const users = await this.sdk.user.getUserAccountsByUser(user);
  //   const userPDAs = users.map((u) => u.publicKey);
  //   let profiles = [];
  //   for (const userPDA of userPDAs) {
  //     const profile = await this.sdk.program.account.profile.all([
  //       { memcmp: { offset: 8, bytes: userPDA.toBase58() } },
  //     ]);
  //     profiles = [...profiles, ...profile];
  //   }
  //   return profiles;
  // }

  // /**
  //  * Gets or creates a profile for a given user account and namespace.
  //  * 
  //  * To use this method, you must first initialize an instance of the SDK and pass a GraphQL client to the constructor.
  //  * The client will be used to fetch profile information.
  //  */
  // public async getOrCreate(
  //   metadataUri: String,
  //   screenNameAccount: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> {
  //   try {
  //     const profile = await this.getProfile(userAccount, namespace);
  //     if (profile?.user && profile?.namespace && profile?.address) {
  //       const { address: profilePDAstr } = profile;
  //       return new anchor.web3.PublicKey(profilePDAstr);
  //     }

  //     const profilePDA = await this.createProfileWithProfileMetadata(metadataUri, userAccount, namespace, owner);
  //     return profilePDA;
  //   } catch (e) {
  //     throw new Error(`Error getting or creating profile: ${e.message}`);
  //   }
  // }

  public async create(
    metadataUri: String,
    screenNameAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey) {
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      .createProfile(randomHash, metadataUri)
      .accounts({
        screenName: screenNameAccount,
        authority
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

  // // GraphQL API methods

  // public async getProfile(userAccount: anchor.web3.PublicKey): Promise<GumDecodedProfile> {
  //   const query = gql`
  //     query GetProfile ($userAccount: String, $namespace: jsonb) {
  //       profile(
  //         where: {
  //           user: { _eq: $userAccount },
  //           namespace: { _eq: $namespace }
  //         }
  //       ) {
  //         address
  //         namespace
  //         user
  //         slot_created_at
  //         slot_updated_at
  //       }
  //     }`;

  //   const variables = {
  //     userAccount: userAccount.toBase58(),
  //     namespace: { [namespace.toLowerCase()]: {} },
  //   };

  //   const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, variables);
  //   return data.profile[0];
  // }

  // public async getAllProfiles(): Promise<GumDecodedProfile[]> {
  //   const query = gql`
  //     query AllProfiles {
  //       profile {
  //         user
  //         namespace
  //         address
  //         slot_created_at
  //         slot_updated_at
  //       }
  //     }`;
  //   const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query);
  //   return data.profile;
  // }

  // public async getProfilesByUser(userPubkey: anchor.web3.PublicKey): Promise<GumDecodedProfile[]> {
  //   const users = await this.sdk.user.getUserAccountsByAuthority(userPubkey);
  //   const userPDAs = users.map(user => user.address) as string[];
  //   const query = gql`
  //     query UserProfiles {
  //       profile(
  //         where: {user: {_in: [${userPDAs.map(pda => `"${pda}"`).join(',')}] }}
  //       ) {
  //         user
  //         namespace
  //         address
  //         slot_created_at
  //         slot_updated_at
  //       }
  //     }
  //     `;
  //   const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query);
  //   return data.profile;
  // }

  // public async getProfilesByNamespace(namespace: Namespace): Promise<GumDecodedProfile[]> {
  //   const namespaceString = { [namespace.toLowerCase()]: {} };
  //   const query = gql`
  //     query ProfilesByNamespace ($namespace: jsonb) {
  //       profile(where: { namespace: { _eq: $namespace } }) {
  //         user
  //         namespace
  //         address
  //         slot_created_at
  //         slot_updated_at
  //       }
  //     }
  //   `;
  //   const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, { namespace: namespaceString });
  //   return data.profile;
  // }

  // public async getProfilesByUserAndNamespace(userPubkey: anchor.web3.PublicKey, namespace: Namespace): Promise<GumDecodedProfile> {
  //   const users = await this.sdk.user.getUserAccountsByAuthority(userPubkey);
  //   const userPDAs = users.map(user => user.address) as string[];
  //   const namespaceString = { [namespace.toLowerCase()]: {} };
  //   const query = gql`
  //     query ProfileByUserAndNamespace ($namespace: jsonb) {
  //       profile(
  //         where: {
  //           user: {_in: [${userPDAs.map(pda => `"${pda}"`).join(',')}] },
  //           namespace: { _eq: $namespace }
  //         }
  //       ) {
  //         user
  //         namespace
  //         address
  //         slot_created_at
  //         slot_updated_at
  //       }
  //     }
  //   `;
  //   const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, { namespace: namespaceString });
  //   return data.profile[0];
  // }
}