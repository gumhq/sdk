import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("Profile", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      userWallet as NodeWallet,
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "processed" as anchor.web3.ConfirmOptions,
      "localnet"
    );

    // Create a user
    const tx = await sdk.user.create(user.publicKey)
    userPDA = tx.userPDA as anchor.web3.PublicKey;
    await tx.program.rpc();
  });

  it("should create a profile", async () => {
    const profile = await sdk.profile.create(
      userPDA,
      "Personal",
      user.publicKey,
    );
    profilePDA = profile.profilePDA as anchor.web3.PublicKey;
    await profile.program.rpc();
    const profileAccount = await sdk.profile.get(profilePDA);
    expect(profileAccount.user.toString()).is.equal(userPDA.toString());
    expect(profileAccount.namespace.toString()).is.equal({ personal: {} }.toString());
  });

  it("should delete a profile", async () => {
    const tx = sdk.profile.delete(
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await tx.rpc();
    try {
      await sdk.profile.get(profilePDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${profilePDA.toString()}`);
    }
  });
});