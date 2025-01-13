import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationState } from '@react-navigation/native';

interface ProfileScreenProps {
  navigation: any;
}



const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {

  const state = useNavigationState(state => state);

  console.log('Current Navigation State:', state);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); // Remove token
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // Set Login as the initial screen
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
