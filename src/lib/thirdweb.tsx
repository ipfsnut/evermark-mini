import React, { PropsWithChildren } from 'react';
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { CHAIN } from './contracts';

// Add at the top of the file
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
console.log("Thirdweb Client ID:", clientId ? "Loaded (length: " + clientId.length + ")" : "Missing");

export const client = createThirdwebClient({
  clientId: clientId || "your_client_id_here",
});

export function AppThirdwebProvider({ children }: PropsWithChildren) {
  // Create a props object and use type assertion if needed
  const providerProps = {
    client,
    activeChain: CHAIN,
  } as any;

  return (
    <ThirdwebProvider {...providerProps}>
      {children}
    </ThirdwebProvider>
  );
}
