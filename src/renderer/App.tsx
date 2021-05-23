import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { CreateEncodings } from './components/CreateEncodings/CreateEncodings';
import { Provider } from 'react-redux';
import { store } from './store';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/" component={CreateEncodings} />
        </Switch>
      </Router>
    </Provider>
  );
}
