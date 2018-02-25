import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    FlatList,
    InteractionManager,
    AsyncStorage,
    Alert
  } from 'react-native';
import { Actions } from 'react-native-router-flux';
import TaskItem from '../../components/taskItem';
import Placeholder from 'rn-placeholder';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon } from 'react-native-elements';
import randomLocation from 'random-location';
import * as actions from '../../actions';


const { width, height } = Dimensions.get('window');

// status code
// 0 - pending
// 1 - accepted
const mockData = [
    {
        id: '#100000001',
        start: {
            lat: 1.3039899,
            lng: 103.8748268
        },
        end: {
            lat: 1.280270,
            lng: 103.85195
        },
        status: 0
    },
    {
        id: '#100000002',
        start: {
            lat: 1.290270,
            lng: 103.85195
        },
        end: {
            lat: 1.280270,
            lng: 103.85195
        },
        status: 0
    },
    {
        id: '#100000003',
        start: {
            lat: 1.290270,
            lng: 103.85195
        },
        end: {
            lat: 1.280270,
            lng: 103.85195
        },
        status: 0
    },
];

class taskScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
          refreshing: false,
          showMsg: false,
          list: [],
        }
    }

    componentWillMount = () => {
        Actions.refresh({right: this.renderRightButton});
        this.getFirstLoad();
        AsyncStorage.clear();
    }

    componentDidMount = () => {
        InteractionManager.runAfterInteractions(() => {
            // 2: Component is done animating
            this.getCurrentLoc();
          });
    }

    getFirstLoad = async () => {
        try {
            const FirstLoad = await AsyncStorage.getItem('FirstLoad');
    
            if (FirstLoad === null) {
                this.setState({ showMsg: true });
                this.SaveFirstLoad();
            }
    
        } catch (error) {
    
        }
    }

    SaveFirstLoad = async () => {
        try {
            await AsyncStorage.setItem('FirstLoad', 'No');
        } catch (error) {
    
        }
    }

    showMessage = () => {
        if (this.state.showMsg === true) {
            Alert.alert(
                'Simulation',
                'Adding new task based on your current location (4km range).',
                [
                {text: 'Cancel', onPress: () => null, style: 'cancel'},
                {text: 'OK', onPress: () => this.handleAdd()},
                ],
            );
            
        } else {
            this.handleAdd();
        }
        this.setState({ showMsg: false });
    }

    handleAdd = () => {
        const currentLocationOrigin =  {
            latitude: this.props.user.myLocation.latitude,
            longitude: this.props.user.myLocation.longitude
        }

        const currentLocationDest = {
            latitude: this.props.user.myLocation.latitude,
            longitude: this.props.user.myLocation.longitude
        }

        // 4km range
        const Radius = 4000;

        const randomPointOrigin = randomLocation.randomCirclePoint(currentLocationOrigin, Radius);
        const randomPointDest = randomLocation.randomCirclePoint(currentLocationDest, Radius);


        const newTask = {
            id: (Math.floor(Math.random() * 1000000) + 1).toString(),
            start: {
                lat: randomPointOrigin.latitude,
                lng: randomPointOrigin.longitude
            },
            end: {
                lat: randomPointDest.latitude,
                lng: randomPointDest.longitude
            },
            status: 0
        }

        this.setState({ list: [ ...this.state.list, newTask ] });
        // console.log(this.state.list);
    }

    renderRightButton = () => {
        return (
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity onPress={(e) => {this.showMessage();}} style={{ padding: 10 }}>
                    <Icon type="entypo" name="add-to-list" color='white' />
                </TouchableOpacity>
            </View>
        );
    }

    renderSeparator = () => {
        return (
          <View
            style={{
              height: 10,
              width: '100%',
              // marginLeft: '14%'
            }}
          />
        );
    }

    renderEmpty = () => {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 0.7 * height
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '75%'}}>
                    <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center'}}>Opps! Grab a coffee while waiting for your next delivery!</Text>
                </View>
               
            </View>
        );
    }

    renderPlaceholder = () => {
        var ret = [];
        for (var i = 0; i < 2; i++) {
            ret.push(
                <View key={i} style={styles.renderLoading}>
                    <Placeholder.ImageContent
                        onReady={false}
                        lineNumber={3}
                        animate="shine"
                        lastLineWidth="40%"
                        >
                    </Placeholder.ImageContent>
                </View>
            );
        }
        return ret;
    }

    getCurrentLoc = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {    
              const myLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              this.props.setMyLocation(myLocation);
            },
            (error) => alert(error),
            { enableHighAccuracy: true, timeout: 20000 },
        );
    }
     
    // mocking reloading data from backend
    // 1.5-seconds refreshing
    _onRefresh = () => {
        setTimeout(() => {this.setState({ refreshing: true }), setTimeout(() => {this.setState({ refreshing: false })}, 1500)}, 50);
    }

    render() {
        return(
            <View style={styles.Container} >
                <Text style={styles.logo}>Tasks</Text>
                <View style={styles.listView}>
                    {
                        this.state.refreshing?
                        this.renderPlaceholder()
                        :
                        <FlatList
                            data={this.state.list}
                            renderItem={ ({item, index}) => {
                                return <TaskItem data={item} />
                            }}
                            onRefresh={this._onRefresh}
                            refreshing={this.state.refreshing}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={this.renderSeparator}
                            ListEmptyComponent={this.renderEmpty}
                            >
                        </FlatList>
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        // backgroundColor: 'red',
        padding: 15
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold'
    },
    listView: {
        flex: 1,
        marginTop: 3
        //  backgroundColor: 'teal'
    },
    renderLoading: {
        padding: 20, 
        height: 300, 
        backgroundColor: 'white', 
        marginTop: 10, 
    }
});

const mapStateToProps = (state) => ({
    user: state.user
});

const mapDispatchToProps = (dispatch) => ({
    setMyLocation: (location) => dispatch(actions.setMyLocation(location)),
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(taskScreen);