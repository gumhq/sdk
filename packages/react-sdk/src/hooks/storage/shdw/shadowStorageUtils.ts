import { Connection, PublicKey } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { ShdwDrive, ShadowFile } from '@shadow-drive/sdk';
import { OrcaPool, OrcaU64 } from '@orca-so/sdk';
import Decimal from 'decimal.js';
import { SessionWalletInterface } from 'src/hooks/session';

export type WalletWithSession = WalletContextState & { sessionToken: string };

export const isSessionWallet = (
  wallet: WalletContextState | SessionWalletInterface
): wallet is SessionWalletInterface => {
  return 'sessionToken' in wallet;
};

export const calculateShdwAmount = async (
  orcaPool: OrcaPool,
  solAmount: Decimal
): Promise<OrcaU64> => {
  const solToken = orcaPool.getTokenB();
  const quote = await orcaPool.getQuote(solToken, solAmount);
  return quote.getMinOutputAmount();
};

export const buyShdwWithSol = async (
  orcaPool: OrcaPool,
  wallet: WalletContextState | SessionWalletInterface,
  connection: Connection,
  solAmount: Decimal,
  shdwAmount: OrcaU64
): Promise<string> => {
  if (!wallet?.publicKey || !wallet.sendTransaction) {
    throw new Error('Invalid wallet: missing publicKey or sendTransaction');
  }

  const solToken = orcaPool.getTokenB();
  const swapPayload = await orcaPool.swap(
    wallet.publicKey,
    solToken,
    solAmount,
    shdwAmount
  );

  const transactionSignature = await wallet.sendTransaction(swapPayload.transaction, connection, {
    signers: swapPayload.signers,
    skipPreflight: true,
  });

  return transactionSignature;
};



export const calculateShdwRequired = (sizeInKB: number): number => {
  const bytesNeeded = Math.max(sizeInKB * 1024, 1);
  const shdwRequired = bytesNeeded / Math.pow(10, 9);

  return shdwRequired;
};

export const calculateRequiredSizeInBytes = (
  data: File | ShadowFile
): number => {
  if (data instanceof File) {
    return data.size;
  } else if (data.file instanceof Buffer) {
    return data.file.byteLength;
  } else {
    throw new Error('Invalid data type for calculating required size in bytes.');
  }
};
