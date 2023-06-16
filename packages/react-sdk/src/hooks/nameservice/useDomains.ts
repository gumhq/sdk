import { useState, useEffect, useCallback } from "react";
import { SDK } from "@gumhq/sdk";
import { PublicKey } from "@solana/web3.js";

const useDomains = (sdk: SDK, authority: PublicKey) => {
  const [userDomainAccounts, setUserDomainAccounts] = useState<any>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [domainsError, setDomainsError] = useState<Error | null>(null);

  const fetchDomains = useCallback(
    async () => {

      setDomainsLoading(true);
      setDomainsError(null);

      try {
        const accounts = await sdk.nameservice.getNameservicesByAuthority(authority.toBase58() as string);

        if (!accounts) return;

        const domainOptions = accounts.map((account) => {
          return {
            domainPDA: account.address,
            domainName: account.name,
          };
        });

        setUserDomainAccounts(domainOptions);
      } catch (err: any) {
        setDomainsError(err);
      } finally {
        setDomainsLoading(false);
      }
    }, [authority, sdk]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  return { userDomainAccounts, domainsLoading, domainsError };
};

export { useDomains };
