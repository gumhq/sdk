import * as anchor from "@project-serum/anchor";

export const GPLCORE_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "EXzAYHZ8xS6QJ6xGRsdKZXixoQBLsuMbmwJozm85jHp"
  ),
  devnet: new anchor.web3.PublicKey(
    "D9JJgeRf2rKq5LNMHLBMb92g4ZpeMgCyvZkd7QKwSCzg"
  ),
  localnet: new anchor.web3.PublicKey(
    "4KnnwKYMEsHid1NL3LKKS3z2Y2iXRVwfDSRdQPWwJ1Em"
  ),
  testnet: new anchor.web3.PublicKey(
    "9XZ9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z"
  ),
};

export const SEED_PREFIXES = {
  user: Buffer.from("user"),
  profile: Buffer.from("profile"),
  post: Buffer.from("post"),
  connection: Buffer.from("connection"),
  reaction: Buffer.from("reaction"),
};