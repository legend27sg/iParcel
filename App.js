import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import allReducers from './src/reducers/index.js';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';
import { Provider, connect } from 'react-redux';

import RouterComponent from './src/routes/router';
console.disableYellowBox = true;
const middleware = applyMiddleware( promise(), thunk );
const store = createStore( allReducers, middleware );


export default class App extends React.Component {


  render() {
        return (
          <Provider store= {store}>
              <RouterComponent />
          </Provider>
        );
  }

}
