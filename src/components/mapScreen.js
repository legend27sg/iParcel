import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Alert,
    Platform,
    Linking,
    InteractionManager
  } from 'react-native';
import MapView from 'react-native-maps';
import { Actions } from 'react-native-router-flux';
import MapViewDirections from 'react-native-maps-directions';
import getDirections from 'react-native-google-maps-directions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions';
import { Icon } from 'react-native-elements';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAcLxVkdQVTPB19GnT4S-ii7IvfzigTLyQ';

class mapScreen extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
          loading: true,
          myLoc: {
            latitude: null,
            longitude: null
          },
          myMarker: {
            title: 'ME',
            coordinates: {
                latitude: this.props.user.myLocation.latitude,
                longitude: this.props.user.myLocation.longitude
            },
          },
          markers: [{
            title: 'Pick Up',
            pinColor: 'green',
            coordinates: {
              latitude: this.props.data.start.lat,
              longitude: this.props.data.start.lng
            },
          },
          {
            title: 'Drop Off',
            pinColor: 'red',
            coordinates: {
              latitude: this.props.data.end.lat,
              longitude: this.props.data.end.lng
            },  
          },
        ],
          origin: {
            latitude: this.props.data.start.lat,
            longitude: this.props.data.start.lng
          },
          destination: {
            latitude: this.props.data.end.lat,
            longitude: this.props.data.end.lng
          },
          coords_toOrigin: [],
          coords_toDrop: []
        }
    }

    componentDidMount = () => {
        this.getCurrentLoc();
    }

    getCurrentLoc = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {    
              const myLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              this.setState({myLoc: myLocation});
            },
            (error) => alert(error),
            { enableHighAccuracy: true, timeout: 20000 },
        );
    }

    handleSimulation = () => {
        
    }

    openGps = () => {
        var scheme = Platform.OS === 'ios' ? 'http://maps.apple.com/?daddr=' : 'geo:';
        const latLng = `${this.state.origin.latitude},${this.state.origin.longitude}`;
        var url = scheme + latLng;
        // console.log(url);
        this.openExternalApp(url)
      }

    openExternalApp(url) {
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log('Don\'t know how to open URI: ' + url);
          }
        });
      }
    
    // mode
    // 1 = navigate to origin
    // 2 = navigate from origin to dropoff
    handleMove = (mode) => {
        this.moveCar(mode);         
    }

    moveCar = (mode) => {

        let arr = mode===1?this.state.coords_toOrigin:this.state.coords_toDrop;
        let genObj = genFunc();
        
        let val = genObj.next();
        // console.log(val.value);
        
        let interval = setInterval(() => {
          val = genObj.next();
          
          if (val.done) {
            clearInterval(interval);
          } else {

            const myMarker = {
                coordinates: {
                    latitude: val.value.latitude,
                    longitude: val.value.longitude
                }
            };
            this.setState({ myMarker: myMarker });

            this._map.fitToElements(true);

          }
        }, 150);
        
        function* genFunc() {
          for(let item of arr) {
            yield item;
          }
        }
         
    }

    render() {
        return(
            <View style={styles.Container} >
                <MapView 
                    ref={component => this._map = component}
                    style={styles.map}
                    provider="google"
                    loadingEnabled
                    // showsUserLocation
                    onMapReady={() => {
                        // alert('ready');
                        // this.setState({loading: false});
                        }}
                >

                    <MapViewDirections
                                origin={this.state.origin}
                                destination={this.state.destination}
                                apikey={GOOGLE_MAPS_APIKEY}
                                mode="driving"
                                strokeWidth={3}
                                strokeColor="#198cff"
                                onReady={(result) => {
                                    this.setState({ coords_toDrop: result.coordinates });
                                }}
                                onError={(errorMessage) => {
                                    console.log(errorMessage);
                                }}
                    />


                    <MapViewDirections
                            origin={this.state.myLoc}
                            destination={this.state.origin}
                            apikey={GOOGLE_MAPS_APIKEY}
                            mode="driving"
                            strokeWidth={3}
                            strokeColor="grey"
                            onReady={(result) => { 
                                this._map.fitToCoordinates(result.coordinates, {
                                edgePadding: {
                                    right: (width / 20),
                                    bottom: (height / 20),
                                    left: (width / 20),
                                    top: (height / 20),
                                }
                                });
                                this.setState({ coords_toOrigin: result.coordinates });
                            }}      
                            onError={(errorMessage) => {
                                console.log(errorMessage);
                            }}
                    />
                    
                    {this.state.markers.map((marker, index) => (
                        <MapView.Marker 
                            key={index}
                            pinColor={marker.pinColor}
                            coordinate={marker.coordinates}
                            title={marker.title}
                        />
                    ))}

                    <MapView.Marker.Animated
                        coordinate={this.state.myMarker.coordinates}
                        // image={require('../../assets/car.png')}
                        pinColor="black"
                    />

                </MapView>

                <TouchableOpacity style={styles.navigateButton} onPress={() => {
                    this.openGps();
                }}>
                    <Icon
                        name='md-navigate'
                        type='ionicon'
                        color='black'
                        size={38}
                    />
                    <Text>Go!</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.navToOrigin} onPress={() => {
                    this.handleMove(1);
                }}>
                    <Text adjustsFontSizeToFit style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Move (PickUp)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navToDrop} onPress={() => {
                    this.handleMove(2);
                }}>
                    <Text adjustsFontSizeToFit style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Move (DropOff)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.simulateButton} onPress={() => {
                    this.props.showAlert({
                        title: 'Notification',
                        message: 'New ad-hoc job pending..',
                        alertType: 'success',
                    });
                    Alert.alert(
                        'Attention!',
                        'New ad-hoc task added. Proceed to location?',
                        [
                        {text: 'Cancel', onPress: () => this.setState({loading: false}), style: 'cancel'},
                        {text: 'OK', onPress: () => this.handleSimulation()},
                        ],
                    );
                }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Simulate</Text>
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
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    navigateButton: {
        position: 'absolute', 
        top: 20, 
        right: 20, 
        height: 70, 
        width: 70, 
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    simulateButton: {
        position: 'absolute', 
        bottom: 30, 
        right: 30, 
        height: 50, 
        width: 100, 
        backgroundColor: 'red',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    navToOrigin: {
        position: 'absolute', 
        bottom: 30, 
        left: 30, 
        height: 50, 
        width: 100, 
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    navToDrop: {
        position: 'absolute', 
        bottom: 30, 
        left: 155, 
        height: 50, 
        width: 100, 
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },

});

const mapStateToProps = (state) => ({
    user: state.user
});

const mapDispatchToProps = (dispatch) => ({
    setMyLocation: (location) => dispatch(actions.setMyLocation(location)),
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(mapScreen);