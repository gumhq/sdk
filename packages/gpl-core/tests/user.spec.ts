import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { airdrop } from "./utils";
import { expect } from "chai";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { GRAPHQL_ENDPOINTS } from "../src/constants";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("User", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let randomUser: anchor.web3.Keypair;

  before(async () => {
    const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINTS["devnet"]);
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
      gqlClient
    );
    randomUser = anchor.web3.Keypair.generate();
    await airdrop(randomUser.publicKey);
  });

  it("should create a user", async () => {
    const createUser = await sdk.user.create(user.publicKey);
    await createUser.instructionMethodBuilder.rpc();
    userPDA = createUser.userPDA;
    const userAccount = await sdk.user.get(userPDA);
    expect(userAccount.authority.toString()).is.equal(user.publicKey.toString());
  });

  it("should update a user", async () => {
    const instructionMethodBuilder = sdk.user.update(userPDA, randomUser.publicKey, user.publicKey);
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const randomUserPDA = pubKeys.user as anchor.web3.PublicKey;
    await instructionMethodBuilder.rpc();
    const userAccount = await sdk.user.get(randomUserPDA);
    expect(userAccount.authority.toString()).is.equal(randomUser.publicKey.toString());
  });

  it("should delete a user", async () => {
    const randomUserWallet = new NodeWallet(randomUser);
    const instructionMethodBuilder = sdk.user.delete(userPDA, randomUser.publicKey);
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const randomUserPDA = pubKeys.user as anchor.web3.PublicKey;
    const transaction = await instructionMethodBuilder.transaction();
    transaction.recentBlockhash = (await sdk.rpcConnection.getLatestBlockhash()).blockhash;
    transaction.feePayer = randomUser.publicKey;
    const signedTransaction = await randomUserWallet.signTransaction(transaction);
    await sendAndConfirmTransaction(
      sdk.rpcConnection,
      signedTransaction,
      [randomUser],
    );
    try {
      await sdk.user.get(randomUserPDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${randomUserPDA.toString()}`);
    }
  });

  describe("GraphQL User Queries", async () => {
    it("get all user accounts", async () => {
      const users = await sdk.user.getAllUsersAccounts();
      expect(users).to.be.an("array");
      expect(users.length).to.be.greaterThan(0);
      users.forEach(user => {
        expect(user).to.have.property("authority");
        expect(user).to.have.property("cl_pubkey");
        expect(user).to.have.property("randomhash");
      });
    });

    it("get user account by authority", async () => {
      const userPubKey = new anchor.web3.PublicKey("FRpvmB2dbFRxXWFXihAdQVKndnzFaK31yWfhS6CRHXpn");
      const userAccount = await sdk.user.getUserAccountsByAuthority(
        userPubKey
      );
      expect(userAccount).to.be.an("array");
      expect(userAccount.length).to.be.greaterThan(0);
      userAccount.forEach(user => {
        expect(user).to.have.property("authority");
        expect(user).to.have.property("cl_pubkey");
        expect(user).to.have.property("randomhash");
        expect(user.authority).to.equal(userPubKey.toBase58());
      });
    });
  });
});