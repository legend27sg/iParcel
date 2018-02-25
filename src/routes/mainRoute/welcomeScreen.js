import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions
  } from 'react-native';
import { Actions } from 'react-native-router-flux';
const { width, height } = Dimensions.get('window');

class welcomeScreen extends Component {
    render() {
        return(
            <View style={styles.Container} >
                <Text style={styles.logo}>iParcel</Text>
                <TouchableOpacity style={styles.button} onPress={() => {Actions.main()}}>
                    <Text style={styles.buttoncontent}>Get Started</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center'
    },
    logo: {
        fontSize: 42,
        fontWeight: 'bold'
    },
    button: {
        position: 'absolute', 
        bottom: 50, 
        backgroundColor: 'black', 
        height: 50, 
        width: 0.55 * width,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttoncontent: {
        color: 'white',
        fontSize: 18,
        fontWeight: '400'
    }
});

export default welcomeScreen;