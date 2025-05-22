// src/lib/thirdweb.tsx
import React, { PropsWithChildren } from 'react';
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export function AppThirdwebProvider({ children }: PropsWithChildren) {
  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}