import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { loginUser } from '../api/lendingApi';

interface LoginScreenProps {
  navigation: any;
  setIsAuthenticated: (value: boolean) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // const response = await axios.post('http://172.20.10.3:10000/api/authentication/login', {
      //   email,
      //   password,
      // });
      const response = await loginUser({email, password });
      const token = response.token;
      console.log(`${response.name}, ${response.token}, ${response._id}, ${token}`)
      await AsyncStorage.setItem('token', token); // Save token to AsyncStorage
      await AsyncStorage.setItem('user_id', response._id); // saving user_id in AsyncStorage
      setIsAuthenticated(true); // Update authentication status
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate("Signup")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default LoginScreen;
