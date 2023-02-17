import { SDK } from ".";
import { gql } from "graphql-request";
import * as anchor from "@project-serum/anchor";
import { MethodsBuilder } from "@project-serum/anchor/dist/cjs/program/namespace/methods";
import { IdlInstruction } from "@project-serum/anchor/dist/cjs/idl";

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
    console.warn('Warning: getProfileAccountsByUser is slow and may cause performance issues. Consider using getProfilesByUser instead.');
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

  public async getOrCreateProfile(
    userAccount: anchor.web3.PublicKey,
    namespace: Namespace,
    owner: anchor.web3.PublicKey): Promise<{
      instructionMethodBuilder?: MethodsBuilder<anchor.Idl, IdlInstruction>;
      profilePDA: anchor.web3.PublicKey;
      username?: anchor.web3.PublicKey;
      namespace?: Namespace;
    }> {
    try {
      const profile = await this.getProfile(userAccount, namespace);
      if (profile?.username && profile?.namespace && profile?.cl_pubkey) {
        const { username: usernameStr, namespace: namespaceStr, cl_pubkey: profilePDAstr } = profile;
        return {
          username: new anchor.web3.PublicKey(usernameStr),
          profilePDA: new anchor.web3.PublicKey(profilePDAstr),
          namespace: namespaceStr as Namespace,
        };
      }

      const { instructionMethodBuilder, profilePDA } = await this.create(userAccount, namespace, owner);
      return {
        instructionMethodBuilder,
        profilePDA
      };
    } catch (e) {
      throw new Error(`Error getting or creating profile: ${e.message}`);
    }
  }

  public async create(
    userAccount: anchor.web3.PublicKey,
    namespace: Namespace,
    owner: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createProfile(namespace)
      .accounts({
        user: userAccount,
        authority: owner,
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
    owner: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    return program.methods
      .deleteProfile()
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: owner,
      })
  }

  // GraphQL API methods

  public async getProfile(userAccount: anchor.web3.PublicKey, namespace: Namespace): Promise<GumDecodedProfile> {
    const namespaceString = JSON.stringify({ [namespace.toLowerCase()]: {} });
    const query = gql`
      query GetProfile ($namespace: String) {
        gum_0_1_0_decoded_profile(
          where: {
            username: { _eq: "${userAccount}" },
            namespace: { _eq: $namespace }
          }
        ) {
          username
          namespace
          cl_pubkey
        }
      }`;
    const variables = { namespace: namespaceString };

    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_profile: GumDecodedProfile[] }>(query, variables);
    return {
      username: new anchor.web3.PublicKey(data.gum_0_1_0_decoded_profile[0].username),
      namespace: data.gum_0_1_0_decoded_profile[0].namespace,
      cl_pubkey: new anchor.web3.PublicKey(data.gum_0_1_0_decoded_profile[0].cl_pubkey),
    }
  }

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