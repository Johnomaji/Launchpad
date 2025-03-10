import React, { useEffect } from "react";
import useAuthFlow from "../hooks/useAuthFlow";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { toast } from "react-toastify";

const AuthButton = () => {
  const wallet = useWallet();
  const { handleAuth } = useAuthFlow();

  useEffect(() => {
    if (!wallet.connected) return;

    const handleSignMessage = async () => {
      try {
        // Sign a message for authentication
        await wallet.signPersonalMessage({
          message: new TextEncoder().encode("Authentication"),
        });

        // Trigger the authentication flow with the wallet address
        await handleAuth(wallet.account?.address);

        toast.success("Authentication Successful");
      } catch (error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication Failed");
        wallet.disconnect
      }
    };

    handleSignMessage();

    console.log("connected wallet name: ", wallet.name);
    console.log("account address: ", wallet.account?.address);
    console.log("account publicKey: ", wallet.account?.publicKey);
  }, [wallet.connected]);

  return <ConnectButton />;
};

export default AuthButton;