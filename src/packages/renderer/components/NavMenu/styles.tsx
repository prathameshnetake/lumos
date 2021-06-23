import styled from "styled-components";
import { Link } from "react-router-dom";

interface Props {
  theme: string;
}

export const Menu = styled.div`
  display: grid;
  grid-area: nav;
  grid-template-rows: repeat(3, 60px);
  background: ${(props: Props) =>
    props.theme === "dark" ? "hsl(0, 0%, 25%)" : "hsl(0, 0%, 80%);"};
`;

export const Item = styled.div<{ active: boolean }>`
  & a {
    color: ${(props) =>
      props.active ? "hsl(0, 0%, 100%)" : "hsl(0, 0%, 50%)"};
  }
  display: flex;
  box-sizing: border-box;
  border-left: ${(props) => (props.active ? "3px solid white" : null)};
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export const LinkStyled = styled(Link)`
  & svg {
    width: 25px;
    height: 25px;
  }
`;
