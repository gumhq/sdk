import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
// import { GRAPHQL_ENDPOINTS } from "../src/constants";
import { createGumTld, createGumDomain } from "./utils";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Profile", async () => {
  let sdk: SDK;
  let profilePDA: anchor.web3.PublicKey;
  let gumTld: anchor.web3.PublicKey;
  let screenNameAccount: anchor.web3.PublicKey;

  before(async () => {
    // const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINTS["devnet"]);
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
      // gqlClient
    );

    // Create a gum tld
    gumTld = await createGumTld(sdk);

    // Create a domain for the wallet
    screenNameAccount = await createGumDomain(sdk, gumTld, "profiletest");
  });

  it("should create a profile", async () => {
    // Create a profile
    const profileMetdataUri = "https://example.com";
    const profile = await sdk.profile.create(
      profileMetdataUri,
      screenNameAccount,
      user.publicKey,
    );
    profilePDA = profile.profilePDA;
    await profile.instructionMethodBuilder.rpc();
    const profileAccount = await sdk.profile.get(profilePDA);
    expect(profileAccount.metadataUri).is.equal(profileMetdataUri);
    expect(profileAccount.screenName.toBase58()).is.equal(screenNameAccount.toBase58());
  });

  it("should delete a profile", async () => {
    const tx = sdk.profile.delete(
      profilePDA,
      user.publicKey,
    );
    await tx.rpc();
    try {
      await sdk.profile.get(profilePDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${profilePDA.toString()}`);
    }
  });

  // describe("GraphQL Profile Queries", async () => {
  //   let userPubKey: anchor.web3.PublicKey;

  //   beforeEach(async () => {
  //     userPubKey = new anchor.web3.PublicKey("FRpvmB2dbFRxXWFXihAdQVKndnzFaK31yWfhS6CRHXpn"); // This user is valid on devnet
  //   });

  //   describe("get profiles by user", () => {
  //     let profiles: any;

  //     beforeEach(async () => {
  //       profiles = await sdk.profile.getProfilesByUser(userPubKey);
  //     });

  //     it("should return an array of profiles", () => {
  //       expect(profiles).to.be.an("array");
  //     });

  //     it("should return atleast one profile", () => {
  //       expect(profiles.length).to.be.greaterThan(0);
  //     });
  //   });

  //   describe("get all profiles", () => {
  //     let profiles: any;

  //     beforeEach(async () => {
  //       profiles = await sdk.profile.getAllProfiles();
  //     });

  //     it("should return an array of profiles", () => {
  //       expect(profiles).to.be.an("array");
  //     });

  //     it("should return atleast one profile", () => {
  //       expect(profiles.length).to.be.greaterThan(0);
  //     });
  //   });

  //   describe("get profile by namespace", () => {
  //     let profiles: any;

  //     beforeEach(async () => {
  //       profiles = await sdk.profile.getProfilesByNamespace("Personal");
  //     });

  //     it("should return an array of profiles", () => {
  //       expect(profiles).to.be.an("array");
  //     })

  //     it("should have the namespace Personal", () => {
  //       const namespace = JSON.stringify({ "personal": {} });
  //       expect(profiles[0].namespace).to.be.equal(namespace);
  //     });
  //   });

  //   describe("get profile by namespace and user", () => {
  //     let profiles: any;

  //     beforeEach(async () => {
  //       profiles = await sdk.profile.getProfilesByUserAndNamespace(userPubKey, "Professional");
  //     });

  //     it("should have the namespace Professional", () => {
  //       const namespace = JSON.stringify({ "professional": {} });
  //       expect(profiles.namespace).to.be.equal(namespace);
  //     });
  //   });
  // });
});