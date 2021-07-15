import React, { createContext } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { CreateEncodings } from "./components/CreateEncodings/CreateEncodings";
import { Home } from "./pages/index";
import { Settings } from "./pages/settings";
import { Provider } from "react-redux";
import { store } from "./store";
import { GlobalStyles } from "./css/globalStyles";
import { useLocalStorage } from "./customHooks/useLocalStorage";
import { Menu } from "./components/Menu/Menu";
import { NavMenu } from "./components/NavMenu/NavMenu";

interface ContextProps {
  theme: string;
  setTheme: (theme: string) => null;
}

export const ThemeContext = createContext<ContextProps>({
  theme: "",
  setTheme: (theme: string) => null,
});

export default function App() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <Provider store={store}>
      <Router>
        <ThemeContext.Provider value={{ theme, setTheme } as any}>
          <div className="w-full h-screen flex flex-col overflow-hidden">
            <Menu />
            <div className="flex flex-1 h-full">
              <NavMenu />
              <Switch>
                <Route path="/createEncodings" component={CreateEncodings} />
                <Route path="/settings" component={Settings} />
                <Route path="/" component={Home} />
              </Switch>
            </div>
          </div>
        </ThemeContext.Provider>
      </Router>
    </Provider>
  );
}
