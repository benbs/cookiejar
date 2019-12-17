/**
 * Sample React Native App with Firebase
 * https://github.com/invertase/react-native-firebase
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'
import HomeScreen from './src/components/HomeScreen';
import SignInScreen from './src/components/auth/SignInScreen';
import AuthLoadingScreen from './src/components/auth/AuthLoadingScreen';

import firebase from '@react-native-firebase/app';
import SnackListScreen from './src/components/SnackList';

const AppStack = createStackNavigator({
  Home: HomeScreen,
  SnackList: {
    screen: SnackListScreen,
    navigationOptions: {  
      header: null
    }
  }
});
const AuthStack = createStackNavigator({
  SignIn: {
    screen: SignInScreen,
    navigationOptions: {  
      header: null
    }
  }
});

export default createAppContainer(
  createSwitchNavigator({
    AuthLoading: AuthLoadingScreen,
    App: AppStack,
    Auth: AuthStack
  }, {
    initialRouteName: 'AuthLoading'
  })
);