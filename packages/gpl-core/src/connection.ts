import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { gql } from "graphql-request";

export interface GraphQLConnection {
  from_profile: string;
  to_profile: string;
  address: string;
  refreshed_at?: Date;
  slot_created_at?: number;
  slot_updated_at?: number;
  created_at?: Date;
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
    owner: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = owner) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createConnection()
      .accounts({
        fromProfile: fromProfile,
        toProfile: toProfile,
        sessionToken: null,
        authority: owner,
        payer: payer,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const connectionPDA = pubKeys.connection as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      connectionPDA,
    };
  }

  public async createWithSession(
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = sessionPublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createConnection()
      .accounts({
        fromProfile: fromProfile,
        toProfile: toProfile,
        sessionToken: sessionTokenAccount,
        authority: sessionPublicKey,
        payer: payer,
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
    owner: anchor.web3.PublicKey,
    refundReceiver: anchor.web3.PublicKey = owner) {
    return this.sdk.program.methods
      .deleteConnection()
      .accounts({
        connection: connectionAccount,
        fromProfile: fromProfile,
        toProfile: toProfile,
        sessionToken: null,
        authority: owner,
        refundReceiver: refundReceiver,
      });
  }

  public deleteWithSession(
    connectionAccount: anchor.web3.PublicKey,
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    sessionPublicKey: anchor.web3.PublicKey,
    sessionTokenAccount: anchor.web3.PublicKey | null = null,
    refundReceiver: anchor.web3.PublicKey = sessionPublicKey) {
    return this.sdk.program.methods
      .deleteConnection()
      .accounts({
        connection: connectionAccount,
        fromProfile: fromProfile,
        toProfile: toProfile,
        sessionToken: sessionTokenAccount,
        authority: sessionPublicKey,
        refundReceiver: refundReceiver,
      });
  }

  // GraphQL Query methods

  public async getAllConnections(): Promise<GraphQLConnection[]> {
    const query = gql`
      query GetAllConnections {
        connection {
          from_profile
          to_profile
          address
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }
    `;
    const result = await this.sdk.gqlClient.request<{ connection: GraphQLConnection[] }>(query);
    return result.connection;
  }

  public async getConnectionsByAuthority(userPubKey: anchor.web3.PublicKey): Promise<GraphQLConnection[]> {
    const profiles = await this.sdk.profile.getProfilesByAuthority(userPubKey);
    const profilePDAs = profiles.map((p) => p.address) as string[];
    const query = gql`
      query GetConnectionsByAuthority ($profilePDAs: [String!]) {
        connection(where: {from_profile: {_in: $profilePDAs }}) {
          from_profile
          to_profile
          address
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }
    `;
    const variables = {
      profilePDAs,
    };
    const result = await this.sdk.gqlClient.request<{ connection: GraphQLConnection[] }>(query, variables);
    return result.connection;
  }

  public async getFollowersByProfile(profileAccount: anchor.web3.PublicKey): Promise<string[]> {
    const query = gql`
      query GetFollowersByProfile ($profileAccount: String!) {
        connection(where: {to_profile: {_eq: $profileAccount}}) {
          from_profile
        }
      }`;
    const variables = {
      profileAccount: profileAccount.toBase58(),
    };
    const result = await this.sdk.gqlClient.request<{ connection: { from_profile: string }[] }>(query, variables);
    const followers = result.connection.map((follower) => follower.from_profile);
    return followers;
  }

  public async getFollowingsByProfile(profileAccount: anchor.web3.PublicKey): Promise<string[]> {
    const query = gql`
      query GetFollowingsByProfile ($profileAccount: String!) {
        connection(where: {from_profile: {_eq: $profileAccount}}) {
          to_profile
        }
      }
    `;
    const variables = {
      profileAccount: profileAccount.toBase58(),
    };
    const result = await this.sdk.gqlClient.request<{ connection: { to_profile: string }[] }>(query, variables);
    const followings = result.connection.map((following) => following.to_profile);
    return followings;
  }

}