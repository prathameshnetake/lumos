import { useContext } from "react";
import { ThemeContext } from "../App";
import styled from "styled-components";
import { Typography, Spin } from "antd";

const { Title, Paragraph, Text } = Typography;

const theme = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};

const text_color_dark = "hsl(0, 0%, 80%)";
const text_color_light = "hsl(0, 0%, 30%)";

export const LumosTitle = styled(Title)`
  color: ${() =>
    theme() === "dark" ? text_color_dark : text_color_light} !important;
`;

export const LumosText = styled(Text)`
  color: ${() =>
    theme() === "dark" ? text_color_dark : text_color_light} !important;
`;

export const LumosParagraph = styled(Paragraph)`
  color: ${() =>
    theme() === "dark" ? text_color_dark : text_color_light} !important;
`;

export const LumosSpin = styled(Spin)``;
