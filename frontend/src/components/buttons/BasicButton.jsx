import React from "react";
import { Link } from "react-router-dom";

const BasicButton = ({
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
          <div className="absolute inset-0 rounded-3xl"></div>

          <div className="relative flex flex-row gap-2 justify-center items-center p-3 px-6 bg-black rounded-3xl font-normal text-md transition-all duration-900 text-white">
            {icon && icon}

            <span className="flex-1 ms-3 whitespace-nowrap">{name}</span>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <button onClick={handleOnclick} className={classes}>
      <div className="absolute inset-0 rounded-3xl"></div>

      <div className="relative flex flex-row gap-2 justify-center items-center p-3 px-6 bg-black rounded-3xl font-normal text-md transition-all duration-900 text-white">
        {icon && icon}

        <span className="flex-1 ms-3 whitespace-nowrap">{name}</span>
      </div>
    </button>
  );
};

export default BasicButton;