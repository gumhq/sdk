import { SDK } from "../src";
import * as anchor from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { expect } from "chai";

anchor.setProvider(anchor.AnchorProvider.env());
const userWallet = (anchor.getProvider() as any).wallet;
const user = userWallet.payer;

describe("ProfileMetadata", async () => {
  let sdk: SDK;
  let userPDA: anchor.web3.PublicKey;
  let profilePDA: anchor.web3.PublicKey;
  let profileMetadataPDA: anchor.web3.PublicKey;

  before(async () => {
    sdk = new SDK(
      new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
      "localnet"
    );

    // Create a user
    const tx = await sdk.user.create(user.publicKey);
    userPDA = tx.userPDA as anchor.web3.PublicKey;
    await tx.program.rpc();

    // Create a profile
    const profile = await sdk.profile.create(
      userPDA,
      "Personal",
      user.publicKey,
    );
    profilePDA = profile.profilePDA as anchor.web3.PublicKey;
    await profile.program.rpc();
  });

  it("should create a profile metadata", async () => {
    const metadataUri = "https://example.com";
    const profileMetadata = await sdk.profileMetadata.create(
      metadataUri,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    profileMetadataPDA = profileMetadata.profileMetadataPDA as anchor.web3.PublicKey;
    await profileMetadata.program.rpc();
    const profileMetadataAccount = await sdk.profileMetadata.get(profileMetadataPDA);
    expect(profileMetadataAccount.profile.toString()).is.equal(profilePDA.toString());
    expect(profileMetadataAccount.metadataUri.toString()).is.equal(metadataUri);
  });

  it("it should update a profile metadata", async () => {
    const metadataUri = "https://example.com/updated";
    const profileMetadata = sdk.profileMetadata.update(
      metadataUri,
      profileMetadataPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await profileMetadata.rpc();
    const profileMetadataAccount = await sdk.profileMetadata.get(profileMetadataPDA);
    expect(profileMetadataAccount.profile.toString()).is.equal(profilePDA.toString());
    expect(profileMetadataAccount.metadataUri.toString()).is.equal(metadataUri);
  });

  it("should delete a profile metadata", async () => {
    const profileMetadata = sdk.profileMetadata.delete(
      profileMetadataPDA,
      profilePDA,
      userPDA,
      user.publicKey,
    );
    await profileMetadata.rpc();
    try {
      await sdk.profileMetadata.get(profileMetadataPDA);
    } catch (error: any) {
      expect(error).to.be.an("error");
      expect(error.toString()).to.contain(`Account does not exist or has no data ${profileMetadataPDA.toString()}`);
    }
  });
});