import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';


const InputField = ({ placeholder, isPassword = false }) => {
    const [isVisible, setIsVisible] = useState(!isPassword);
    

    return (
        <View style={styles.inputContainer}>
            <TextInput
                placeholder={placeholder}
                secureTextEntry={!isVisible}
                style={styles.input}
            />
            {isPassword && (
                <TouchableOpacity
                    onPress={() => setIsVisible(!isVisible)}
                    style={styles.eyeIcon}
                >
                    <Icon name={isVisible ? 'eye' : 'eye-off'}  size={20} color="black" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const SignIn_SignUp = () => {
    const [isSignUp, setIsSignUp] = useState(false);
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
            <View style={styles.card}>
                <Text style={styles.title}>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</Text>
                <Text style={styles.subtitle}>{isSignUp ? 'Enter your credentials to register' : 'Enter your credentials to access your account'}</Text>

                <TouchableOpacity style={styles.googleButton}>
                <Icon name="google" size={20} color="#E50914" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>
                    {isSignUp ? 'Sign up' : 'Sign in'} with Google
                </Text>
            </TouchableOpacity>


                <Text style={styles.orText}>or {isSignUp ? 'sign up' : 'sign in'} with</Text>

                {isSignUp && <InputField placeholder="Full Name" />}
                <InputField placeholder="Email" />
                <InputField placeholder="Password" isPassword />
                {isSignUp && <InputField placeholder="Confirm Password" isPassword />}

                

                <TouchableOpacity style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
                </TouchableOpacity>

                <Text style={styles.switchText}>
                    {isSignUp ? 'Already have an account?' : `Don't have an account?`} 
                    <Text 
                        onPress={() => setIsSignUp(!isSignUp)}
                        style={styles.switchLink}>
                        {isSignUp ? ' Sign In' : ' Sign Up'}
                    </Text>
                </Text>

                {isSignUp && (
                    <View style={styles.privacyContainer}>
                        <Text style={styles.privacyTextWrapper}>
                            By using this app, you agree to our <Text style={styles.privacyText}>Terms of Use</Text> and <Text style={styles.privacyText}>Privacy Policy</Text>
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        top: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: '#FFFFFF', // White background
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: 24,
        borderRadius: 10,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 26,
        fontFamily: 'Poppins-Bold',
        textAlign: 'left',
        color: '#E50914',
    },
    subtitle: {
        textAlign: 'left',
        color: '#555',
        marginBottom: 15,
        fontFamily: 'Poppins-Regular',
    },
    googleIcon: {
        marginRight: 8,
    },
    googleButton: {
        flexDirection: 'row',  // Align icon and text horizontally
        backgroundColor: '#F3F3F3',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    googleButtonText: {
        color: '#000',
        fontFamily: 'Poppins-Bold',
    },
    orText: {
        textAlign: 'center',
        color: '#777',
        marginBottom: 16,
        fontFamily: 'Poppins-Regular',
    },
    inputContainer: {
        position: 'relative',
        width: '100%',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#fff',
        width: '100%',
        fontFamily: 'Poppins-Regular',
    },
    eyeIcon: {
        position: 'absolute',
        right: 15, // Adjust spacing from the right
        top: '50%',
        transform: [{ translateY: -10 }], // Move up by half the icon size
    },
    privacyContainer: {
        top: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyTextWrapper: {
        textAlign: 'center',
        fontSize: 13,
    },
    privacyText: {
        fontSize: 12,
        color: '#E50914',
        fontFamily: 'Poppins-Bold',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderColor: '#555',
        borderWidth: 1,
        borderRadius: 3,
        marginRight: 8,
        fontFamily: 'Poppins-Regular',
    },
    submitButton: {
        backgroundColor: '#E50914',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
    },
    switchText: {
        textAlign: 'center',
        color: '#555',
        marginTop: 16,
    },
    switchLink: {
        color: '#E50914',
        fontFamily: 'Poppins-Bold',
    },
});

export default SignIn_SignUp;
