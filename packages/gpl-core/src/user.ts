import { SDK } from ".";
import * as anchor from "@project-serum/anchor";

export class User {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(userAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.user.fetch(userAccount);
  }

  public create(user: anchor.web3.PublicKey, randomHash: Buffer) {
    const { program } = this.sdk;
    return program.methods
      .createUser(randomHash)
      .accounts({
        authority: user,
      });
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