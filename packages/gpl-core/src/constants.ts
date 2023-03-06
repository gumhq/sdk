import * as anchor from "@project-serum/anchor";

export const GPLCORE_PROGRAMS = {
  "mainnet-beta": new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm"
  ),
  devnet: new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm"
  ),
  localnet: new anchor.web3.PublicKey(
    "CDDMdCAWB5AXgvEy7XJRggAu37QPG1b9aJXndZoPUkkm"
  ),
  testnet: new anchor.web3.PublicKey(
    "9XZ9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z9Y9Z"
  ),
};

export const GRAPHQL_ENDPOINTS = {
  devnet: "https://light-pelican-32.hasura.app/v1/graphql",
};