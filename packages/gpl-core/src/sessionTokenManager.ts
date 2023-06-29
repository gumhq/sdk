import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { PublicKey, Cluster } from "@solana/web3.js";
import { GplSession } from "./idl/gpl_session";
import gpl_session_idl from "./idl/gpl_session.json";
import { GPLSESSION_PROGRAMS } from "./constants";

export class SessionTokenManager {
  readonly program: anchor.Program<GplSession>;
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
      this.provider) as anchor.Program<GplSession>;
  }

  public async get(sessionAccount: PublicKey) {
    return this.program.account.sessionToken.fetch(sessionAccount);
  }
}
