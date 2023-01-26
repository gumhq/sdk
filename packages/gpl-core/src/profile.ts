import { SDK } from ".";
import * as anchor from "@project-serum/anchor";

type Namespace = "Professional" | "Personal" | "Gaming" | "Degen";

export class Profile {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  public async get(profileAccount: anchor.web3.PublicKey) {
    return await this.sdk.program.account.profile.fetch(profileAccount);
  }

  public async create(
    userAccount: anchor.web3.PublicKey,
    namespace: Namespace,
    user: anchor.web3.PublicKey) {
    const program = this.sdk.program.methods
      .createProfile(namespace)
      .accounts({
        user: userAccount,
        authority: user,
      });
    const pubKeys = await program.pubkeys();
    const profilePDA = pubKeys.profile as anchor.web3.PublicKey;
    return {
      program,
      profilePDA,
    };
  }

  public delete(
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    return program.methods
      .deleteProfile()
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      })
  }
}