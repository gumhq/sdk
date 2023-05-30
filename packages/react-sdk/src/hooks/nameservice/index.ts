import { GumNameService } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useNameService = (nameService: GumNameService) => {
  const [state, setState] = useState({
    isCreating: false,
    creationError: null as Error | null,
  });

  const createTLD = useCallback(
    async (tld: string) => {
      setState({ isCreating: true, creationError: null });

      try {
        const { tldPDA, instructionMethodBuilder } = await nameService.createTLD(tld);
        await instructionMethodBuilder.rpc();
        setState({ isCreating: false, creationError: null });
        return tldPDA;
      } catch (err: any) {
        setState({ isCreating: false, creationError: err });
      }
    },
    [nameService]
  );

  const createDomain = useCallback(
    async (tldPDA: PublicKey, domain: string, authority: PublicKey) => {
      setState({ isCreating: true, creationError: null });

      try {
        const { gumDomainPDA, instructionMethodBuilder } = await nameService.createDomain(tldPDA, domain, authority);
        await instructionMethodBuilder.rpc();
        setState({ isCreating: false, creationError: null });
        return gumDomainPDA;
      } catch (err: any) {
        setState({ isCreating: false, creationError: err });
      }
    },
    [nameService]
  );

  const transferDomain = useCallback(
    async (domainPDA: PublicKey, currentAuthority: PublicKey, newAuthority: PublicKey) => {
      setState({ isCreating: true, creationError: null });

      try {
        const instructionMethodBuilder = await nameService.transferDomain(domainPDA, currentAuthority, newAuthority)
        await instructionMethodBuilder.rpc();
        setState({ isCreating: false, creationError: null });
      } catch (err: any) {
        setState({ isCreating: false, creationError: err });
      }
    },
    [nameService]
  );

  return {
    createTLD,
    createDomain,
    transferDomain,
    ...state,
  };
};

export { useNameService };
