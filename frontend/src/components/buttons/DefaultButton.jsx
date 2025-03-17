import React from "react";
import { Link } from "react-router-dom";

const DefaultButton = ({
  name,
  icon,
  href,
  handleOnclick,
  className,
}) => {
  const classes = `relative rounded-3xl inline-block bg-black cursor-pointer ${
    className || ""
  } `;
  if (href) {
    return (
      <Link to={href}>
        <div className={classes}>
          <div className="relative flex flex-row gap-2 justify-center items-center p-3 px-6 bg-white rounded-3xl font-normal text-md transition-all duration-900 text-[#5A189A]">
            {icon && icon}

            <span className="flex-1 ms-3 whitespace-nowrap">{name}</span>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <button onClick={handleOnclick} className={classes}>
      <div className="relative flex flex-row gap-2 justify-center items-center p-3 px-6 bg-white hover:bg-[#8121E0] border border-white hover:border-[#E1D4FF] rounded-3xl font-normal text-md transition-all duration-900 text-[#5A189A] hover:text-white">
        {icon && icon}

        <span className="flex-1 ms-3 whitespace-nowrap">{name}</span>
      </div>
    </button>
  );
};

export default DefaultButton;