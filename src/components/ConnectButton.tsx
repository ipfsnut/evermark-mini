import React from 'react';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../../lib/thirdweb";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export function WalletConnect() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme="light"
      connectButton={{
        label: "Connect Wallet",
        style: {
          backgroundColor: '#8252e4',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
        }
      }}
    />
  );
}