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

export const LumosDragger = styled.div`
  max-width: 400px;
  padding: 0 8px;
  border: 1px dotted
    ${() => (theme() === "dark" ? "hsl(0, 0%, 40%)" : "hsl(0, 0%, 88%)")} !important;
  background: ${() =>
    theme() === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 93%)"} !important;
  display: grid;
  justify-content: center;
  padding-bottom: 16px;
  .ant-upload-drag-icon {
    cursor: pointer;
    font-size: 40px;
    margin: 0;
    color: #1890ff !important;
  }

  .selected-file-preview {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  p {
    justify-self: center;
    text-align: center;
    margin: 0;
    color: ${() =>
      theme() === "dark" ? text_color_dark : text_color_light} !important;
  }
`;
