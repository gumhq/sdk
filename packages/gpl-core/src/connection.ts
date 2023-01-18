import { SDK } from ".";
import * as anchor from "@project-serum/anchor";

export class Connection {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(connectionAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.connection.fetch(connectionAccount);
  }

  public async create(
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .createConnection()
      .accounts({
        fromProfile: fromProfile,
        toProfile: toProfile,
        user: userAccount,
        authority: user,
        systemProgram: anchor.web3.SystemProgram.programId,
      });
  }

  public async delete(
    connectionAccount: anchor.web3.PublicKey,
    fromProfile: anchor.web3.PublicKey,
    toProfile: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    return this.sdk.program.methods
      .deleteConnection()
      .accounts({
        connection: connectionAccount,
        fromProfile: fromProfile,
        toProfile: toProfile,
        user: userAccount,
        authority: user,
        systemProgram: anchor.web3.SystemProgram.programId,
      });
  }
}