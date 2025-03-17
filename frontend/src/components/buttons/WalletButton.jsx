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
      setOpenDisconnect(!openDisconnect);
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

  const classes = `relative p-[1px] rounded-3xl inline-block bg-black cursor-pointer`;

  const classes2 = `relative flex flex-row gap-2 justify-center items-center p-3 px-6 hover:bg-white rounded-3xl font-medium text-md transition-all duration-900 text-[#B386FF] hover:text-[#5A189A] bg-black`;

  return (
    <div className="flex flex-col relative justify-center items-center">
      <button
        onClick={() => setOpenDisconnect(!openDisconnect)}
        type="button"
        className={classes}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl"></div>
        <div className={classes2}>
          <span>
            {wallet && `${wallet?.slice(0, 6)}....${wallet?.slice(-4)}`}
          </span>
        </div>
      </button>

      {openDisconnect && (
        <button
          onClick={handleDisconnectButton}
          type="button"
          class="absolute top-14 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          Disconnect
        </button>
      )}
    </div>
  );
};

export default WalletButton;
