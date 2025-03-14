import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <>
      {/* Fixed-width container */}
      <div className="relative my-0 mx-auto w-full sm:w-[1600px]">
        {/* Navbar and Sidebar */}
        <Navbar />
        <div className="flex flex-row w-full h-full">
          <Sidebar />

          {/* Page Content */}
          <div className="w-[100%] md:w-[90%] ml-[0%] md:ml-[10%]">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Layout;
