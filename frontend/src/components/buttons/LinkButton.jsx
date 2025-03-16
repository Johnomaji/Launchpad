import React from "react";
import { Link } from "react-router-dom";

const LinkButton = ({name, href, active}) => {

  const classes = `font-medium transition-all duration-900 hover:bg-gradient-to-r from-[#CBB2FF] to-[#5A189A] hover:bg-clip-text hover:text-transparent ${
    active && "text-[#8121E0]"
  }`
  return (
    <Link
      to={href}
      className={classes}
    >
      {name}
    </Link>
  );
};

export default LinkButton;
