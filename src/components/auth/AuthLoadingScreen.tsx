import React, { useEffect, useState } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function ({ navigation }) {
    const [initilizing, setInitilizing] = useState(true);
    const [user, setUser] = useState();
 
    // Handle user state changes
    function onAuthStateChanged(user) {
        setUser(user);
        if (initilizing) setInitilizing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);
    // useEffect(() => {
    //     navigation.navigate('SignIn')
    // });
    return <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
    </View>
}