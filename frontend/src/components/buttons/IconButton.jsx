import React from "react";
import { Link } from "react-router-dom";

const IconButton = ({ href, handleOnClick, icon }) => {
  if (href) {
    return (
      <Link to={href}>
        <div className="relative p-[2px] rounded-full inline-block bg-black cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-full"></div>

          <div className="relative p-3 bg-black hover:bg-white rounded-full text-2xl text-[#E1D4FF] hover:text-[#5A189A] transition-all duration-900">
            {icon && icon}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <button onClick={handleOnClick} className="relative p-[2px] rounded-full inline-block bg-black cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-full"></div>

      <div className="relative p-3 bg-black hover:bg-white rounded-full text-2xl text-[#E1D4FF] hover:text-[#5A189A] transition-all duration-900">
        {icon && icon}
      </div>
    </button>
  );
};

export default IconButton;
