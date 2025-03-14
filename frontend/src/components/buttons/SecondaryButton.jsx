import React from "react";
import { Link } from "react-router-dom";

const SecondaryButton = ({
  name,
  href,
  icon,
  handleOnClick,
  className,
}) => {
  const oc = `relative p-[2px] inline-block bg-black cursor-pointer rounded-3xl`;
  const sc = `absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#000] hover:bg-transparent rounded-3xl`
  const ic = `relative flex flex-row justify-center items-center bg-[radial-gradient(circle_at_30%_50%,_#9033F4,_#5A189A)] hover:outline-3 hover:outline-white hover:bg-[#5A189A] font-medium transition-all duration-900 text-white ${
    className || "text-2xl p-3 px-6 gap-2"
  } rounded-3xl`;

  if (href) {
    return (
      <Link to={href}>
        <div className={oc}>
          <div className={sc}></div>

          <div className={ic}>
            {icon && icon}
            <span className="flex-1 ms-3 whitespace-nowrap">
              {name && name}
            </span>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <button onClick={handleOnClick} className={oc}>
      <div className={sc}></div>

      <div className={ic}>
        {icon && icon}
        <span className="flex-1 ms-3 whitespace-nowrap">{name && name}</span>
      </div>
    </button>
  );
};

export default SecondaryButton;
