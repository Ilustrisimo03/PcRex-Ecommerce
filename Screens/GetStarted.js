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
        'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
        'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts().catch(() => setFontsLoaded(false));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading</Text>
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
      
      <Text style={styles.title}>Welcome to PC Rex</Text>
      <Text style={styles.subtitle}>Your ultimate destination for custom-built PCs!</Text>

      <TouchableOpacity 
        style={styles.button} 
        // onPress={() => navigation.navigate('SignIn_SignUp')}>
        onPress={() => navigation.navigate('SignIn_SignUp')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#E50914',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#E50914',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  title: {
    color: '#000', // Black text
    fontSize: 32,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    color: '#000', // Black text
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    position: 'absolute',
    backgroundColor: '#E50914', // Red button
    bottom: 40,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    // overflow: 'hidden',
    // shadowColor: '#E50914',
    // shadowOpacity: 0.6,
    // shadowRadius: 15,
    // elevation: 8,
  },
  buttonText: {
    color: '#fff', // White text on button
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});

export default GetStarted;