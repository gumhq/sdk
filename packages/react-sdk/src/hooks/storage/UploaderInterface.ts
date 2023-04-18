import { WalletContextState } from '@solana/wallet-adapter-react';
import { SessionWalletInterface } from '../session';
export interface Uploader {
  upload(data: string | object | File, wallet: WalletContextState | SessionWalletInterface): Promise<{url: string, signature: string}>;
}
