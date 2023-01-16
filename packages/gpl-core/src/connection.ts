import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { SEED_PREFIXES } from "./constants";

export class Connection {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  connectionPDA(fromProfile: anchor.web3.PublicKey, toProfile: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    return anchor.web3.PublicKey.findProgramAddressSync(
      [SEED_PREFIXES["connection"], fromProfile.toBuffer(), toProfile.toBuffer()],
      program.programId
    );
  }

  public async create(
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const [connectionAccount, _] = this.connectionPDA(fromProfile, toProfile);
    const connectionIx = program.methods
    .createConnection()
    .accounts({
      connection: connectionAccount,
      fromProfile: fromProfile,
      toProfile: toProfile,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return connectionIx;
  }

  public async delete(
    connectionAccount: anchor.web3.PublicKey,
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const connectionIx = program.methods
    .deleteConnection()
    .accounts({
      connection: connectionAccount,
      fromProfile: fromProfile,
      toProfile: toProfile,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return connectionIx;
  }
}