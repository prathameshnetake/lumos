import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Menu, LinkStyled, Item } from "./styles";
import { VscSearch, VscFiles } from "react-icons/vsc";
import { ThemeContext } from "../../App";

export const NavMenu = () => {
  const { pathname } = useLocation();
  const { theme } = useContext(ThemeContext);

  return (
    <Menu theme={theme}>
      <Item active={pathname === "/"}>
        <LinkStyled to="/">
          <VscSearch />
        </LinkStyled>
      </Item>
      <Item active={pathname === "/createEncodings"}>
        <LinkStyled to="/createEncodings">
          <VscFiles />
        </LinkStyled>
      </Item>
    </Menu>
  );
};
