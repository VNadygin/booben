/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import '@reactackle/reactackle/reactackle.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, Redirect } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import RootRoute from './routes/RootRoute';
import PlaygroundRoute from './routes/PlaygroundRoute';
import store from './store';
import history from './history';
import { loadStrings } from './actions/app';
import { PATH_ROOT, buildStructurePath } from './constants/paths';

store.dispatch(loadStrings('en'));

window.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route
              exact
              path="/playground"
              component={PlaygroundRoute}
            />

            <Route
              exact
              path={PATH_ROOT}
              render={({ match }) => (
                <Redirect to={buildStructurePath(match.params)} />
              )}
            />

            <Route path={PATH_ROOT} component={RootRoute} />
          </Switch>
        </ConnectedRouter>
      </Provider>
    </ThemeProvider>,

    window.document.getElementById('container'),
  );
});
