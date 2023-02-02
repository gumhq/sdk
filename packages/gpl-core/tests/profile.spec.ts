import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Profile", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;

  before(async () => {
    const gqlClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT as string);
    gqlClient.setHeader("x-hasura-admin-secret", process.env.HASURA_ADMIN_SECRET as string);
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
      gqlClient
    );

    // Create a user
    const createUser = await sdk.user.create(user.publicKey)
    userPDA = createUser.userPDA as anchor.web3.PublicKey;
    await createUser.instructionMethodBuilder.rpc();
  });

  it("should create a profile", async () => {
    const profile = await sdk.profile.create(
      userPDA,
      "Personal",
      user.publicKey,
    );
    profilePDA = profile.profilePDA as anchor.web3.PublicKey;
    await profile.instructionMethodBuilder.rpc();
    const profileAccount = await sdk.profile.get(profilePDA);
    expect(profileAccount.user.toString()).is.equal(userPDA.toString());
    expect(profileAccount.namespace.toString()).is.equal({ personal: {} }.toString());
  });

  it("should delete a profile", async () => {
    const tx = sdk.profile.delete(
      profilePDA,
      userPDA,
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

  describe("GraphQL Profile Queries", async () => {
    let userPubKey: anchor.web3.PublicKey;

    beforeEach(async () => {
      userPubKey = new anchor.web3.PublicKey("FRpvmB2dbFRxXWFXihAdQVKndnzFaK31yWfhS6CRHXpn");
    });

    describe("get profiles by user", () => {
      let profiles: any;

      beforeEach(async () => {
        profiles = await sdk.profile.getProfilesByUser(userPubKey);
      });

      it("should return an array of profiles", () => {
        expect(profiles).to.be.an("array");
      });

      it("should return atleast one profile", () => {
        expect(profiles.length).to.be.greaterThan(0);
      });
    });

    describe("get all profiles", () => {
      let profiles: any;

      beforeEach(async () => {
        profiles = await sdk.profile.getAllProfiles();
      });

      it("should return an array of profiles", () => {
        expect(profiles).to.be.an("array");
      });

      it("should return atleast one profile", () => {
        expect(profiles.length).to.be.greaterThan(0);
      });
    });

    describe("get profile by namespace", () => {
      let profiles: any;

      beforeEach(async () => {
        profiles = await sdk.profile.getProfilesByNamespace("Personal");
      });

      it("should return an array of profiles", () => {
        expect(profiles).to.be.an("array");
      })

      it("should have the namespace Personal", () => {
        const namespace = JSON.stringify({ "personal": {} });
        expect(profiles[0].namespace).to.be.equal(namespace);
      });
    });
  });
});