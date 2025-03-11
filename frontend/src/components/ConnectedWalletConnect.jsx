import React, { useState } from "react";
import { CiWallet } from "react-icons/ci";

const ConnectedWalletConnect = ({ walletAddress, handleDisconnect }) => {
  const [openDisconnect, setOpenDisconnect] = useState(false);
  const handleDisconnectButton = () => {
    setOpenDisconnect(!openDisconnect);
    handleDisconnect();
  };
  return (
    
    <div className="flex flex-col relative justify-center items-center">
      <button
        onClick={() => setOpenDisconnect(!openDisconnect)}
        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
      >
        <span className="flex justify-center items-center gap-3 px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
          <CiWallet />{" "}
          {walletAddress
            ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "Connected"}
        </span>
      </button>

      {openDisconnect && (
        <button
        onClick={handleDisconnectButton}
          type="button"
          class="absolute top-15 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Disconnect
        </button>
      )}
    </div>
  );
};

export default ConnectedWalletConnect;
