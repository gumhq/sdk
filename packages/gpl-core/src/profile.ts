import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randombytes from "randombytes";
import { SEED_PREFIXES } from "./constants";

export enum Namespace {
  Professional,
  Personal,
  Gaming,
  Degen,
}

export class Profile {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  profilePDA(namespace: Namespace, userAccount: anchor.web3.PublicKey) {
    const { program, provider } = this.sdk;
    return anchor.web3.PublicKey.findProgramAddressSync(
      [SEED_PREFIXES["profile"], Buffer.from(namespace.toString()), userAccount.toBuffer()],
      program.programId
    );
  }

  public async create(
    user: anchor.web3.PublicKey, 
    namespace: Namespace, 
    userAccount: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const [profileAccount, _] = this.profilePDA(namespace, userAccount);
    const profile = program.methods
    .createProfile(namespace)
    .accounts({
      profile: profileAccount,
      user: userAccount,
      authority: user,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
    return profile;
  }

  public async delete(
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey, 
    user: anchor.web3.PublicKey) {
    const { program, provider } = this.sdk;
    const userIx = program.methods
    .deleteProfile()
    .accounts({
      profile: profileAccount,
      user: userAccount,
      authority: user,
    })
    return userIx;
  }
}