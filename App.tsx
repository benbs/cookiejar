import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'
import HomeScreen from './src/components/HomeScreen';
import SignInScreen from './src/components/auth/SignInScreen';
import AuthLoadingScreen from './src/components/auth/AuthLoadingScreen';

const AppStack = createStackNavigator({ Home: HomeScreen });
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