import React from "react";
import { Link } from "react-router-dom";

const PrimaryButtonInvert = ({
  name,
  href,
  icon,
  handleOnClick,
  className,
  className2,
  loaded,
  loading,
}) => {
  const classes = `relative p-[1px] rounded-3xl inline-block bg-black cursor-pointer ${
    className || ""
  } `;

  const classes2 = `relative flex flex-row gap-2 justify-center items-center p-3 px-6 bg-[radial-gradient(circle_at_30%_50%,_#9033F4,_#5A189A)] hover:outline-3 hover:outline-white hover:bg-[#5A189A] rounded-3xl font-medium text-md transition-all duration-900 text-[#fff] ${
    className2 || "bg-black"
  }`;
  if (href) {
    return (
      <Link to={href} className={classes}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#000] hover:bg-transparent rounded-3xl"></div>

        <div className={classes2}>
          {icon && icon}
          <span>{name}</span>
        </div>
      </Link>
    );
  }
  return (
    <>
      {loading ? (
        <div onClick={handleOnClick} className={classes}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#000] hover:bg-transparent rounded-3xl"></div>

          <div className={classes2}>
            {/* {icon && icon} */}
            <span>Loading...</span>
          </div>
        </div>
      ) : (
        <div onClick={handleOnClick} className={classes}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#000] hover:bg-transparent rounded-3xl"></div>

          <div className={classes2}>
            {icon && icon}
            <span>{name}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PrimaryButtonInvert;
