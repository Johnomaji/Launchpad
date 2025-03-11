import React, { useEffect } from "react";
import useAuthFlow from "../hooks/useAuthFlow";
import { useWallet, ConnectButton } from "@suiet/wallet-kit";
import { toast } from "react-toastify";
import CustomWalletConnect from "./CustomWalletConnect";

const AuthButton = () => {
  const wallet = useWallet();
  console.log(wallet);
  const { handleAuth } = useAuthFlow();

  useEffect(() => {
    if (!wallet.connected) return;

    const authenticateUser = async () => {
      try {
        // Sign a message for authentication
        const msg = 'Authentication'
      // convert string to Uint8Array 
      const msgBytes = new TextEncoder().encode(msg)
      
      const result = await wallet.signPersonalMessage({
        message: msgBytes
      })
            // verify signature with publicKey and SignedMessage (params are all included in result)
      const verifyResult = await wallet.verifySignedMessage(result, wallet.account.publicKey)
      if (!verifyResult) {
        console.log('signPersonalMessage succeed, but verify signedMessage failed')
      } else {
        console.log('signPersonalMessage succeed, and verify signedMessage succeed! :', verifyResult)
        await handleAuth(wallet.account?.address, verifyResult);
      }

        // Trigger the authentication flow with the wallet address

      } catch (error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication Failed");
        wallet.disconnect(); 
      }
    };

    authenticateUser();
  }, [wallet.connected]);

  if (wallet.connected) return <ConnectButton></ConnectButton>;

  return (
    <ConnectButton
      style={{
        backgroundColor: "transparent",
        padding: "0px",
        margin: "0px",
        maxWidth:"fit-content"
      }}
    >
      <CustomWalletConnect
        walletAddress={wallet.address}
        connected={wallet.connected}
        connecting={wallet.connecting}
      />
    </ConnectButton>
  );
};

export default AuthButton;
