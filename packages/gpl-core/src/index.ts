import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { Cluster } from "@solana/web3.js";
import { Connection, GraphQLConnection } from "./connection";
import { GPLCORE_PROGRAMS, GPL_NAMESERVICE_PROGRAMS, GRAPHQL_ENDPOINTS } from "./constants";
import { Post, GraphQLPost, GraphQLFeed } from "./post";
import { Profile, GumDecodedProfile } from "./profile";
import { Reaction, GraphQLReaction } from "./reaction";
import { Badge } from "./badge";
import { GplCore } from "./idl/gpl_core";
import gpl_core_idl from "./idl/gpl_core.json";
import { GraphQLClient } from "graphql-request";
import { SessionTokenManager } from "./sessionTokenManager";
import { PostMetadata } from "./postMetadata";
import { GumNameService } from "./nameservice";
import { GplNameservice } from "./idl/gpl_nameservice";
import gpl_nameservice from "./idl/gpl_nameservice.json";

export {
  GPLCORE_PROGRAMS,
  GRAPHQL_ENDPOINTS,
  Connection,
  GraphQLConnection,
  Post,
  GraphQLPost,
  GraphQLFeed,
  Profile,
  GumDecodedProfile,
  Reaction,
  GraphQLReaction,
  Badge,
  SessionTokenManager,
  PostMetadata,
  GumNameService,
};

export class SDK {
  readonly program: anchor.Program<GplCore>;
  readonly nameserviceProgram: anchor.Program<GplNameservice>;
  readonly provider: anchor.AnchorProvider;
  readonly rpcConnection: anchor.web3.Connection;
  readonly cluster: Cluster | "localnet";
  readonly gqlClient?: GraphQLClient;

  constructor(
    wallet: Wallet,
    connection: anchor.web3.Connection,
    opts: anchor.web3.ConfirmOptions,
    cluster: Cluster | "localnet",
    gqlClient?: GraphQLClient
  ) {
    this.cluster = cluster;
    this.provider = new anchor.AnchorProvider(connection, wallet, opts);
    this.program = new anchor.Program(
      gpl_core_idl as anchor.Idl,
      GPLCORE_PROGRAMS[this.cluster] as anchor.web3.PublicKey,
      this.provider
    ) as anchor.Program<GplCore>;
    this.nameserviceProgram = new anchor.Program(
        gpl_nameservice as anchor.Idl,
        GPL_NAMESERVICE_PROGRAMS[cluster] as anchor.web3.PublicKey,
        this.provider) as anchor.Program<GplNameservice>;
    this.rpcConnection = connection;
    this.gqlClient = gqlClient;
  }

  public profile = new Profile(this);
  public connection = new Connection(this);
  public post = new Post(this);
  public reaction = new Reaction(this);
  public badge = new Badge(this);
}
