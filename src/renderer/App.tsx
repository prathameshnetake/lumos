import React, { createContext } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { CreateEncodings } from "./components/CreateEncodings/CreateEncodings";
import { Home } from "./pages/index";
import { Provider } from "react-redux";
import { store } from "./store";
import { GlobalStyles } from "./css/globalStyles";
import { useLocalStorage } from "./customHooks/useLocalStorage";
import { Menu } from "./components/Menu/Menu";
import { NavMenu } from "./components/NavMenu/NavMenu";

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
    <Router>
      <Provider store={store}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <GlobalStyles theme={theme} />
          <div className="parent-grid">
            <Menu />
            <NavMenu />
            <div className="app-main">
              <Switch>
                <Route path="/createEncodings" component={CreateEncodings} />
                <Route path="/" component={Home} />
              </Switch>
            </div>
          </div>
        </ThemeContext.Provider>
      </Provider>
    </Router>
  );
}
