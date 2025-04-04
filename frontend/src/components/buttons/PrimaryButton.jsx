import React from "react";
import { Link } from "react-router-dom";

const PrimaryButton = ({
  name,
  href,
  icon,
  handleOnClick,
  className,
  className2,
  loaded,
  loading,
}) => {
  const classes = `relative p-[1px] rounded-3xl inline-block bg-black cursor-pointer ${className || ""
    } `;

  const classes2 = `relative flex flex-row gap-2 justify-center items-center p-3 px-6 hover:bg-white rounded-3xl font-medium text-md transition-all duration-900 text-[#B386FF] hover:text-[#5A189A] ${className2 || "bg-black"
    }`;
  if (href) {
    return (
      <Link to={href} className={classes}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl"></div>

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
          <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl"></div>

          <div className={classes2}>
            {/* {icon && icon} */}
            <span>Loading...</span>
          </div>
        </div>
      ) : (
        <div onClick={handleOnClick} className={classes}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] rounded-3xl"></div>

          <div className={classes2}>
            {icon && icon}
            <span>{name}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PrimaryButton;
