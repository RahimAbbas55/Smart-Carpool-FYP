import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View , Dimensions, Platform} from 'react-native';
import { getUserData } from '../../data-service/auth';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import Button from '../../components/Button';
import InputField from '../../components/InputField';

const { width, height } = Dimensions.get('window');

const RequestRideScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeMode, setActiveMode] = useState('Carpool');
  const [selectedRideOption, setSelectedRideOption] = useState(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [fare, setFare] = useState('');
  const [destination, setDestination] = useState(null);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // useEffect to fetch user's data after logging in
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData(data); 
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data. Please try again.');
      }
    };
    fetchUserData();
  } , [])

  const handleNextPress = () => {
    if (!pickup || !dropoff || !fare || !selectedRideOption || !currentLocation) {
      Alert.alert('Error', 'Please fill out all fields, select a ride option, and allow location access.');
      return;
    }

    const rideData = {
      mode: activeMode,
      rideType: selectedRideOption,
      pickup,
      dropoff,
      fare,
      location: currentLocation,
    };

    if (activeMode === 'Carpool') {
      navigation.navigate('CarpoolRide', { rideData });
    } else {
      navigation.navigate('SingleRide', { rideData });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Menu' , {userData})}
        style={styles.menuIcon}
      >
        <MaterialIcons name="menu" size={30} color="black" />
      </TouchableOpacity>
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView style={StyleSheet.absoluteFillObject} initialRegion={currentLocation}>
            <Marker coordinate={currentLocation} title="Current Location" />
            {destination && <Marker coordinate={destination} title="Destination" />}
          </MapView>
        ) : (
          <Text>Loading current location...</Text>
        )}
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.rideOptionsContainer}
        showsHorizontalScrollIndicator={false}
      >
        {[{ id: 'ac', label: 'Ride A/C', iconName: 'air' }, { id: 'economy', label: 'Economy', iconName: 'directions-car' }, { id: 'rickshaw', label: 'Rickshaw', iconName: 'local-taxi' }, { id: 'bike', label: 'Bike', iconName: 'pedal-bike' }].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.rideOption, selectedRideOption === option.id && styles.selectedRideOption]}
            onPress={() => setSelectedRideOption(option.id)}
          >
            <MaterialIcons
              name={option.iconName}
              size={25}
              color={selectedRideOption === option.id ? '#1E40AF' : '#374151'}
            />
            <Text style={[styles.rideLabel, selectedRideOption === option.id && styles.selectedRideLabel]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.modeToggleContainer}>
        {['Carpool', 'Single'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.checkboxContainer, activeMode === mode && styles.checked]}
            onPress={() => setActiveMode(mode)}
          >
            <Text style={[styles.checkboxLabel, activeMode === mode && styles.activeCheckboxLabel]}>
              {mode} Mode
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputContainer}>
        <InputField
          placeholder="From"
          value={pickup}
          onChangeText={(text) => setPickup(text)}
        />
        <InputField
          placeholder="To"
          value={dropoff}
          onChangeText={(text) => {
            setDropoff(text);
            setDestination({ latitude: 40.712776, longitude: -74.005974 });
          }}
        />
        <InputField
          placeholder="Offer your fare in PKR"
          keyboardType="numeric"
          value={fare}
          onChangeText={(text) => setFare(text)}
        />
      </View>
      <View style={styles.button}>
        <Button text="Next" onPress={handleNextPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  mapContainer: {
    flex: 8,
    marginBottom: height * 0.02, 
  },
  rideOptionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: width * 0.04, 
    marginVertical: height * 0.01, 
  },
  rideOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: width * 0.03, 
    padding: width * 0.03, 
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  selectedRideOption: {
    backgroundColor: '#BFDBFE',
  },
  rideLabel: {
    marginTop: height * 0.005, 
    fontSize: width * 0.035, 
    color: '#374151',
  },
  selectedRideLabel: {
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: width * 0.05, 
    marginVertical: height * 0.01,
  },
  checkboxContainer: {
    padding: width * 0.03, 
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  checked: {
    backgroundColor: '#BFDBFE',
  },
  checkboxLabel: {
    fontSize: width * 0.04, 
    color: '#374151',
  },
  activeCheckboxLabel: {
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginVertical: height * 0.02, 
    paddingHorizontal: width * 0.05, 
  },
  menuIcon: {
    width: width * 0.12, 
    height: width * 0.12, 
    borderRadius: width * 0.06, 
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.03 : height * 0.02, 
    left: width * 0.03,
    zIndex: 1,
  },
  button: {
    width: width * 0.9, 
    marginHorizontal: width * 0.09, 
  },
});
export default RequestRideScreen;
