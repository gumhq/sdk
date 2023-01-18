import * as anchor from "@project-serum/anchor";
import { Cluster } from "@solana/web3.js";
import { Connection } from "./connection";
import { GPLCORE_PROGRAMS } from "./constants";
import { Post } from "./post";
import { Profile } from "./profile";
import { Reaction } from "./reaction";
import { User } from "./user";
const gpl_core_idl = require('./idl/gpl_core.json');

export class SDK {
    readonly program: anchor.Program;
    readonly provider: anchor.AnchorProvider;
    readonly rpcConnection: anchor.web3.Connection;
    readonly cluster: Cluster | "localnet";

    constructor(
        wallet: anchor.Wallet,
        connection: anchor.web3.Connection,
        opts: anchor.web3.ConfirmOptions,
        cluster: Cluster | "localnet",
    ) {
        this.cluster = cluster;
        this.provider = new anchor.AnchorProvider(connection, wallet, opts);
        this.program = new anchor.Program(
            gpl_core_idl as anchor.Idl,
            GPLCORE_PROGRAMS[this.cluster] as anchor.web3.PublicKey,
            this.provider);
        this.rpcConnection = connection;
    }

    public user = new User(this);
    public profile = new Profile(this);
    public connection = new Connection(this);
    public post = new Post(this);
    public reaction = new Reaction(this);
}