import { createGlobalStyle, css } from "styled-components";

interface Props {
  theme: string;
}

export const GlobalStyles = createGlobalStyle(
  (props: Props) => css`
    :root {
      --color-dark: hsl(0, 0%, 20%);
      --color-light: hsl(0, 0%, 95%);
      --color-light-text: hsl(0, 0%, 30%);
      --color-dark-text: hsl(0, 0%, 80%);
    }

    #root {
      height: 100%;
    }

    .parent-grid {
      display: grid;
      height: 100%;
      grid-template-columns: 60px 1fr;
      grid-template-rows: 40px 1fr;
      grid-template-areas:
        "menu menu"
        "nav main";
    }

    .app-main {
      grid-area: main;
      padding: 32px;
    }

    body {
      background-color: ${props.theme === "light"
        ? "var(--color-light)"
        : "var(--color-dark)"};
      color: ${props.theme === "light"
        ? "var(--color-light-text)"
        : "var(--color-dark-text)"};
      margin: 0;
      padding: 0;
      border-radius: 10px;
    }
  `
);
