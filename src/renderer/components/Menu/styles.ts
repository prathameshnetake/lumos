import styled from "styled-components";
import { VscClose, VscChromeMinimize } from "react-icons/vsc";

interface Props {
  theme: string;
}

export const Container = styled.div`
  position: relative;
  margin: 0;
  width: 100%;
  display: grid;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  grid-template-columns: 30px 1fr 110px;
  user-select: none;
  background: ${(props: Props) =>
    props.theme === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 80%);"};
`;

export const Title = styled.span`
  padding-left: 10px;
  -webkit-app-region: drag;
`;

export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const VscCloseStyled = styled(VscClose)`
  height: 20px;
  width: 20px;
  cursor: pointer;
  &::hover {
    background-color: red;
  }
`;

export const VscChromeMinimizeStyled = styled(VscChromeMinimize)`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;
