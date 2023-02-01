import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import randomBytes from "randombytes";

export class User {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async userPDA(randomHash: Buffer) {
    const { program } = this.sdk;
    const [userPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), randomHash],
      program.programId
    );
    return userPDA;
  }

  public async get(userAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.user.fetch(userAccount);
  }

  public async getUserAccountsInfo(user: anchor.web3.PublicKey) {
    return await this.sdk.program.account.user.all([
      { memcmp: { offset: 8, bytes: user.toBase58() } },
    ]);
  }

  public async create(user: anchor.web3.PublicKey) {
    const randomHash = randomBytes(32);
    const instructionMethodBuilder = this.sdk.program.methods
      .createUser(randomHash)
      .accounts({
        authority: user,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const userPDA = pubKeys.user as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
      userPDA,
    };
  }

  public update(
    userAccount: anchor.web3.PublicKey,
    newAuthority: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey
  ) {
    const { program } = this.sdk;
    return program.methods
      .updateUser()
      .accounts({
        user: userAccount,
        newAuthority: newAuthority,
        authority: user,
      });
  }

  public delete(
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey
  ) {
    const { program } = this.sdk;
    return program.methods
      .deleteUser()
      .accounts({
        user: userAccount,
        authority: user,
      });
  }
}