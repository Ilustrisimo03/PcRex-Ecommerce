  import React, { useState, useRef, useEffect } from 'react';
  import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Animated, Easing, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  import { auth } from '../config/firebaseConfig';
  import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
  import * as Font from 'expo-font';
  import * as SplashScreen from 'expo-splash-screen';

  export default function Registrations({ navigation }) {
    const [isLogin, setIsLogin] = useState(true);
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState(""); 
    const [fontLoaded, setFontLoaded] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
      async function loadFont() {
        try {
          await Font.loadAsync({
            'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
            'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
            'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
            'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
            'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
          });
          setFontLoaded(true);
          await SplashScreen.hideAsync();
        } catch (error) {
          console.error('Error loading font:', error);
        }
      }
      loadFont();
    }, []);

    if (!fontLoaded) return null;

    

    const toggleMode = () => {
      Animated.timing(animatedValue, {
        toValue: isLogin ? 1 : 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start(() => {
        setIsLogin(!isLogin);
        animatedValue.setValue(0);
      });
    };

    const handleLogin = async () => {
      if (!email || !password) {
        Alert.alert("Error", "Please enter both email and password.");
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", "Logged in successfully!");
        navigation.navigate("Home"); 
      } catch (error) {
        Alert.alert("Login Failed", error.message);
      }
    };

    const handleSignUp = async () => {
      if (!email || !password || !fullName) {
        Alert.alert("Error", "Please fill all fields.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullName });
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate("Home"); 
      } catch (error) {
        Alert.alert("Sign Up Failed", error.message);
      }
    };

    return (    
      <View style={styles.mainContainer}> 
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('GetStarted')}>
          <Icon name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Your Account'}</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Enter your credentials to continue' : 'Enter your credentials to get started!'}</Text> 
      <View style={styles.container}>
        {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('GetStarted')}>
          <Icon name="arrow-left" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Your Account'}</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Enter your credentials to access your account' : 'Enter your credentials to register!'}</Text> */}

        
        <Animated.View

        
          style={[
            styles.formContainer,
            {
              transform: [
                { translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) },
                { scale: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
              ],
              opacity: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }),
            },
          ]}
        >

        {/* OR WITH GOOGLE */}
        <TouchableOpacity style={styles.googleButton}>
          <Image 
            source={require('../assets/google (1).png')} 
            style={{ width: 24, height: 24, marginRight: 8 }} 
          />
          {/* <Text style={styles.googleButtonText}>Google</Text> */}
          <Text style={styles.googleButtonText}>{isLogin ? 'Sign in' : 'Sign up'} with Google</Text>
        </TouchableOpacity>
        <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or with</Text>
            <View style={styles.line} />
        </View>

  {isLogin ? (
    <>
      
      <View style={styles.inputContainer}>
        
        

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-off'} size={24} color="#777" />
        </TouchableOpacity>
      </View>
    </>
  ) : (
    <>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#777"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Create Password"
          secureTextEntry={!showPassword}
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-off'} size={24} color="#777" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor="#777"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="#777" />
        </TouchableOpacity>

            
          
      </View>
      
    </>
  )}
        
        {isLogin && (
        <TouchableOpacity style={[styles.forgotPassword,{alignSelf: 'flex-end'}] } onPress={() => navigation.navigate('ForgotPassword')}>
          <Animated.Text style={[styles.forgotPasswordText]}>Forgot Password?</Animated.Text>
        </TouchableOpacity>
      )}

          <TouchableOpacity style={styles.button} onPress={isLogin ? handleLogin : handleSignUp}>
            <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
          </TouchableOpacity>

          {/* <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or {isLogin ? 'sign in' : 'sign up'} with</Text>
          <View style={styles.line} />
          </View>

        <TouchableOpacity style={styles.googleButton}>
          <Icon name="google" size={24} color="#000" />
          <Text style={styles.googleButtonText}>Google</Text>
        </TouchableOpacity> */}

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text style={styles.toggleLink} onPress={toggleMode}>
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </Text>
          </View>

        </Animated.View>

            
        
      </View>
    </View> 
    );
    
  }

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    container: {
      width: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 30,
      left: 10,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Poppins-Bold',
      color: '#000',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: 'Poppins-Regular',
      color: '#333',
      textAlign: 'center',
      marginBottom: 30,
    },
    formContainer: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: 18,
    },
    input: {
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: '#000',
    },
    eyeIcon: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: [{ translateY: -12 }],
    },
    button: {
      backgroundColor: '#E50914',
      paddingVertical: 14,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      color: '#fff',
      fontFamily: 'Poppins-Bold',
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      paddingVertical: 14,
      
    },
    googleButtonText: {
      fontSize: 14,
      color: '#333',
      fontFamily: 'Poppins-Medium',
      marginLeft: 6,
    },
    orContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 30,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: '#ccc',
      marginHorizontal: 8,
    },
    orText: {
      fontSize: 14,
      color: '#777',
      fontFamily: 'Poppins-Regular',
    },
    forgotPassword: {
      marginTop: -6,
      marginBottom: 8,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: '#E50914',
      fontFamily: 'Poppins-Regular',
    },
    toggleContainer: {
      marginTop: 30,
      alignItems: 'center',
    },
    toggleText: {
      fontSize: 14,
      color: '#666',
      fontFamily: 'Poppins-Regular',
    },
    toggleLink: {
      fontFamily: 'Poppins-Bold',
      color: '#E50914',
    },
  });
