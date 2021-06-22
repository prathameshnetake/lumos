import styled from "styled-components";

export const Container = styled.div`
  align-self: center;
  justify-self: center;
`;

export const ControlBox = styled.div`
  margin-top: 32px;
`;

export const SelectionControl = styled.div`
  display: grid;
  margin-top: 32px;
  grid-column-gap: 30px;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  justify-content: center;
  grid-template-areas: "icon start" "select start" "text start";
  & * {
    justify-self: center;
  }
`;

export const Progress = styled.div`
  margin-top: 32px;
  display: grid;
  justify-content: center;
`;

export const Finish = styled.div`
  margin-top: 32px;
  display: grid;
  justify-content: center;
`;
