import React, { useContext } from "react";
import {
  Container,
  Title,
  ControlsContainer,
  VscCloseStyled,
  VscChromeMinimizeStyled,
} from "./styles";
import icon from "../../../assets/icon.png";
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

  return (
    <Container theme={theme}>
      <img src={icon} style={{ height: 25 }} />
      <Title>Lumos Title</Title>
      <ControlsContainer>
        <Switch onChange={onDarkModeToggle} checked={theme === "dark"} />
        <VscChromeMinimizeStyled />
        <VscCloseStyled />
      </ControlsContainer>
    </Container>
  );
};
