import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import CreateCoin from "./CreateCoin";

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);

  const [openCreateCoin, setOpenCreateCoin] = useState(false);

  const toggleOpenCreateCoin = () => {
    setOpenCreateCoin(!openCreateCoin);
  };

  return (
    <>
      {/* Fixed-width container */}
      <div className="relative my-0 mx-auto w-full sm:w-[1600px]">
        {/* Navbar and Sidebar */}
        <Navbar />
        <div className="flex flex-row w-full">
          {openCreateCoin && (
            <CreateCoin
              openCreateCoin={openCreateCoin}
              toggleOpenCreateCoin={toggleOpenCreateCoin}
            />
          )}
          <Sidebar setOpen={setOpen} open={open} toggleOpenCreateCoin={toggleOpenCreateCoin} />

          {/* Page Content */}
          <div
            className={`w-[100%]  ${
              open ? "md:max-w-[85%]" : "md:max-w-[91.5%]"
            } min-h-screen mt-[13%] md:mt-[6.8%]`}
          >
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
