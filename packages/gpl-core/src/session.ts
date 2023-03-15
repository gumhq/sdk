import { SDK } from ".";
import { PublicKey, Keypair } from "@solana/web3.js";

export class Session {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(sessionAccount: PublicKey) {
    return this.sdk.session_program.account.sessionToken.fetch(sessionAccount);
  }

  public async create(targetProgram: PublicKey, owner: PublicKey, topUp = false, validUntil = null) {
    const sessionSigner = Keypair.generate();
    const instructionMethodBuilder = this.sdk.session_program.methods.createSession(topUp, validUntil)
      .accounts({
        targetProgram: targetProgram,
        sessionSigner: sessionSigner.publicKey,
        authority: owner,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const sessionPDA = pubKeys.sessionToken as PublicKey;
    return {
      instructionMethodBuilder,
      sessionSigner,
      sessionPDA,
    };
  }

  public async revoke(sessionAccount: PublicKey, owner: PublicKey) {
    return this.sdk.session_program.methods.revokeSession()
      .accounts({
        sessionToken: sessionAccount,
        authority: owner,
      });
  }
}