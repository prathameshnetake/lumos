import React from "react";
import { Menu } from "./styles";
import { Link } from "react-router-dom";

export const NavMenu = (props: any) => {
  console.log(props);
  return (
    <Menu>
      <Link to="/createEncodings">link to create encodings</Link>
      <Link to="/">this is home</Link>
    </Menu>
  );
};
