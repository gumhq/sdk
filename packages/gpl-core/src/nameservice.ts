import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { keccak_256 } from "js-sha3";
import { gql } from "graphql-request";
import { SDK } from "src";

export interface GraphQLNameservice {
  address: string;
  name: string;
  authority: string;
  domain: string;
  refreshed_at?: Date;
  slot_created_at?: Date;
  slot_updated_at?: Date;
  created_at?: Date;
}

export class GumNameService {
  readonly sdk: SDK;
  
  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(tldAccount: PublicKey) {
    return this.sdk.nameserviceProgram.account.nameRecord.fetch(tldAccount);
  }

  public async getOrCreateDomain(
    tldPDA: PublicKey,
    domain: string,
    authority: PublicKey,
  ) {
    const domainHash = keccak_256(domain);

    const [domainAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(domainHash, "hex"),
        tldPDA.toBuffer(),
      ],
      this.sdk.nameserviceProgram.programId
    );
    try {
      const existingDomain = await this.get(domainAccount);
      if (!existingDomain.authority.equals(authority) || domain == "gum") {
        throw new Error("Domain already exists with different authority");
      } 
    } catch (err) {
      if (!err.message.toString().includes("Account does not exist")) {
        throw err;
      }
      await this.sdk.nameserviceProgram.methods.createNameRecord(domain)
        .accounts({
          domain: tldPDA,
          nameRecord: domainAccount,
          authority: authority,
        }).rpc();
    }
    return domainAccount;
  }

  public async createDomain(
    tldPDA: PublicKey,
    domain: string,
    authority: PublicKey,
  ) {
    const domainHash = keccak_256(domain);

    const [domainAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(domainHash, "hex"),
        tldPDA.toBuffer(),
      ],
      this.sdk.nameserviceProgram.programId
    );

    const instructionMethodBuilder = this.sdk.nameserviceProgram.methods.createNameRecord(domain)
      .accounts({
        domain: tldPDA,
        nameRecord: domainAccount,
        authority,
      })
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const gumDomainPDA = pubKeys.nameRecord as PublicKey;
    return { gumDomainPDA, instructionMethodBuilder };
  }

  public async transferDomain(
    domainPDA: PublicKey,
    currentAuthority: PublicKey,
    newAuthority: PublicKey,
  ) {
    return this.sdk.nameserviceProgram.methods.transferNameRecord()
      .accounts({
        nameRecord: domainPDA,
        authority: currentAuthority,
        newAuthority,
      })
  }

  // GraphQL Query methods

  public async getAllNameservices(): Promise<GraphQLNameservice[]> {
    const query = gql`
      query GetAllNameservices {
        name_record {
          address
          name
          authority
          domain
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ name_record: GraphQLNameservice[] }>(query);
    return data.name_record;
  }

  public async getNameserviceByDomain(domain: string): Promise<GraphQLNameservice> {
    const query = gql`
      query GetNameserviceByDomain($domain: String!) {
        name_record(where: {domain: {_eq: $domain}}) {
          address
          name
          authority
          domain
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ name_record: GraphQLNameservice }>(query, { domain });
    return data.name_record;
  }

  public async getNameservicesByAuthority(authority: string): Promise<GraphQLNameservice[]> {
    const query = gql`
      query GetNameservicesByAuthority($authority: String!) {
        name_record(where: {authority: {_eq: $authority}}) {
          address
          name
          authority
          domain
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ name_record: GraphQLNameservice[] }>(query, { authority });
    return data.name_record;
  }

  public async getDomainByName(domainName: string): Promise<GraphQLNameservice> {
    const query = gql`
      query GetDomainByName($domainName: String!) {
        name_record(where: {name: {_eq: $domainName}}) {
          address
          name
          authority
          domain
          refreshed_at
          slot_created_at
          slot_updated_at
          created_at
        }
      }`
    const data = await this.sdk.gqlClient.request<{ name_record: GraphQLNameservice }>(query, { domainName });
    return data.name_record;
  }
}
