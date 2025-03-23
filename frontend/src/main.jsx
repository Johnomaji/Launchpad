import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@suiet/wallet-kit/style.css";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@mysten/dapp-kit/dist/index.css";
import { SuiClientProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiDevnetChain, SuiMainnetChain, SuiTestnetChain, WalletProvider } from "@suiet/wallet-kit";

const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

const SupportedChains = [
  SuiDevnetChain,
  SuiTestnetChain,
  SuiMainnetChain,
];

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <WalletProvider chains={SupportedChains}>
          <ToastContainer theme="dark" />
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>
);
