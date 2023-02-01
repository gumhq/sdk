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

  public async getProfileAccountsInfo(user: anchor.web3.PublicKey): Promise<anchor.ProgramAccount<any>[]> {
    const users = await this.sdk.user.getUserAccountsInfo(user);
    const userPDAs = users.map((u) => u.publicKey);
    let profiles = [];
    for (const userPDA of userPDAs) {
      const profile = await this.sdk.program.account.profile.all([
        { memcmp: { offset: 8, bytes: userPDA.toBase58() } },
      ]);
      profiles = [...profiles, ...profile];
    }
    return profiles;
  }

  public async create(
    userAccount: anchor.web3.PublicKey,
    namespace: Namespace,
    user: anchor.web3.PublicKey) {
    const instructionMethodBuilder = this.sdk.program.methods
      .createProfile(namespace)
      .accounts({
        user: userAccount,
        authority: user,
      });
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const profilePDA = pubKeys.profile as anchor.web3.PublicKey;
    return {
      instructionMethodBuilder,
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