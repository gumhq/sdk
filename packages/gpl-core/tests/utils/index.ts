import * as anchor from '@project-serum/anchor';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GumNameService } from '../../src';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const provider = anchor.getProvider();

export async function airdrop(key: PublicKey) {
  const airdropSig = await provider.connection.requestAirdrop(key, 1 * LAMPORTS_PER_SOL);
  return provider.connection.confirmTransaction(airdropSig);
}

export async function createGumTld(userWallet: NodeWallet) {
  const nameservice = new GumNameService(
    userWallet,
    new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
    "localnet"
  )

  const gumTld = await nameservice.getOrCreateTLD("gum");
  console.log("gumTld", JSON.stringify(gumTld, null, 2));
  return gumTld;
}

export async function createGumDomain(userWallet: NodeWallet, gumTld: anchor.web3.PublicKey, domain: string) {
  const nameservice = new GumNameService(
    userWallet,
    new anchor.web3.Connection("http://127.0.0.1:8899", "processed"),
    "localnet"
  );
  const user = userWallet.publicKey;
  const screenName = await nameservice.getOrCreateDomain(gumTld, domain, user);
  return screenName;
}