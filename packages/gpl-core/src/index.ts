import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { Cluster } from "@solana/web3.js";
import { Connection } from "./connection";
import { GPLCORE_PROGRAMS } from "./constants";
import { Post } from "./post";
import { Profile } from "./profile";
import { Reaction } from "./reaction";
import { User } from "./user";
import gpl_core_idl from "./idl/gpl_core.json";
import { ProfileMetadata } from "./profileMetadata";
import { GraphQLClient } from "graphql-request";

export { GPLCORE_PROGRAMS } from "./constants";
export { GRAPHQL_ENDPOINTS } from "./constants";

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
            this.provider);
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