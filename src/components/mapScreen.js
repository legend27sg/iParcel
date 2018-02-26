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
import randomLocation from 'random-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.00002;
const LONGTITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAcLxVkdQVTPB19GnT4S-ii7IvfzigTLyQ';

class mapScreen extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
          loading: true,
          myLoc: {
            latitude: this.props.user.myLocation.latitude,
            longitude: this.props.user.myLocation.longitude
          },
          origin: {
            latitude: this.props.data.start.lat,
            longitude: this.props.data.start.lng
          },
          destination: {
            latitude: this.props.data.end.lat,
            longitude: this.props.data.end.lng
          },
          adhoc: {
              latitude: null,
              longitude: null,
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
          coords_toOrigin: [],
          coords_toDrop: [],
          coords_toAdHoc: [],
          buttonLock: false,
          adhoc_simulate: false,
        }
    }

    componentDidMount = () => {
        this.getCurrentLoc();
        this.setState({ loading: false });
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

        // 1km radius
        const radius = 1000;

        // simulating moving to mid journey, getting the mid latlong
        const count_before = this.state.coords_toOrigin.length / 2;
        const count_int = count_before.toFixed(0);

        const midjourney = {
            coordinates: {
                latitude: this.state.coords_toOrigin[count_int].latitude,
                longitude: this.state.coords_toOrigin[count_int].longitude
            }
        }

        if(Platform.OS === 'android') {
            const coordinates = {
                latitude: this.state.coords_toOrigin[count_int].latitude,
                longitude: this.state.coords_toOrigin[count_int].longitude
            }

            this.marker._component.animateMarkerToCoordinate(coordinates, 500);
        } else {
            this.setState({ myMarker: midjourney });
        }

        const coordinates = {
            latitude: this.state.coords_toOrigin[count_int].latitude,
            longitude: this.state.coords_toOrigin[count_int].longitude
        }
        
        // saving current location
        this.setState({ myLoc: coordinates });

        // adding adhoc point from current location
        const randomPoint = randomLocation.randomCirclePoint(this.state.myLoc, radius);

        const randomPointFromOrigin = {
            latitude: randomPoint.latitude,
            longitude: randomPoint.longitude
        }

        this.setState({ adhoc: randomPointFromOrigin, adhoc_simulate: true });

        // move to ahhoc
        Alert.alert(
            'Attention!',
            'New ad-hoc task added based on your location. Take note of orange color pin',
            [
            {text: 'Cancel', onPress: () => null, style: 'cancel'},
            {text: 'OK', onPress: () => this.handleMove(3)},
            ],
        );
         
    }

    openGps = () => {
        var scheme = Platform.OS === 'ios' ? 'http://maps.apple.com/?daddr=' : 'http://maps.google.com/?daddr=';
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
    // 3 = navigate to adhoc
    handleMove = (mode) => {

        this.setState({ buttonLock: true });
        let arr = [];

        if(mode === 1){
            arr = this.state.coords_toOrigin;
        }

        if(mode === 2){
            arr = this.state.coords_toDrop;
        }

        if(mode === 3){
            arr = this.state.coords_toAdHoc;
        }

        let genObj = genFunc();
        
        let val = genObj.next();
        // console.log(val.value);
        
        let interval = setInterval(() => {
          val = genObj.next();
          
          if (val.done) {
            this.setState({ buttonLock: false });
            clearInterval(interval);
          } else {

            const myMarker = {
                coordinates: {
                    latitude: val.value.latitude,
                    longitude: val.value.longitude
                }
            };
            this.setState({ myMarker: myMarker });

            // this._map.fitToElements(true);
            this._map.fitToCoordinates(arr, {
                edgePadding: {
                  right: Platform.OS==="android"?100:(width / 20),
                  bottom: Platform.OS==="android"?100:(height / 20),
                  left: Platform.OS==="android"?100:(width / 20),
                  top: Platform.OS==="android"?100:(height / 20),
                }
              });

          }
        }, 100);
        
        function* genFunc() {
          for(let item of arr) {
            yield item;
          }
        }
         
    }

    render() {
        return(
            <View style={styles.Container} >
                {
                    this.state.loading === false ? 
                    <MapView 
                        ref={component => this._map = component}
                        style={styles.map}
                        provider="google"
                        loadingEnabled
                        initialRegion={{
                            latitude: this.state.origin.latitude,
                            longitude: this.state.origin.longitude,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGTITUDE_DELTA
                            
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
                                        right: 100,
                                        bottom: 100,
                                        left: 100,
                                        top: 100,
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
                            ref={marker => { this.marker = marker; }}
                            coordinate={this.state.myMarker.coordinates}
                            // image={require('../../assets/car.png')}
                            pinColor="violet"
                        />

                        {
                            this.state.adhoc_simulate?
                            <MapView.Marker
                                coordinate={this.state.adhoc}
                                pinColor="orange"
                                title="Ad-hoc task"
                            />
                            :
                            null
                        }

                        {
                            this.state.adhoc_simulate?
                            <MapViewDirections
                                origin={this.state.myLoc}
                                destination={this.state.adhoc}
                                apikey={GOOGLE_MAPS_APIKEY}
                                mode="driving"
                                strokeWidth={3}
                                strokeColor="orange"
                                onReady={(result) => {
                                    this.setState({ coords_toAdHoc: result.coordinates });
                                }}
                                onError={(errorMessage) => {
                                    console.log(errorMessage);
                                }}
                            />
                            :
                            null    
                        }

                    </MapView>
                    :
                    null
                }
                    
                {
                    this.state.buttonLock?
                    <View style={styles.text}>
                        <Text style={{ color: 'red', fontSize: 24, fontWeight: 'bold' }}>Simulating...</Text>
                    </View>
                    :
                    null
                }    

                {
                    this.state.buttonLock? 
                    null
                    :
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
                }
                    
                {
                    this.state.buttonLock?
                    null
                    :
                    <TouchableOpacity style={styles.navToOrigin} onPress={() => {
                        this.handleMove(1);
                    }}>
                        <Text adjustsFontSizeToFit style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Move (PickUp)</Text>
                    </TouchableOpacity>
                }
                    
                {
                    this.state.buttonLock?
                    null
                    :
                    <TouchableOpacity style={styles.navToDrop} onPress={() => {
                        this.handleMove(2);
                    }}>
                        <Text adjustsFontSizeToFit style={{ color: 'black', fontSize: 16, fontWeight: '600' }}>Move (DropOff)</Text>
                    </TouchableOpacity>
                }
                    
                {
                    this.state.buttonLock?
                    null
                    :
                    <TouchableOpacity style={styles.simulateButton} onPress={() => {
                        this.props.showAlert({
                            title: 'Simulation',
                            message: 'Adding adhoc delivery..',
                            alertType: 'success',
                        });
                        Alert.alert(
                            'Simulation',
                            'Adding adhoc delivery..',
                            [
                            {text: 'Cancel', onPress: () => null, style: 'cancel'},
                            {text: 'OK', onPress: () => this.handleSimulation()},
                            ],
                        );
                    }}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Simulate</Text>
                    </TouchableOpacity>
                }
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
        width: 120, 
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
        width: 120, 
        backgroundColor: 'white',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        position: 'absolute', 
        top: 20, 
        left: 135, 
        height: 50, 
        width: 150, 
        backgroundColor: 'transparent',
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