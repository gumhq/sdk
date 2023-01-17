import { SDK } from ".";
import * as anchor from "@project-serum/anchor";
import { SEED_PREFIXES } from "./constants";

type Namespace = "Professional" | "Personal" | "Gaming" | "Degen";

export class Profile {
  readonly sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  profilePDA(namespace: Namespace, userAccount: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    return anchor.web3.PublicKey.findProgramAddressSync(
      [SEED_PREFIXES["profile"], Buffer.from(namespace.toString()), userAccount.toBuffer()],
      program.programId
    );
  }

  public async get(profileAccount: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const profile = await program.account.profile.fetch(profileAccount);
    return profile;
  }

  public async create(
    userAccount: anchor.web3.PublicKey,
    namespace: Namespace,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const [profileAccount, _] = this.profilePDA(namespace, userAccount);
    const namespaceFormat = { [namespace.toString().toLowerCase()]: {} };
    const profileIx = program.methods
      .createProfile(namespaceFormat)
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      })
      .instruction();
    return profileIx;
  }

  public async delete(
    profileAccount: anchor.web3.PublicKey,
    userAccount: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey) {
    const { program } = this.sdk;
    const profileIx = program.methods
      .deleteProfile()
      .accounts({
        profile: profileAccount,
        user: userAccount,
        authority: user,
      })
      .instruction();
    return profileIx;
  }
}