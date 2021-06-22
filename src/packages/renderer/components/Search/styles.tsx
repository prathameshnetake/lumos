import styled from "styled-components";
import { blue } from "@ant-design/colors";
import { useContext } from "react";
import { ThemeContext } from "../../App";

const theme = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};

export const SearchContainer = styled.div`
  height: 100%;
  margin-top: 32px;
  display: grid;
  grid-template-rows: 250px 1fr;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "";
`;

export const QuerySelection = styled.div``;

export const QueryFaces = styled.div``;

export const ResultFaces = styled.div`
  display: grid;
  overflow-y: auto;
  grid-template-columns: repeat(auto-fill, 150px);
  grid-gap: 15px;
  grid-column: 1 / 3;
  overflow-x: hidden;
  margin-bottom: 16px;
  ::-webkit-scrollbar {
    width: 12px;
    margin-right: -10px;
  }

  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.6);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.8);
  }
`;

export const ResultImageContainer = styled.div`
  display: grid;
  height: 200px;
  grid-template-rows: 1fr 20px;
  padding: 8px;
  &:hover {
    background: var(--color-${() => theme}-foreground-muted);
  }
`;

export const ImagePreview = styled.div`
  height: 60px;
  display: grid;
  padding: 8px;
  width: 200px;
  margin: 8px;
  border: 1px solid hsl(0, 0%, 80%);
  background: hsl(0, 0%, 95%);
  justify-content: center;
  align-items: center;
  grid-template-columns: 48px 1fr 18px;
  .filename {
    font-size: 12px;
    justify-self: left;
    margin-left: 8px;
    color: ${() => blue.primary} !important;
  }
`;

export const ImageDiv = styled.div<{
  src: any;
  height?: number;
  width?: number;
}>`
  background-image: url("${(props) => props.src}");
  height: ${(props) => (props.height ? props.height + "px" : "100%")};
  width: ${(props) => (props.width ? props.width + "px" : "100%")};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

export const QueryFacesWrapper = styled.div`
  display: grid;
  justify-content: center;
  align-items: center;
  .icon {
    justify-self: center;
  }

  .radioGroup {
    margin: 8px 0 !important;
  }
`;
