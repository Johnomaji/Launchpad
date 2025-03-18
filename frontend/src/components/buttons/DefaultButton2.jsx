import React from "react";
import { Link } from "react-router-dom";

const DefaultButton2 = ({ name, icon, href, handleOnclick, className }) => {
  const classes = `flex flex-row justify-center items-center rounded-3xl cursor-pointer border border-[#fff]  hover:bg-[rgba(0,0,0,0.5)] ${
    className || "bg-transparent p-3 px-4 gap-2"
  } `;
  if (href) {
    return (
      <Link to={href}>
        <div className={classes}>
          {icon && icon}

          <span className="">{name}</span>
        </div>
      </Link>
    );
  }
  return (
    <button onClick={handleOnclick} className={classes}>
      {icon && icon}

      <span className="">{name}</span>
    </button>
  );
};

export default DefaultButton2;
