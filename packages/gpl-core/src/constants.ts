import * as anchor from "@project-serum/anchor";

export const GPLCORE_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm"
  ),
  devnet: new anchor.web3.PublicKey(
    "CE5LZTE7SZeaf65qid8zcvqJCM2nPJmhzMFW9C1y54WB"
  ),
  localnet: new anchor.web3.PublicKey(
    "4KnnwKYMEsHid1NL3LKKS3z2Y2iXRVwfDSRdQPWwJ1Em"
  ),
  testnet: new anchor.web3.PublicKey(
    "9XZ9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z"
  ),
};