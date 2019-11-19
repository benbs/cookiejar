import React, {Component} from 'react';

import { StyleSheet, FlatList, Text, View, Alert } from 'react-native';
import  BasicFlatList  from './common/BasicFlatList'
import SnackPage from './SnackPage';
//import all the components we are going to use.

var flatListData = [
    {
        "key": "598a678278fee204ee51cd2c",
        "name": "Cream Tea",   
        "image": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Cornish_cream_tea_2.jpg",                    
        "calories": 123
    },
    {
        "key": "598a684f78fee204ee51cd2f",
        "name": "Fresh mushroom",        
        "image": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Lactarius_indigo_48568.jpg",    
        "calories": 321
    },
    {
        "key": "598a687678fee204ee51cd30",
        "name": "Japanese Oyster",
        "image": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Oysters_served_on_ice%2C_with_lemon_and_parsley.jpg",
        "calories": 222
    },
    {
        "key": "598a680178fee204ee51cd2e",
        "name": "Korean Kimchi",        
        "image": "https://upload.wikimedia.org/wikipedia/commons/7/74/Yeolmukimchi_3.jpg",
        "calories": 333
    },
    {
        "key": "598a688878fee204ee51cd31",
        "name": "Multiple salad",     
        "image": "https://upload.wikimedia.org/wikipedia/commons/9/94/Salad_platter.jpg",   
        "calories": 444
    },
    {
        "key": "598a68b778fee204ee51cd32",
        "name": "Vegetable",   
        "image": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Vegetable_Cart_in_Guntur.jpg",     
        "calories": 555
    },
    {
        "key": "598a67c478fee204ee51cd2d",
        "name": "traditional japanese salad",  
        "image": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Simple_somen.jpg",      
        "calories": 666
    }
];
type MyProps = {item:any};/*props*/
type MyState = {currentItem: any, toShow:boolean};/*state props*/
export default class SnackList extends Component<MyProps,MyState> {
    state={toShow:false,currentItem:null};
    handlePress=(item)=>{
        //alert('cals:'+item.calories);
        this.setState({ toShow:true, currentItem:item});
    }
    cancelPress=()=>{
        //alert('cancel');
        this.setState({ toShow:false});

    }
  render() {
      if(this.state.toShow){
          return(        
            <SnackPage name={this.state.currentItem.name} barCode={this.state.currentItem.key}
             image={this.state.currentItem.image} calories={this.state.currentItem.calories} 
             cancelPress={this.cancelPress} />
            )
      }
    return (
      <BasicFlatList flatListData={flatListData} onPress={this.handlePress} />
    );
  }
}



