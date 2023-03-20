import { SDK } from ".";
import { PublicKey, Keypair } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export class Session {
  private readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(sessionAccount: PublicKey) {
    return this.sdk.session_program.account.sessionToken.fetch(sessionAccount);
  }

  public async create(targetProgramPublicKey: PublicKey, ownerPublicKey: PublicKey, topUp: boolean = false, validUntilTimestamp: number | null = null) {
    const sessionSignerKeypair = Keypair.generate();
    const sessionSignerPublicKey = sessionSignerKeypair.publicKey;

    let validUntilBN: BN | null = null;
    if (validUntilTimestamp !== null) {
      validUntilBN = new BN(validUntilTimestamp);
    }

    const instructionMethodBuilder = this.sdk.session_program.methods.createSession(topUp, validUntilBN)
      .accounts({
        targetProgram: targetProgramPublicKey,
        sessionSigner: sessionSignerPublicKey,
        authority: ownerPublicKey,
      });

    const pubKeys = await instructionMethodBuilder.pubkeys();
    const sessionPDA = pubKeys.sessionToken as PublicKey;

    return {
      instructionMethodBuilder: instructionMethodBuilder,
      sessionSignerKeypair: sessionSignerKeypair,
      sessionPDA: sessionPDA,
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