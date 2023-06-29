import { SDK } from "@gumhq/sdk";
import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";

const useNameService = (sdk: SDK) => {
  const [state, setState] = useState({
    isCreating: false,
    creationError: null as Error | null,
  });

  const getOrCreateDomain = useCallback(
    async (tldPDA: PublicKey, domain: string, authority: PublicKey) => {
      setState({ isCreating: true, creationError: null });

      try {
        const gumDomainPDA = await sdk.nameservice.getOrCreateDomain(tldPDA, domain, authority);
        setState({ isCreating: false, creationError: null });
        return gumDomainPDA;
      } catch (err: any) {
        setState({ isCreating: false, creationError: err });
      }
    },
    [sdk]
  );

  const transferDomain = useCallback(
    async (domainPDA: PublicKey, currentAuthority: PublicKey, newAuthority: PublicKey) => {
      setState({ isCreating: true, creationError: null });

      try {
        const instructionMethodBuilder = await sdk.nameservice.transferDomain(domainPDA, currentAuthority, newAuthority)
        await instructionMethodBuilder.rpc();
        setState({ isCreating: false, creationError: null });
      } catch (err: any) {
        setState({ isCreating: false, creationError: err });
      }
    },
    [sdk]
  );

  return {
    getOrCreateDomain,
    transferDomain,
    ...state,
  };
};

export { useNameService };

export { useDomains } from "./useDomains";