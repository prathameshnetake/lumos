import React, { useContext } from "react";
import {
  Container,
  Title,
  ControlsContainer,
  VscCloseStyled,
  VscChromeMinimizeStyled,
} from "./styles";
import icon from "../../assets/icon.png";
import { Switch } from "antd";
import { SwitchChangeEventHandler } from "antd/lib/switch";
import { ThemeContext } from "../../App";

export const Menu = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const onDarkModeToggle: SwitchChangeEventHandler = (e) => {
    if (e.valueOf()) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const close = () => {
    (window as any).electron.ipcRenderer.send("close");
  };

  const minimize = () => {
    (window as any).electron.ipcRenderer.send("minimize");
  };

  return (
    <div
      className="flex w-full h-10 items-center bg-gray-200 dark:bg-gray-800"
      style={{ WebkitAppRegion: "drag" } as any}
    >
      <img src={icon} className="mx-3 h-6 w-6" />
      <span className="font-bold text-gray-800 flex-1 dark:text-gray-100">
        Lumos
      </span>
      <div
        className="flex place-self-end h-full justify-center"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        <div
          className="hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200 w-10 p-2"
          onClick={minimize}
        >
          <VscChromeMinimizeStyled />
        </div>
        <div
          className="hover:bg-red-600 cursor-pointer text-gray-700 dark:text-gray-200 w-10 p-2"
          onClick={close}
        >
          <VscCloseStyled />
        </div>
      </div>
    </div>
  );
};
