import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";

export interface GraphQLConnection {
  fromprofile: string;
  toprofile: string;
  cl_pubkey: string;
}

export class Connection {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(connectionAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.connection.fetch(connectionAccount);
  }

  public async create(
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createConnection()
      .accounts({
        fromProfile: fromProfile,
        toProfile: toProfile,
        user: userAccount,
        authority: owner,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const connectionPDA = pubKeys.connection as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      connectionPDA,
    };
  }

  public delete(
    connectionAccount: anchor.web3.PublicKey,
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deleteConnection()
      .accounts({
        connection: connectionAccount,
        fromProfile: fromProfile,
        toProfile: toProfile,
        user: userAccount,
        authority: owner,
      });
  }

  // GraphQL Query methods

  public async getAllConnections(): Promise<GraphQLConnection[]> {
    const query = gql`
      query GetAllConnections {
      gum_0_1_0_decoded_connection {
        toprofile
        fromprofile
        cl_pubkey
      }
    `;
    const result = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_connection: GraphQLConnection[] }>(query);
    return result.gum_0_1_0_decoded_connection;
  }

  public async getConnectionsByUser(userPubKey: anchor.web3.PublicKey): Promise<GraphQLConnection[]> {
    const profiles = await this.sdk.profile.getProfilesByUser(userPubKey);
    const profilePDAs = profiles.map((p) => p.cl_pubkey) as string[];
    const query = gql`
      query GetConnectionsByUser {
        gum_0_1_0_decoded_connection(where: {fromprofile: {_in: [${profilePDAs.map((pda) => `"${pda}"`).join(",")}] }}) {
          fromprofile
          toprofile
          cl_pubkey
        }
      }
    `;
    const result = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_connection: GraphQLConnection[] }>(query);
    return result.gum_0_1_0_decoded_connection;
  }

  public async getFollowersByProfile(profileAccount: anchor.web3.PublicKey): Promise<string[]> {
    const query = gql`
      query GetFollowersByProfile ($profileAccount: String!) {
        gum_0_1_0_decoded_connection(where: {toprofile: {_eq: $profileAccount}}) {
          fromprofile
        }
      }`;
    const variables = {
      profileAccount: profileAccount.toBase58(),
    };
    const result = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_connection: { fromprofile: string }[] }>(query, variables);
    const followers = result.gum_0_1_0_decoded_connection.map((follower) => follower.fromprofile);
    return followers;
  }

  public async getFollowingsByProfile(profileAccount: anchor.web3.PublicKey): Promise<string[]> {
    const query = gql`
      query GetFollowingsByProfile ($profileAccount: String!) {
        gum_0_1_0_decoded_connection(where: {fromprofile: {_eq: $profileAccount}}) {
          toprofile
        }
      }
    `;
    const variables = {
      profileAccount: profileAccount.toBase58(),
    };
    const result = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_connection: { toprofile: string }[] }>(query, variables);
    const followings = result.gum_0_1_0_decoded_connection.map((following) => following.toprofile);
    return followings;
  }

}