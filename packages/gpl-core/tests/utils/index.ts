import * as anchor from '@project-serum/anchor';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GumNameService, SDK } from '../../src';

const provider = anchor.getProvider();

export async function airdrop(key: PublicKey) {
  const airdropSig = await provider.connection.requestAirdrop(key, 1 * LAMPORTS_PER_SOL);
  return provider.connection.confirmTransaction(airdropSig);
}

export async function createGumTld(sdk: SDK) {
  const nameservice = new GumNameService(sdk);

  const gumTld = await nameservice.getOrCreateTLD("gum");
  return gumTld;
}

export async function createGumDomain(sdk: SDK, gumTld: anchor.web3.PublicKey, domain: string) {
  const nameservice = new GumNameService(sdk);
  const user = sdk.provider.wallet.publicKey;
  const screenName = await nameservice.getOrCreateDomain(gumTld, domain, user);
  return screenName;
}