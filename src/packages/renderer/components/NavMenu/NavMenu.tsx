import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Menu, LinkStyled, Item } from "./styles";
import { VscSearch, VscFiles, VscGear } from "react-icons/vsc";
import { ThemeContext } from "../../App";
import { Link } from "react-router-dom";
import classnames from "classnames";

export const NavMenu = () => {
  const { pathname } = useLocation();
  const { theme } = useContext(ThemeContext);
  const navLinks = [
    {
      name: "Search",
      icon: <VscSearch />,
      path: "/",
    },
    {
      name: "Analyze",
      icon: <VscFiles />,
      path: "/createEncodings",
    },
  ];

  return (
    <nav className="w-14 dark:bg-gray-800 flex flex-col items-center bg-gray-200">
      {navLinks.map((link) => {
        return (
          <div
            key={link.name}
            className={classnames([
              "text-gray-400 dark:text-gray-200 h-16 text-2xl w-full flex items-center justify-center box-content",
              {
                "border-l-4 border-gray-700 dark:border-gray-200 text-gray-600":
                  pathname === link.path,
              },
            ])}
          >
            <Link to={link.path}>{link.icon}</Link>
          </div>
        );
      })}
    </nav>
  );
};
