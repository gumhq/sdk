import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { PublicKey, Cluster } from "@solana/web3.js";
import { GplNameservice } from "./idl/gpl_nameservice";
import gpl_nameservice from "./idl/gpl_nameservice.json";
import { GPL_NAMESERVICE_PROGRAMS } from "./constants";
import { keccak_256 } from "js-sha3";

export class GumNameService {
  readonly program: anchor.Program<GplNameservice>;
  readonly provider: anchor.AnchorProvider;

  constructor(
    wallet: Wallet,
    connection: anchor.web3.Connection,
    cluster: Cluster | "localnet",
  ) {
    this.provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    this.program = new anchor.Program(
      gpl_nameservice as anchor.Idl,
      GPL_NAMESERVICE_PROGRAMS[cluster] as anchor.web3.PublicKey,
      this.provider) as anchor.Program<GplNameservice>;
  }

  public async get(tldAccount: PublicKey) {
    return this.program.account.nameRecord.fetch(tldAccount);
  }

  public async getOrCreateTLD(
    tld: string,
  ) {
    const tldHash = keccak_256(tld);

    const [tldAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(tldHash, "hex"),
        PublicKey.default.toBuffer(),
      ],
      this.program.programId
    );
    try {
      await this.get(tldAccount);
    } catch (err) {
      const instructionMethodBuilder = this.program.methods.createTld(tld)
        .accounts({
          nameRecord: tldAccount,
        })
      await instructionMethodBuilder.rpc();
    }
    return tldAccount;
  }

  public async createTLD(
    tld: string,
  ) {
    const tldHash = keccak_256(tld);

    const [tldAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(tldHash, "hex"),
        PublicKey.default.toBuffer(),
      ],
      this.program.programId
    );

    const instructionMethodBuilder = this.program.methods.createTld(tld)
      .accounts({
        nameRecord: tldAccount,
      })
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const tldPDA = pubKeys.nameRecord as PublicKey;
    return { tldPDA, instructionMethodBuilder };
  }

  public async getOrCreateDomain(
    tldPDA: PublicKey,
    domain: string,
    authority: PublicKey,
  ) {
    const domainHash = keccak_256(domain);

    const [domainAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(domainHash, "hex"),
        tldPDA.toBuffer(),
      ],
      this.program.programId
    );
    try {
      await this.get(domainAccount);
    } catch (err) {
      await this.program.methods.createNameRecord(domain)
        .accounts({
          domain: tldPDA,
          nameRecord: domainAccount,
          authority: authority,
        }).rpc();
    }
    return domainAccount;
  }

  public async createDomain(
    tldPDA: PublicKey,
    domain: string,
    authority: PublicKey,
  ) {
    const domainHash = keccak_256(domain);

    const [domainAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("name_record"),
        Buffer.from(domainHash, "hex"),
        tldPDA.toBuffer(),
      ],
      this.program.programId
    );

    const instructionMethodBuilder = this.program.methods.createNameRecord(domain)
      .accounts({
        domain: tldPDA,
        nameRecord: domainAccount,
        authority,
      })
    const pubKeys = await instructionMethodBuilder.pubkeys();
    const gumDomainPDA = pubKeys.nameRecord as PublicKey;
    return { gumDomainPDA, instructionMethodBuilder };
  }

  public async transferDomain(
    domainPDA: PublicKey,
    currentAuthority: PublicKey,
    newAuthority: PublicKey,
  ) {
    return this.program.methods.transferNameRecord()
      .accounts({
        nameRecord: domainPDA,
        authority: currentAuthority,
        newAuthority,
      })
  }
}
