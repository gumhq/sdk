import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import dotenv from "dotenv";
import { createGumTld, createGumDomain, airdrop } from "./utils";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Badge", async () => {
  let sdk: SDK;
  let profilePDA: anchor.web3.PublicKey;
  let gumTld: anchor.web3.PublicKey;
  let screenNameAccount: anchor.web3.PublicKey;
  let issuerPDA: anchor.web3.PublicKey;
  let badgePDA: anchor.web3.PublicKey;
  let schemaPDA: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
    );

    // Create a gum tld
    gumTld = await createGumTld(sdk);
    // Create a domain for the wallet
    screenNameAccount = await createGumDomain(sdk, gumTld, "gumbadge");

    const profileMetdataUri = "https://example.com";
    const profile = await sdk.profile.create(
      profileMetdataUri,
      screenNameAccount,
      user.publicKey,
    );
    profilePDA = profile.profilePDA;
    await profile.instructionMethodBuilder.rpc();
  });

  it("should create an issuer", async () => {
    // Create an issuer
    const issuer = await sdk.badge.createIssuer(
      user.publicKey,
    );
    issuerPDA = issuer.issuerPDA;
    await issuer.instructionMethodBuilder.rpc();
    const issuerAccount = await sdk.badge.getIssuer(issuerPDA);
    expect(issuerAccount.authority.toBase58()).is.equal(user.publicKey.toBase58());
  });

  it("should verify the issuer", async () => {
    // Verify the issuer
    const issuer = await sdk.badge.verifyIssuer(
      issuerPDA,
      user.publicKey,
    );
    await issuer.rpc();
    const issuerAccount = await sdk.badge.getIssuer(issuerPDA);

    expect(issuerAccount.verified).is.equal(true);
  });

  it("should create a schema", async () => {
    // Create a schema
    const schemaMetdataUri = "https://example.com";
    const schema = await sdk.badge.createSchema(
      schemaMetdataUri,
      user.publicKey,
    );
    await schema.instructionMethodBuilder.rpc();

    schemaPDA = schema.schemaPDA;
    const schemaAccount = await sdk.badge.getSchema(schemaPDA);
    expect(schemaAccount.authority.toBase58()).is.equal(user.publicKey.toBase58());
  });

  it("should create a badge", async () => {
    // Create a badge
    const issuer = issuerPDA;
    const badgeMetdataUri = "https://example.com";
    const holderProfile = profilePDA;
    const updateAuthority = user.publicKey;

    const badge = await sdk.badge.createBadge(
      badgeMetdataUri,
      issuer,
      schemaPDA,
      profilePDA,
      updateAuthority,
      user.publicKey,
    );
    badgePDA = badge.badgePDA;
    await badge.instructionMethodBuilder.rpc();

    const badgeAccount = await sdk.badge.getBadge(badgePDA);
    expect(badgeAccount.issuer.toBase58()).is.equal(issuer.toBase58());
    expect(badgeAccount.holder.toBase58()).is.equal(holderProfile.toBase58());
    expect(badgeAccount.updateAuthority.toBase58()).is.equal(updateAuthority.toBase58());
    expect(badgeAccount.metadataUri).is.equal(badgeMetdataUri);
  });

  it("should update a badge", async () => {
    // Update a badge
    const badgeMetdataUri = "https://example1.com";
    const badge = await sdk.badge.updateBadge(
      badgeMetdataUri,
      badgePDA,
      issuerPDA,
      schemaPDA,
      user.publicKey,
    );
    await badge.rpc();
    const badgeAccount = await sdk.badge.getBadge(badgePDA);
    expect(badgeAccount.metadataUri).is.equal(badgeMetdataUri);
  });

  it("should burn a badge", async () => {
    // Burn a badge
    const badge = await sdk.badge.burnBadge(
      badgePDA,
      issuerPDA,
      schemaPDA,
      profilePDA,
      user.publicKey,
    );

    await badge.rpc();

    try {
      await sdk.badge.getBadge(badgePDA);
    } catch (e: any) {
      expect(e).to.be.an("error");
      expect(e.toString()).to.contain("Account does not exist");
    }
  });

  it("should update a schema", async () => {
    // Update a schema
    const schemaMetdataUri = "https://example1.com";
    const schema = await sdk.badge.updateSchema(
      schemaMetdataUri,
      user.publicKey,
      schemaPDA,
    );

    await schema.rpc();

    const schemaAccount = await sdk.badge.getSchema(schemaPDA);
    expect(schemaAccount.metadataUri).is.equal(schemaMetdataUri);
  });

  it("should delete a schema", async () => {
    // Delete a schema
    const schema = await sdk.badge.deleteSchema(
      schemaPDA,
      user.publicKey,
    );

    await schema.rpc();

    try {
      await sdk.badge.getSchema(schemaPDA);
    } catch (e: any) {
      expect(e).to.be.an("error");
      expect(e.toString()).to.contain("Account does not exist");
    }
  });
});