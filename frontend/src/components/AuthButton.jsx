import React, { useEffect } from "react";
import useAuthFlow from "../hooks/useAuthFlow";
import { useWallet, ConnectButton } from "@suiet/wallet-kit";
import CustomWalletConnect from "./CustomWalletConnect";
import useLogout from "../hooks/useLogout";
import useAuthCheck from "../hooks/useAuthCheck";
import ConnectedWalletConnect from "./ConnectedWalletConnect";

const AuthButton = () => {
  const wallet = useWallet();
  const { handleAuth } = useAuthFlow();
  const { logout } = useLogout();
  const { isAuthenticated } = useAuthCheck();

  //Disconnect User
  const handleDisconnect = () =>{
    wallet.disconnect()
    logout();
  }

  useEffect(() => {
    if (!wallet.connected) {
      return;
    }

    if(isAuthenticated){
        return;
    }
    const authenticateUser = async () => {
      try {
        // Sign a message for authentication
        const msg = "Sign-In Request";
        // convert string to Uint8Array
        const msgBytes = new TextEncoder().encode(msg);

        const result = await wallet.signPersonalMessage({
          message: msgBytes,
        });
        // verify signature with publicKey and SignedMessage (params are all included in result)
        const verifyResult = await wallet.verifySignedMessage(
          result,
          wallet.account.publicKey
        );
        if (!verifyResult) {
          console.log(
            "signPersonalMessage succeed, but verify signedMessage failed"
          );
          wallet.disconnect();
        } else {
          console.log(
            "signPersonalMessage succeed, and verify signedMessage succeed! :",
            verifyResult
          );
          // Trigger the authentication flow with the wallet address and signature
            await handleAuth(wallet.account?.address, verifyResult);
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        wallet.disconnect();
      }
    };

    authenticateUser();
  }, [wallet.connected]);

 
  if (wallet.connected) return <ConnectedWalletConnect walletAddress={wallet.address} handleDisconnect={handleDisconnect} />;

  return (
    <ConnectButton
      style={{
        backgroundColor: "transparent",
        padding: "0px",
        margin: "0px",
        maxWidth: "fit-content",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
