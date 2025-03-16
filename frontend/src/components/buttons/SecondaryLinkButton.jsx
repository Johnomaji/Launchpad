import React from "react";
import { Link } from "react-router-dom";

const SecondaryLinkButton = ({
  name,
  icon,
  href,
  handleOnclick,
  className,
  active,
}) => {
  const classes = `relative rounded-3xl inline-block bg-black cursor-pointer ${
    className || ""
  } `;
  const classes2 = `absolute inset-0 hover:bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl`;
  const classes3 = `relative flex flex-row gap-2 justify-center items-center p-3 px-6 hover:bg-[#9f7aeb] rounded-3xl font-normal text-md transition-all duration-900 text-white ${
    active ? "bg-[#9f7aeb]" : "bg-black"
  }`;
  
  if (href) {
    return (
      <Link to={href}>
        <div className={classes}>
          <div className={classes2}></div>

          <div className={classes3}>
            {icon && icon}

            <span className="flex-1 ms-3 whitespace-nowrap">{name}</span>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <button onClick={handleOnclick} className={classes}>
      <div className={classes2}></div>

      <div className={classes3}>
        {icon && icon}

        <span className="flex-1 ms-3 whitespace-nowrap">{name}</span>
      </div>
    </button>
  );
};

export default SecondaryLinkButton;
