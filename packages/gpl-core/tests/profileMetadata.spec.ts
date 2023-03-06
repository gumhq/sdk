import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import dotenv from "dotenv";
import { GraphQLClient } from "graphql-request";
import { GRAPHQL_ENDPOINTS } from "../src/constants";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("ProfileMetadata", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;
  let profileMetadataPDA: anchor.web3.PublicKey;

  before(async () => {
    const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINTS["devnet"]);
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
      gqlClient
    );

    // Create a user
    const createUser = await sdk.user.create(user.publicKey);
    userPDA = createUser.userPDA as anchor.web3.PublicKey;
    await createUser.instructionMethodBuilder.rpc();

    // Create a profile
    const profile = await sdk.profile.create(
      userPDA,
      "Personal",
      user.publicKey,
    );
    profilePDA = profile.profilePDA as anchor.web3.PublicKey;
    await profile.instructionMethodBuilder.rpc();
  });

  it("should create a profile metadata", async () => {
    const metadataUri = "https://raw.githubusercontent.com/gumhq/sdk/master/packages/gpl-core/tests/utils/profile.json";
    const profileMetadata = await sdk.profileMetadata.create(
      metadataUri,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    profileMetadataPDA = profileMetadata.profileMetadataPDA as anchor.web3.PublicKey;
    await profileMetadata.instructionMethodBuilder.rpc();
    const profileMetadataAccount = await sdk.profileMetadata.get(profileMetadataPDA);
    expect(profileMetadataAccount.profile.toString()).is.equal(profilePDA.toString());
    expect(profileMetadataAccount.metadataUri.toString()).is.equal(metadataUri);
  });

  it("it should update a profile metadata", async () => {
    const metadataUri = "https://example.com/updated";
    const profileMetadata = sdk.profileMetadata.update(
      metadataUri,
      profileMetadataPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await profileMetadata.rpc();
    const profileMetadataAccount = await sdk.profileMetadata.get(profileMetadataPDA);
    expect(profileMetadataAccount.profile.toString()).is.equal(profilePDA.toString());
    expect(profileMetadataAccount.metadataUri.toString()).is.equal(metadataUri);
  });

  it("should delete a profile metadata", async () => {
    const profileMetadata = sdk.profileMetadata.delete(
      profileMetadataPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await profileMetadata.rpc();
    try {
      await sdk.profileMetadata.get(profileMetadataPDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${profileMetadataPDA.toString()}`);
    }
  });

  describe("GraphQL ProfileMetadata queries", async () => {
    let userPubKey: anchor.web3.PublicKey;

    before(async () => {
      userPubKey = new anchor.web3.PublicKey("FRpvmB2dbFRxXWFXihAdQVKndnzFaK31yWfhS6CRHXpn"); // This user is valid on devnet
    });

    describe("getAllProfileMetadata", async () => {
      let profileMetadatas: any;

      before(async () => {
        profileMetadatas = await sdk.profileMetadata.getAllProfileMetadata();
      });

      it("should return an array of posts", async () => {
        expect(profileMetadatas).to.be.an("array");
      });

      it("should return at least one post", async () => {
        expect(profileMetadatas.length).to.be.greaterThan(0);
      });

      it("should return a post with a metadataUri", async () => {
        expect(profileMetadatas[0].metadatauri).to.be.a("string");
      });
    });

    describe("getProfileMetadataByUser", async () => {
      let profileMetadatas: any;

      before(async () => {
        profileMetadatas = await sdk.profileMetadata.getProfileMetadataByUser(userPubKey);
      });

      it("should return an array of posts", async () => {
        expect(profileMetadatas).to.be.an("array");
      });

      it("should return at least one post", async () => {
        expect(profileMetadatas.length).to.be.greaterThan(0);
      });

      it("should return a post with a metadataUri", async () => {
        expect(profileMetadatas[0].metadatauri).to.be.a("string");
      });
    });

    describe("getProfileMetadataByUserAndNamespace", async () => {
      let profileMetadatas: any;

      before(async () => {
        profileMetadatas = await sdk.profileMetadata.getProfileMetadataByUserAndNamespace(userPubKey, "Professional");
      });

      it("should return an array of posts", async () => {
        expect(profileMetadatas).to.be.an("object");
      });

      it("should return a post with a metadataUri", async () => {
        expect(profileMetadatas.metadatauri).to.be.a("string");
      });
    });
  });
});