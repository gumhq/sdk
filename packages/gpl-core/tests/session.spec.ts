import { SessionTokenManager } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import dotenv from "dotenv";

dotenv.config();

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Sparkle Session", async () => {
  let sdk: SessionTokenManager;
  let sessionPDA: anchor.web3.PublicKey;
  let sessionSigner: anchor.web3.Keypair;
  let targetProgram: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SessionTokenManager(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "localnet"
    );
    // targetProgram should be a valid program on the network
    targetProgram = new anchor.web3.PublicKey("GgFpUxrTfYwNZXwCZtWN9rutCPi46m8fk2MEJ7YpnhoZ");
    sessionSigner = anchor.web3.Keypair.generate();
  });

  it("should create a session", async () => {
    const session = await sdk.createSession(sessionSigner, targetProgram, user.publicKey, true);
    sessionPDA = session.sessionPDA;
    await session.instructionMethodBuilder.signers([sessionSigner]).rpc();
    const sessionAccount = await sdk.get(session.sessionPDA);
    // @ts-ignore
    expect(sessionAccount.targetProgram.toString()).is.equal(targetProgram.toString());
  });

  it("should revoke a session", async () => {
    const sessionSignerBalanceBeforeRevoke = await sdk.provider.connection.getBalance(sessionSigner.publicKey);
    const revokeSession = await sdk.revoke(sessionSigner, sessionPDA, user.publicKey);
    await revokeSession.rpc();
    const sessionSignerBalanceAfterRevoke = await sdk.provider.connection.getBalance(sessionSigner.publicKey);
    expect(sessionSignerBalanceBeforeRevoke).is.equal(10000000);
    expect(sessionSignerBalanceAfterRevoke).is.equal(0);
    try {
      await sdk.get(sessionPDA);
    } catch (error) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${sessionPDA.toString()}`);
    }
  });
});
