import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
    const { navigate } = navigation;

    return (<View>
        <Button onPress={() => navigate('Dashboard')} title="Press here"></Button>
    </View>
    );
}