import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, FlatList } from 'react-native';
import SnackPage from './src/components/SnackPage';
import SnackList from './src/components/SnackList';
import BasicFlatList from './src/components/common/BasicFlatList'

export default function App() {
 return(
<SnackList />
 );
}

