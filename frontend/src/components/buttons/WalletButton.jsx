import React, { useEffect, useRef, useState } from "react";

const WalletButton = ({ wallet, icon, handleDisconnect }) => {
    const [openDisconnect, setOpenDisconnect] = useState(false);
    const divRef = useRef(null);
  const handleDisconnectButton = () => {
    setOpenDisconnect(!openDisconnect);
    handleDisconnect();
  };


  const handleClickOutside = (event) => {
    // Check if the click occurred outside the div
    if (divRef.current && !divRef.current.contains(event.target)) {

      setOpenDisconnect(!openDisconnect)
    }
  };


  useEffect(() => {
    // Attach the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 
  
  return (
    <div className="flex flex-col relative justify-center items-center">
      <button
        onClick={() => setOpenDisconnect(!openDisconnect)}
        type="button"
        className="flex flex-row gap-2 items-center justify-center text-gray-900 font-medium rounded-2xl text-md px-5 py-2.5 text-center me-2 mb-2 dark:text-[#B386FF] transition-all duration-900 hover:bg-gradient-to-r from-[#fff] to-[#5A189A] hover:bg-clip-text hover:text-transparent cursor-pointer"
      >
        <span>{icon && icon}</span>
        <span>|</span>
        <span>
          {wallet && `${wallet?.slice(0, 6)}....${wallet?.slice(-4)}`}
        </span>
      </button>

      {openDisconnect && (
        <button
          onClick={handleDisconnectButton}
          type="button"
          class="absolute top-10 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Disconnect
        </button>
      )}
    </div>
  );
};

export default WalletButton;
