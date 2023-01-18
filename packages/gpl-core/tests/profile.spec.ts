import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import randombytes from "randombytes";
import { expect } from "chai";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Profile", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profileAccount: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "processed" as anchor.web3.ConfirmOptions,
      "localnet"
    );

    // Create a user
    const randomHash = randombytes(32);
    const tx = sdk.user.create(user.publicKey, randomHash)
    const pubKeys = await tx.pubkeys();
    userPDA = pubKeys.user as anchor.web3.PublicKey;
    await tx.rpc();
  });

  it("should create a profile", async () => {
    const tx = sdk.profile.create(
      userPDA,
      "Personal",
      user.publicKey,
    );
    const pubKeys = await tx.pubkeys();
    profileAccount = pubKeys.profile as anchor.web3.PublicKey;
    await tx.rpc();
    const profile = await sdk.profile.get(profileAccount);
    expect(profile.user.toString()).is.equal(userPDA.toString());
    expect(profile.namespace.toString()).is.equal({ personal: {} }.toString());
  });

  it("should delete a profile", async () => {
    const tx = sdk.profile.delete(
      profileAccount,
      userPDA,
      user.publicKey,
    );
    await tx.rpc();
    try {
      await sdk.profile.get(profileAccount);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${profileAccount.toString()}`);
    }
  });
});