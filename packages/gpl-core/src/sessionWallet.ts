import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { PublicKey, Keypair, Cluster } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import gpl_session_idl from "./idl/gpl_session.json";
import { GPLSESSION_PROGRAMS } from "./constants";

export class SessionWallet {
  readonly program: anchor.Program;
  readonly provider: anchor.AnchorProvider;

  constructor(
    wallet: Wallet,
    connection: anchor.web3.Connection,
    cluster: Cluster | "localnet",
  ) {
    this.provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    this.program = new anchor.Program(
      gpl_session_idl as anchor.Idl,
      GPLSESSION_PROGRAMS[cluster] as anchor.web3.PublicKey,
      this.provider);
  }

  public async get(sessionAccount: PublicKey) {
    return this.program.account.sessionToken.fetch(sessionAccount);
  }

  private async create(targetProgramPublicKey: PublicKey, ownerPublicKey: PublicKey, topUp: boolean = false, validUntilTimestamp: number | null = null) {
    const sessionSignerKeypair = Keypair.generate();
    const sessionSignerPublicKey = sessionSignerKeypair.publicKey;

    let validUntilBN: BN | null = null;
    if (validUntilTimestamp !== null) {
      validUntilBN = new BN(validUntilTimestamp);
    }

    const instructionMethodBuilder = this.program.methods.createSession(topUp, validUntilBN)
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

  public async createSession(targetProgramPublicKey: PublicKey, ownerPublicKey: PublicKey, validUntilTimestamp: number | null = null) {
    try {
      const { instructionMethodBuilder, sessionSignerKeypair, sessionPDA } = await this.create(targetProgramPublicKey, ownerPublicKey, false, validUntilTimestamp);
      
      return {
        instructionMethodBuilder: instructionMethodBuilder,
        sessionSignerKeypair: sessionSignerKeypair,
        sessionPDA: sessionPDA,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session.');
    }
  }

  public async revoke(sessionAccount: PublicKey, owner: PublicKey) {
    try {
      return this.program.methods.revokeSession()
        .accounts({
          sessionToken: sessionAccount,
          authority: owner,
        });
    } catch (error) {
      console.error('Error revoking session:', error);
      throw new Error('Failed to revoke session.');
    }
  }
}
