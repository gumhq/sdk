import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randombytes from "randombytes";
import { SEED_PREFIXES } from "./constants";

export class User {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  userPDA(randomHash: Buffer) {
    const { program } = this.sdk;
    return anchor.web3.PublicKey.findProgramAddressSync(
      [SEED_PREFIXES["user"], randomHash],
      program.programId
    );
  }

  public async create(user: anchor.web3.PublicKey, randomHash: Buffer) {
    const { program } = this.sdk;
    const [userAccount, _] = this.userPDA(randomHash);
    const userIx = program.methods
    .createUser(randomHash)
    .accounts({
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return userIx;
  }

  public async update(
    userAccount: anchor.web3.PublicKey,
    newAuthority: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey
  ) {
    const { program } = this.sdk;
    const userIx = program.methods
    .updateUser()
    .accounts({
      user: userAccount,
      new_authority: newAuthority,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return userIx;
  }

  public async delete(
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey
  ) {
    const { program } = this.sdk;
    const userIx = program.methods
    .deleteUser()
    .accounts({
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return userIx;
  }
}