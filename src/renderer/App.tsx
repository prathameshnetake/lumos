import React, { createContext } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { CreateEncodings } from "./components/CreateEncodings/CreateEncodings";
import { Home } from "./pages/index";
import { Provider } from "react-redux";
import { store } from "./store";
import { GlobalStyles } from "./css/globalStyles";
import { useLocalStorage } from "./customHooks/useLocalStorage";

interface ContextProps {
  theme: string;
  setTheme: Function;
}

export const ThemeContext = createContext<ContextProps>({
  theme: "",
  setTheme: () => null,
});

export default function App() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <Provider store={store}>
      <Router>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <GlobalStyles theme={theme} />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/createEncodings" component={CreateEncodings} />
          </Switch>
        </ThemeContext.Provider>
      </Router>
    </Provider>
  );
}
