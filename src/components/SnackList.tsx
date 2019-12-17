import React, {Component, useState, useEffect} from 'react';

import { StyleSheet, View, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import  BasicFlatList  from './common/BasicFlatList'
import SnackPage from './SnackPage';
import firestore from '@react-native-firebase/firestore';
import { NavigationScreenProp, NavigationState, NavigationParams } from 'react-navigation';

import Text from './common/Text';
import auth from '@react-native-firebase/auth';

type MyProps = {item:any};/*props*/
type MyState = {currentItem: any, toShow:boolean, snacks:any[]};/*state props*/
export class SnackListt extends Component<MyProps,MyState> {
    state={toShow:false,currentItem:null, snacks:[]};
    handlePress=(item)=>{
        //alert('cals:'+item.calories);
        this.setState({ toShow:true, currentItem:item});
    }
    cancelPress=()=>{
        //alert('cancel');
        this.setState({ toShow:false});

    }

    async componentDidMount() {
        const querySnapshot = await firestore().collection('snacks').get();
        const snacks = querySnapshot.docs.map(documentSnapshot => ({
            ...documentSnapshot.data(),
            key: documentSnapshot.id, // required for FlatList
        }));
        this.setState({ snacks });
    }
    render() {
        if(this.state.toShow){
            return(        
                <SnackPage name={this.state.currentItem.name} barCode={this.state.currentItem.key}
                image={this.state.currentItem.image} calories={this.state.currentItem.calories} 
                cancelPress={this.cancelPress} />
                )
        }
        return <BasicFlatList flatListData={this.state.snacks} onPress={this.handlePress} />;
    }
}

const styles = StyleSheet.create({
    topSection: {
        flex: 1,
    },
    titleBar: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    welcomeHeader: {
        fontSize: 26,
        textAlign: 'center',
        flex: 1
    },
    settingsIcon: {
        width: 30,
        height: 30,
        marginLeft: 10,
    },
    dial: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    snackSection: {
        flex: 2,
        backgroundColor: '#ddd',
        paddingVertical: 7
    },
    snackItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    snackImage: {
        height: 105,
        width: 105,
        backgroundColor: '#aaa',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#bbb',
        overflow: 'hidden'
    },
    snackDescription: {
        flex: 1,
        height: 105,
        marginStart: 10
    }

});


interface ISnackListProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const snacksMock = [
    {
        name: 'Snickers',
        image: 'https://marketingweek.imgix.net/content/uploads/2019/07/15161949/snickers.jpg',
        description: '1000 calories',
    },
    {
        name: 'Reeses',
        image: 'https://cdn.cnn.com/cnnnext/dam/assets/191010155858-reeses-cups-halloween-exlarge-169.jpg',
        description: '500 calories'
    },
    {
        name: 'Kinder Bueno',
        image: 'https://previews.123rf.com/images/radub85/radub851603/radub85160300280/53947625-bucharest-romania-december-04-2015-kinder-chocolate-is-a-confectionery-product-brand-line-of-italian.jpg',
        description: '1000 calories'
    }
]

function handlePress() {
    ToastAndroid.show('aaa', ToastAndroid.BOTTOM);
}

export default function SnackList() {

    const [currentUser, setCurrentUser] = useState();
    const [] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // auth().signOut();
        const _unsubscribe = firestore().collection('users').doc('benbs93@gmail.com').onSnapshot(doc => {
            const user =  doc.data();

            setCurrentUser(user);
            if (loading) {
                setLoading(false);
            }
        });


        return () => _unsubscribe();
    });

    if (loading) {
        return <Text>loading...</Text>;
    }

    return <>
        <View style={styles.topSection}>
            <View style={styles.titleBar}>
                <TouchableOpacity onPress={handlePress}>
                    <Image 
                        style={styles.settingsIcon}
                        source={require('../../assets/images/settings.png')}
                    ></Image>
                </TouchableOpacity>
                <Text style={styles.welcomeHeader}>Welcome, {currentUser.name}</Text>
            </View>
            <View style={styles.dial}>
                <Image
                    style={{resizeMode: 'center'}}
                    source={require('../../assets/images/dial.png')}>
                </Image>
            </View>
        </View>
        <View style={styles.snackSection}>
            {snacksMock.map((snack, idx) => (
                <View style={styles.snackItem} key={idx}>
                    <View style={styles.snackImage}>
                    <Image
                        style={{width: 105, height: 105}}
                        source={{uri: snack.image}}
                    />
                    </View>
                    <View style={styles.snackDescription}>
                        <Text style={{ fontSize: 20 }}>{snack.name}</Text>
                        <Text style={{ fontSize: 12 }}>{snack.description}</Text>
                    </View>
                </View>
            ))}
        </View>

    </>;
}