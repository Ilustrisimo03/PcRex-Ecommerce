import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

const GetStarted = () => {
  const navigation = useNavigation();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load custom font
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts().catch(() => setFontsLoaded(false));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/PRLOGO-mobileapp.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Pc Rex</Text>
      <Text style={styles.subtitle}>Your ultimate destination for custom-built PCs!</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('SignIn_SignUp')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#E50914',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: '#000',
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#E50914',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GetStarted;
