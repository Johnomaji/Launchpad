import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex ms-2 md:me-24">
      <span className="self-center sm:text-sm md:text-3xl font-bold whitespace-nowrap dark:text-white">
        Memetic
      </span>
      <span className="self-center sm:text-sm font-medium md:text-3xl text-[#8121E0] whitespace-nowrap dark:text-[#8121E0]">
        LaunchPad
      </span>
    </Link>
  );
};

export default Logo;
