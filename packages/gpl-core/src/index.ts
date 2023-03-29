import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { Cluster } from "@solana/web3.js";
import { Connection, GraphQLConnection } from "./connection";
import { GPLCORE_PROGRAMS, GRAPHQL_ENDPOINTS } from "./constants";
import { Post, GraphQLPost, GraphQLFeed } from "./post";
import { Profile, GumDecodedProfile, Namespace } from "./profile";
import { Reaction, ReactionType, GraphQLReaction } from "./reaction";
import { User, GumDecodedUser } from "./user";
import { ProfileMetadata, ProfileMetadataType, GraphQLProfileMetadata } from "./profileMetadata";
import gpl_core_idl from "./idl/gpl_core.json";
import { GraphQLClient } from "graphql-request";
import { SessionTokenManager } from "./sessionTokenManager";
import { PostMetadata } from "./postMetadata";

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
  Namespace,
  Reaction,
  ReactionType,
  GraphQLReaction,
  User,
  GumDecodedUser,
  ProfileMetadata,
  ProfileMetadataType,
  GraphQLProfileMetadata,
  SessionTokenManager,
  PostMetadata,
};

export class SDK {
  readonly program: anchor.Program;
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
    );
    this.rpcConnection = connection;
    this.gqlClient = gqlClient;
  }

  public user = new User(this);
  public profile = new Profile(this);
  public profileMetadata = new ProfileMetadata(this);
  public connection = new Connection(this);
  public post = new Post(this);
  public reaction = new Reaction(this);
}
