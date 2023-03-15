import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { GraphQLClient } from "graphql-request";
import dotenv from "dotenv";
import { GRAPHQL_ENDPOINTS } from "../src/constants";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Sparkle Session", async () => {
  let sdk: SDK;
  let sessionPDA: anchor.web3.PublicKey;
  let sessionSigner: anchor.web3.Keypair;
  let targetProgram: anchor.web3.PublicKey;

  before(async () => {
    const gqlClient = new GraphQLClient(GRAPHQL_ENDPOINTS["devnet"]);
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      { preflightCommitment: "processed" },
      "localnet",
      gqlClient
    );
    // targetProgram should be a valid program on the network
    targetProgram = new anchor.web3.PublicKey("GgFpUxrTfYwNZXwCZtWN9rutCPi46m8fk2MEJ7YpnhoZ");
  });

  it("should create a session", async () => {
    const session = await sdk.session.create(targetProgram, user.publicKey);
    sessionPDA = session.sessionPDA;
    sessionSigner = session.sessionSigner;
    await session.instructionMethodBuilder.signers([sessionSigner]).rpc();
    const sessionAccount = await sdk.session.get(session.sessionPDA);
    expect(sessionAccount.targetProgram.toString()).is.equal(targetProgram.toString());
  });

  it("should revoke a session", async () => {
    const revokeSession = await sdk.session.revoke(sessionPDA, user.publicKey);
    await revokeSession.rpc();
    try {
      await sdk.session.get(sessionPDA);
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${sessionPDA.toString()}`);
    }
  });
});
