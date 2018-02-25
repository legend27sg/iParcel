import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Platform
  } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Geocoder from 'react-native-geocoding';
import MapView from 'react-native-maps';
import { Icon } from 'react-native-elements';
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0022;
const LONGTITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAcLxVkdQVTPB19GnT4S-ii7IvfzigTLyQ';

class taskItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
          status: this.props.data.status,
          startAddress: '',
          endAddress: '',
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
          }],
          origin: {
            latitude: this.props.data.start.lat,
            longitude: this.props.data.start.lng
          },
          destination: {
            latitude: this.props.data.end.lat,
            longitude: this.props.data.end.lng
          }
        }
    }

    componentWillMount = () => {
        // initialising
        Geocoder.setApiKey('AIzaSyBUxeAjYbQE-LqzE_3IU6JPNa6BAW8DPxk');

        // converting to readable address
        this.converting(this.props.data.start.lat, this.props.data.start.lng, true);
        this.converting(this.props.data.end.lat, this.props.data.end.lng, false);

    }

    converting = (lat, lng, start) => {
        Geocoder.getFromLatLng(lat, lng).then(
            json => {
              var address_component = json.results[0].formatted_address;
              // alert(address_component.long_name);
              // console.log(address_component);
              if (start === true ){
                  //converting for start latlng
                  this.setState({ startAddress: address_component });
              } else {
                  this.setState({ endAddress: address_component });
              }
            },
            error => {
              alert(error);
            }
          );
    }

    render() {
        var item = this.props.data;
        return(
            <View key={item.id} >
                <View style={styles.cardView}>
                    <View style={{ padding: 5, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: 'white' }}>
                        <Text>Job ID: {item.id}</Text>                    
                    </View>
                    <View style={{ flex: 2 }} >
                        <MapView 
                            ref={component => this._map = component}
                            style={styles.map}
                            provider="google"
                            initialRegion={{
                                latitude: item.start.lat,
                                longitude: item.start.lng,
                                latitudeDelta: LATITUDE_DELTA,
                                longitudeDelta: LONGTITUDE_DELTA
                                
                            }}
                            showsScale
                            showsBuildings
                            showsIndoors
                            liteMode
                            loadingEnabled
                            // showsUserLocation
                            zoomEnabled={false}
                            scrollEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                            onMapReady={() => {
                                // this._map.fitToElements(true);
                            }}
                        >
                            {this.state.markers.map((marker, index) => (
                                <MapView.Marker 
                                    key={index}
                                    pinColor={marker.pinColor}
                                    coordinate={marker.coordinates}
                                    title={marker.title}
                                />
                            ))}
                            <MapViewDirections
                                origin={this.state.origin}
                                destination={this.state.destination}
                                apikey={GOOGLE_MAPS_APIKEY}
                                mode="driving"
                                strokeWidth={3}
                                strokeColor="#198cff"
                                onReady={(result) => {
                                    this._map.fitToCoordinates(result.coordinates, {
                                      edgePadding: {
                                        right: (width / 20),
                                        bottom: (height / 20),
                                        left: (width / 20),
                                        top: (height / 20),
                                      }
                                    });
                                  }}
                                  onError={(errorMessage) => {
                                     console.log(errorMessage);
                                  }}
                            />
                        </MapView>
                    </View>
                    <View style={styles.cardBottomView} >
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                              
                                <View style={{ flex: 2.5, justifyContent: 'center', alignItems: 'center', width: '90%' }}>
                                    <View style={{flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f1f1f1' ,width: '90%', alignItems: 'center' }}>
                                        <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: 'green'}}/>
                                        <View style={{ marginLeft: 5 }}>
                                            <Text>{this.state.startAddress}</Text>
                                        </View>
                                    </View>
                                    <View style={{flex: 1, flexDirection: 'row', width: '90%', alignItems: 'center' }}>
                                         <View style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center'}}>
                                            <View style={{ height: 5, width: 5, borderRadius: 2.5, backgroundColor: 'white'}} />
                                         </View>
                                         <View style={{ marginLeft: 5 }}>
                                            <Text>{this.state.endAddress}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flex: 1, padding: 10 }}>
                                  {
                                      this.state.status === 0 ? 
                                        <TouchableOpacity style={styles.buttonView} onPress={() => {
                                            // Actions.mapScreen({ title: "JOB " + item.id, data: this.props.data });
                                            this.setState({ status: 1 });
                                        }}>
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon
                                                    name='check-circle'
                                                    type='feather'
                                                    color='white'
                                                    size={38}
                                                />
                                                <Text style={{ color: 'white', fontWeight: '700' }}>Accept</Text>
                                            </View>   
                                        </TouchableOpacity>
                                        :
                                        null
                                  }
                                  {
                                    this.state.status === 1 ? 
                                      <TouchableOpacity style={[styles.buttonView, {backgroundColor: 'grey'}]} onPress={() => {
                                          Actions.mapScreen({ title: "JOB " + item.id, data: this.props.data });
                                          // this.setState({ status: 1 });
                                      }}>
                                          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                              <Icon
                                                  name='navigation'
                                                  type='feather'
                                                  color='white'
                                                  size={38}
                                              />
                                              <Text style={{ color: 'white', fontWeight: '700' }}>Navigate</Text>
                                          </View>   
                                      </TouchableOpacity>
                                      :
                                      null
                                  }

                                </View>

                            </View>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cardView: {
        height: 300,
        width: '100%',
        // borderWidth: 1,
        // borderRadius: 10,
        // backgroundColor: 'white',
        elevation: 3,
        shadowOpacity: 0.2,
        shadowRadius: 0.1,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        // padding: 5,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
      },
    cardBottomView : {
        flex: 1, 
        backgroundColor: 'white', 
        borderBottomLeftRadius: 10, 
        borderBottomRightRadius: 10, 
        padding: 5
    },
    buttonView: {
        flex: 1, 
        backgroundColor: '#32CD32', 
        borderRadius: 5, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
});

export default taskItem;