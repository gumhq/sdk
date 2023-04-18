import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { PublicKey, Keypair, Cluster, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import gpl_session_idl from "./idl/gpl_session.json";
import { GPLSESSION_PROGRAMS } from "./constants";

export class SessionTokenManager {
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

  private async create(sessionSignerKeypair: Keypair, targetProgramPublicKey: PublicKey, ownerPublicKey: PublicKey, topUp: boolean = false, validUntilTimestamp: number | null = null) {
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
      sessionPDA: sessionPDA,
    };
  }

  public async createSession(sessionSignerKeypair: Keypair, targetProgramPublicKey: PublicKey, ownerPublicKey: PublicKey, topUp = false, validUntilTimestamp: number | null = null) {
    try {
      const { instructionMethodBuilder, sessionPDA } = await this.create(sessionSignerKeypair, targetProgramPublicKey, ownerPublicKey, topUp, validUntilTimestamp);

      return {
        instructionMethodBuilder: instructionMethodBuilder,
        sessionPDA: sessionPDA,
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session.');
    }
  }

  public async revoke(sessionSignerKeypair: Keypair, sessionAccount: PublicKey, owner: PublicKey) {
    try {
      // Transfer all SOL from sessionSigner to owner
      const sessionWallet = new anchor.Wallet(sessionSignerKeypair);
      const sessionSignerPublicKey = sessionSignerKeypair.publicKey;
      const sessionSignerSolanaBalance = await this.provider.connection.getBalance(sessionSignerPublicKey);
      if (sessionSignerSolanaBalance > 0) {
        const transferTx = new Transaction().add(anchor.web3.SystemProgram.transfer({
          fromPubkey: sessionSignerPublicKey,
          toPubkey: owner,
          lamports: sessionSignerSolanaBalance,
        }));
        transferTx.feePayer = sessionSignerPublicKey;
        transferTx.recentBlockhash = (await this.provider.connection.getLatestBlockhash()).blockhash;
        const estimatedFee = await transferTx.getEstimatedFee(this.provider.connection);

        if (sessionSignerSolanaBalance > estimatedFee) {
          const transaction = new Transaction().add(anchor.web3.SystemProgram.transfer({
            fromPubkey: sessionSignerPublicKey,
            toPubkey: owner,
            lamports: sessionSignerSolanaBalance - estimatedFee,
          }));
          transaction.feePayer = sessionSignerPublicKey;
          transaction.recentBlockhash = (await this.provider.connection.getLatestBlockhash()).blockhash;
          await sessionWallet.signTransaction(transaction);
          await sendAndConfirmTransaction(this.provider.connection, transaction, [sessionSignerKeypair]);
        }
      }

      // Revoke session
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
