import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import { gql } from "graphql-request";

export interface GumDecodedUser {
  authority: anchor.web3.PublicKey;
  cl_pubkey: anchor.web3.PublicKey;
  randomhash: number[];
}

export class User {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async userPDA(randomHash: Buffer): Promise<anchor.web3.PublicKey> {
    const { program } = this.sdk;
    const [userPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), randomHash],
      program.programId
    );
    return userPDA;
  }

  public async get(userAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.user.fetch(userAccount);
  }

  public async getUserAccountsByUser(user: anchor.web3.PublicKey) {
    return await this.sdk.program.account.user.all([
      { memcmp: { offset: 8, bytes: user.toBase58() } },
    ]);
  }

  public async create(owner: anchor.web3.PublicKey) {
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      .createUser(randomHash)
      .accounts({
        authority: owner,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const userPDA = pubKeys.user as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      userPDA,
    };
  }

  public update(
    userAccount: anchor.web3.PublicKey,
    newAuthority: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const { program } = this.sdk;
    return program.methods
      .updateUser()
      .accounts({
        user: userAccount,
        newAuthority: newAuthority,
        authority: owner,
      });
  }

  public delete(
    userAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    const { program } = this.sdk;
    return program.methods
      .deleteUser()
      .accounts({
        user: userAccount,
        authority: owner,
      });
  }

  // GraphQL API methods

  public async getAllUsersAccounts(): Promise<GumDecodedUser[]> {
    const query = gql`
      query AllUsersAccounts {
        gum_0_1_0_decoded_user {
          authority
          cl_pubkey
          randomhash
        }
      }
    `;
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_user: GumDecodedUser[] }>(query);
    return data.gum_0_1_0_decoded_user;
  }

  public async getUserAccountsByAuthority(userPubkey: anchor.web3.PublicKey): Promise<GumDecodedUser[]> {
    const query = gql`
      query UserAccounts {
        gum_0_1_0_decoded_user(where: { authority: { _eq: "${userPubkey}" } }) {
          authority
          cl_pubkey
          randomhash
        }
      }
    `;
    const data = await this.sdk.gqlClient.request<{ gum_0_1_0_decoded_user: GumDecodedUser[] }>(query);
    return data.gum_0_1_0_decoded_user;
  }
}