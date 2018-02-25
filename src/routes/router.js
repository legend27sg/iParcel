var MessageBarAlert = require('react-native-message-bar').MessageBar;
var MessageBarManager = require('react-native-message-bar').MessageBarManager;

import React from 'react';
import { 
    Scene, 
    Router, 
    Actions, 
    Reducer, 
    Drawer 
} from 'react-native-router-flux';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    Dimensions,
    TouchableOpacity,
    Modal,
    AsyncStorage,
    ScrollView,
    Platform,
    Alert,
    ImageBackground
  } from 'react-native';
import reducerCreate from '../reducers/router_reducer';
import welcomeScreen from './mainRoute/welcomeScreen';
import taskScreen from './mainRoute/taskScreen';
import mapScreen from '../components/mapScreen';

class RouterComponent extends React.Component {

    componentDidMount = () => {
        MessageBarManager.registerMessageBar(this.refs.alert);
    }

    componentWillUnmount = () => {
        MessageBarManager.unregisterMessageBar();
    }
    
    showAlert = (alert) => {
        MessageBarManager.showAlert(alert);
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'red' }}>
                <Router {...this.props} createReducer={reducerCreate}>
                    <Scene 
                        key='root' 
                        {...this.props} 
                        hideNavBar
                        headerMode="float"
                        showAlert={this.showAlert}
                        >

                        <Scene key='welcome'>
                            <Scene 
                                key='welcomeScreen' 
                                component={welcomeScreen} 
                                hideNavBar
                            />
                        </Scene>
                        

                        <Scene key='main'>
                            <Scene 
                                key='taskScreen' 
                                component={taskScreen} 
                                back={false}
                                panHandlers={null}
                                title="iParcel" 
                                navigationBarStyle={{ backgroundColor: 'black' }}
                                titleStyle={{ color: 'white', fontSize: 22, fontWeight: '700' }}
                                />
                            <Scene 
                                key='mapScreen'
                                component={mapScreen}
                                navigationBarStyle={{ backgroundColor: 'black' }}
                                titleStyle={{ color: 'white', fontSize: 16, fontWeight: '400' }}
                                backButtonTintColor='white'
                                backTitle='Back'
                                backButtonTextStyle={{ color: 'white' }}
                                />    
                        </Scene>

                    </Scene>
                </Router>
                <MessageBarAlert
                    ref="alert"
                    titleStyle={{
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}
                    messageStyle={{
                        fontSize: 14
                    }}
                    // shouldHideAfterDelay={false}
                    viewTopInset={Platform.OS === "android" ? 0:18}
                    // avatarStyle={{ height: 40, width: 40, borderRadius: 20, alignSelf: 'center' }}
                    stylesheetSuccess={{
                        backgroundColor: 'white',
                        strokeColor: 'black',
                        titleColor: 'black',
                        messageColor: 'black',
                    }}
                    // onTapped={() => this.handleTap()}
                />
            </View>
        );
    }

}

export default RouterComponent;

