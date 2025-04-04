import React, { useEffect, useRef, useState } from "react";
import { IoWalletOutline } from "react-icons/io5";
import { AiOutlineDisconnect } from "react-icons/ai";
import { Link } from "react-router-dom";

const WalletButton = ({ wallet, icon, handleDisconnect }) => {
  const [openDisconnect, setOpenDisconnect] = useState(false);
  const divRef = useRef(null);

  // Toggle disconnect dropdown
  const handleDisconnectButton = () => {
    setOpenDisconnect(false); // Close the dropdown
    handleDisconnect(); // Call the disconnect handler
  };

  // Handle clicks outside the component
  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setOpenDisconnect(false); // Close the dropdown
    }
  };

  // Attach and clean up the event listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // CSS classes
  const classes = `relative p-[1px] rounded-3xl inline-block bg-black cursor-pointer`;
  const classes2 = `relative flex flex-row gap-2 justify-center items-center p-3 px-6 hover:bg-white rounded-3xl font-medium text-md transition-all duration-900 text-[#B386FF] hover:text-[#5A189A] bg-black`;

  return (
    <div ref={divRef} className="flex flex-col relative justify-center items-center">
      {/* Wallet Button */}
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

      {/* Disconnect Dropdown */}
      {openDisconnect && (
        <div className="w-[300px] absolute top-18 right-2 p-5 flex flex-col justify-center items-center gap-2 rounded-2xl bg-[rgba(0,0,0,0.5)]">
          {/* Portfolio Button */}
          <Link
            to="/portfolio" // Use `to` instead of `href` for React Router
            type="button"
            className="w-full relative p-[1px] rounded-3xl inline-block bg-black cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl"></div>
            <div className="relative flex flex-row gap-2 justify-center items-center p-3 px-6 hover:bg-white rounded-3xl font-medium text-md transition-all duration-900 text-[#fff] hover:text-[#5A189A] bg-zinc-900">
              <IoWalletOutline className="font-bold text-2xl" />
              Portfolio
            </div>
          </Link>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnectButton}
            type="button"
            className="w-full relative p-[1px] rounded-3xl inline-block bg-black cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl"></div>
            <div className="relative flex flex-row gap-2 justify-center items-center p-3 px-6 hover:bg-white rounded-3xl font-medium text-md transition-all duration-900 text-[#db2828] hover:text-[#5A189A] bg-zinc-900">
              <AiOutlineDisconnect className="font-bold text-2xl" />
              Disconnect
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletButton;