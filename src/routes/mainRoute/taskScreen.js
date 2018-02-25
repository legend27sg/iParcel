import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    FlatList,
    InteractionManager
  } from 'react-native';
import { Actions } from 'react-native-router-flux';
import TaskItem from '../../components/taskItem';
import Placeholder from 'rn-placeholder';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
        }
    }

    componentDidMount = () => {
        InteractionManager.runAfterInteractions(() => {
            // 2: Component is done animating
            // 3: Start fetching the team
            this.getCurrentLoc();
          });
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
    // 2-seconds refreshing
    _onRefresh = () => {
        setTimeout(() => {this.setState({ refreshing: true }), setTimeout(() => {this.setState({ refreshing: false })}, 2000)}, 50);
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
                            data={mockData}
                            renderItem={ ({item, index}) => {
                                return <TaskItem data={item} />
                            }}
                            onRefresh={this._onRefresh}
                            refreshing={this.state.refreshing}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={this.renderSeparator}
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