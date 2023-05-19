import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";

export class Badge {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async getBadge(userAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.badge.fetch(userAccount);
  }

  public async getOrCreateBadge(
    metadataUri: string,
    issuer: anchor.web3.PublicKey,
    holder: anchor.web3.PublicKey,
    updateAuthority: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey,
  ) {
    const [badgePDA, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("badge"),
        issuer.toBuffer(),
        holder.toBuffer(),
      ],
      this.sdk.program.programId
    );

    try {
      await this.getBadge(badgePDA);
    } catch (err) {
      await (await this.createBadge(metadataUri, issuer, holder, updateAuthority, authority)).instructionMethodBuilder.rpc();
    }
    return badgePDA;
  }

  public async createBadge(
    metadataUri: string,
    issuer: anchor.web3.PublicKey,
    holderProfile: anchor.web3.PublicKey,
    updateAuthority: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createBadge(metadataUri)
      .accounts({
        issuer,
        holder: holderProfile,
        updateAuthority,
        authority,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const badgePDA = pubKeys.badge as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      badgePDA,
    };
  }

  public async updateBadge(
    metadataUri: string,
    badgeAccount: anchor.web3.PublicKey,
    issuer: anchor.web3.PublicKey,
    signer: anchor.web3.PublicKey
  ) {
    return this.sdk.program.methods
      .updateBadge(metadataUri)
      .accounts({
        badge: badgeAccount,
        issuer,
        signer,
      });
  }

  public async burnBadge(
    badgeAccount: anchor.web3.PublicKey,
    issuer: anchor.web3.PublicKey,
    holder: anchor.web3.PublicKey,
    signer: anchor.web3.PublicKey
  ) {
    return this.sdk.program.methods
      .burnBadge()
      .accounts({
        badge: badgeAccount,
        issuer,
        holder,
        signer,
      });
  }

  public async getOrCreateIssuer(
    authority: anchor.web3.PublicKey,
  ) {
    const [issuer, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("issuer"),
        authority.toBuffer(),
      ],
      this.sdk.program.programId
    );

    try {
      await this.getIssuer(issuer);
    } catch (err) {
      await (await this.createIssuer(authority)).instructionMethodBuilder.rpc();
    }
    return issuer;
  }

  public async createIssuer(
    authority: anchor.web3.PublicKey,
  ) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createIssuer()
      .accounts({
        authority,
      });

    const pubKeys = await instructionMethodBuilder.pubkeys();
    const issuerPDA = pubKeys.issuer as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      issuerPDA,
    };
  }

  public async getIssuer(issuerAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.issuer.fetch(issuerAccount);
  }

  public async deleteIssuer(
    issuerAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey,
  ) {
    return this.sdk.program.methods
      .deleteIssuer()
      .accounts({
        issuer: issuerAccount,
        authority,
      });
  }

  public async getSchema(schemaAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.schema.fetch(schemaAccount);
  }

  public async createSchema(
    metadataUri: string,
    authority: anchor.web3.PublicKey,
  ) {
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      .createSchema(metadataUri, randomHash)
      .accounts({
        authority,
      });

    const pubKeys = await instructionMethodBuilder.pubkeys();
    const schemaPDA = pubKeys.schema as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      schemaPDA,
    };
  }

  public async updateSchema(
    metadataUri: string,
    authority: anchor.web3.PublicKey,
    schemaAccount: anchor.web3.PublicKey,
  ) {
    return this.sdk.program.methods
      .updateSchema(metadataUri)
      .accounts({
        schema: schemaAccount,
        authority,
      });
  }

  public async deleteSchema(
    schemaAccount: anchor.web3.PublicKey,
    authority: anchor.web3.PublicKey,
  ) {
    return this.sdk.program.methods
      .deleteSchema()
      .accounts({
        schema: schemaAccount,
        authority,
      });
  }
}