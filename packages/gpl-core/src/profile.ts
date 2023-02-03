import { SDK } from ".";
import { gql } from "graphql-request";
import * as anchor from "@project-serum/anchor";

export type Namespace = "Professional" | "Personal" | "Gaming" | "Degen";

export interface GumDecodedProfile {
  username: anchor.web3.PublicKey;
  namespace: string;
  cl_pubkey: anchor.web3.PublicKey;
}

export class Profile {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profile.fetch(profileAccount);
  }

  public async getProfileAccountsByUser(user: anchor.web3.PublicKey): Promise<anchor.ProgramAccount<any>[]> {
    const users = await this.sdk.user.getUserAccountsByUser(user);
    const userPDAs = users.map((u) => u.publicKey);
    let profiles = [];
    for (const userPDA of userPDAs) {
      const profile = await this.sdk.program.account.profile.all([
        { memcmp: { offset: 8, bytes: userPDA.toBase58() } },
      ]);
      profiles = [...profiles, ...profile];
    }
    return profiles;
  }

  public async create(
    userAccount: anchor.web3.PublicKey,
    namespace: Namespace,
    user: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createProfile(namespace)
      .accounts({
        user: userAccount,
        authority: user,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const profilePDA = pubKeys.profile as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      profilePDA,
    };
  }

  public delete(
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    return program.methods
      .deleteProfile()
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      })
  }

  // GraphQL API methods

  public async getAllProfiles(): Promise<GumDecodedProfile[]> {
    const query = gql`
      query AllProfiles {
        gum_0_1_0_decoded_profile {
          username
          namespace
          cl_pubkey
        }
      }`;
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_profile;
  }

  public async getProfilesByUser(userPubkey: anchor.web3.PublicKey): Promise<GumDecodedProfile[]> {
    const users = await this.sdk.user.getUserAccountsByAuthority(userPubkey);
    const userPDAs = users.map(user => user.cl_pubkey) as anchor.web3.PublicKey[];
    const query = gql`
      query UserProfiles {
        gum_0_1_0_decoded_profile(
          where: {username: {_in: [${userPDAs.map(pda => `"${pda}"`).join(',')}] }}
        ) {
          username
          namespace
          cl_pubkey
        }
      }
      `;
    const data = await this.sdk.gqlClient.request(query);
    return data.gum_0_1_0_decoded_profile;
  }

  public async getProfilesByNamespace(namespace: Namespace): Promise<GumDecodedProfile[]> {
    const namespaceString = JSON.stringify({ [namespace.toLowerCase()]: {} });
    const query = gql`
      query ProfilesByNamespace ($namespace: String) {
        gum_0_1_0_decoded_profile(where: { namespace: { _eq: $namespace } }) {
          username
          namespace
          cl_pubkey
        }
      }
    `;
    const data = await this.sdk.gqlClient.request(query, { namespace: namespaceString });
    return data.gum_0_1_0_decoded_profile;
  }

  public async getProfilesByUserAndNamespace(userPubkey: anchor.web3.PublicKey, namespace: Namespace): Promise<GumDecodedProfile[]> {
    const users = await this.sdk.user.getUserAccountsByAuthority(userPubkey);
    const userPDAs = users.map(user => user.cl_pubkey) as anchor.web3.PublicKey[];
    const namespaceString = JSON.stringify({ [namespace.toLowerCase()]: {} });
    const query = gql`
      query ProfileByUserAndNamespace ($namespace: String) {
        gum_0_1_0_decoded_profile(
          where: {
            username: {_in: [${userPDAs.map(pda => `"${pda}"`).join(',')}] },
            namespace: { _eq: $namespace }
          }
        ) {
          username
          namespace
          cl_pubkey
        }
      }
    `;
    const data = await this.sdk.gqlClient.request(query, { namespace: namespaceString });
    return data.gum_0_1_0_decoded_profile;
  }
}