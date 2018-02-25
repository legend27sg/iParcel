import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    ActivityIndicator
} from 'react-native';
const { width, height } = Dimensions.get('window');

export default class LoadingComponent extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <View style = {styles.container}>
                <ActivityIndicator
                    style = {styles.activityIndicator}
                    color = 'black'
                    size = 'large'
                />
            </View>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
        position: 'absolute'
        
    },
    activityIndicator: {
        flex: 1,
        position: 'absolute'
    },
});
