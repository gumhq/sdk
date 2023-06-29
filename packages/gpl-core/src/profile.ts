import { GUM_TLD_ACCOUNT, SDK } from ".";
import { gql } from "graphql-request";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";
import axios from "axios";
import { keccak_256 } from "js-sha3";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type ProfileMetadataType = {
  name: string;
  bio: string;
  avatar: string;
};

export interface GumDecodedProfile {
  address: string;
  screen_name: string;
  authority: string;
  metadata_uri: string;
  metadata: any;
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
    metadataUri: string,
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
    metadataUri: string,
    screenNameAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = authority
  ) {
    const validation = await this.validateProfileMetadata(metadataUri);
    if (!validation) {
      throw new Error("Invalid profile metadata");
    }

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

  public async createProfileWithGumDomain(
    metadataUri: string,
    domainName: string,
    authority: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey = authority
  ) {
    let instruction: TransactionInstruction[] = [];
    const gumTld = GUM_TLD_ACCOUNT;

    // Check if a profile with the provided domain name already exists
    let profilePDA = await this.getProfileByDomainName(domainName);
    if (profilePDA) {
      return {
        instructionMethodBuilder: null,
        profilePDA: new PublicKey(profilePDA.address),
      };
    }

    // Fetch existing domain by name
    let domainPDA = await this.sdk.nameservice.getDomainByName(domainName);

    // If the domain exists, check its authority against provided authority
    if (domainPDA && domainPDA.address) {
      console.log("Domain exists, checking authority");
      if (domainPDA.authority !== authority.toBase58()) {
        throw new Error("You must be the owner of the domain to perform this action. Please ensure you're using the correct authority.");
      }
    } else {
      // If the domain doesn't exist, create it
      console.log("Domain doesn't exist, creating");
      const domainAccount = await this.sdk.nameservice.createDomain(gumTld, domainName, authority);
      const domainIx = await domainAccount.instructionMethodBuilder.instruction();
      instruction.push(domainIx);
    }

    // Generate domainAccount for profile creation
    const domainHash = keccak_256(domainName);
    const [domainAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(domainHash, "hex"),
        gumTld.toBuffer(),
      ],
      this.sdk.nameserviceProgram.programId
    );

    // Create profile with domain
    const profile = await this.sdk.profile.create(metadataUri, domainAccount, authority, payer);
    const instructionMethodBuilder = profile?.instructionMethodBuilder.preInstructions(instruction);

    return {
      instructionMethodBuilder,
      profilePDA: profile?.profilePDA,
    };
  }

  public async update(
    metadataUri: string,
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

  public async validateProfileMetadata(metadataUri: string): Promise<boolean> {
    try {
      const uri = new URL(metadataUri);
      if (!uri.protocol.startsWith("http")) {
        throw new Error("Invalid URI protocol, must be http or https");
      }

      const { data } = await axios.get<ProfileMetadataType>(metadataUri);

      // Check if all required fields are present
      const requiredFields: Array<keyof ProfileMetadataType> = ["name", "bio", "avatar"];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`${field} is required but missing`);
        }
      }

      // Check if the type of the fields are correct
      const fields = ["name", "bio", "avatar"];
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

      // Check if the fields are empty
      if (data.name.trim() === "") {
        throw new Error("Name cannot be empty");
      }

      return true;
    } catch (error) {
      throw new Error(`Error validating profile metadata: ${error.message}`);
    }
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
          metadata
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
          metadata
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
            metadata
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
            metadata
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

  public async getProfilesByProfileAccount(profileAccount: anchor.web3.PublicKey): Promise<GumDecodedProfile> {
      const query = gql`
        query ProfilesByProfileAccount ($profileAccount: String) {
          profile(where: { address: { _eq: $profileAccount } }) {
            address
            screen_name
            authority
            metadata_uri
            metadata
            slot_created_at
            slot_updated_at
          }
        }
      `;
      const variables = {
        profileAccount: profileAccount.toBase58(),
      };

      const data = await this.sdk.gqlClient.request<{ profile: GumDecodedProfile[] }>(query, variables);
      return data.profile[0];
  }

  public async getProfileByDomainName(domainName: string): Promise<GumDecodedProfile> {
    const domain = await this.sdk.nameservice.getDomainByName(domainName);
    if (!domain.address) {
      console.log(`Domain ${domainName} not found`);
      return;
    }
    const domainAccount = new anchor.web3.PublicKey(domain.address);
    const profileAccount = await this.getProfilesByScreenName(domainAccount);
    return profileAccount[0];
  }
}