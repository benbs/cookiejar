import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'
import { StyleSheet, Text, View } from 'react-native';

const MainNavigator = createStackNavigator({
  Home: { screen: HomeScreen }
});

export const App = createAppContainer(MainNavigator);
export default App;
