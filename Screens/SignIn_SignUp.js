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
    <View style={styles.containerRed}> 
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('GetStarted')}>
        <Icon name="arrow-left" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Your Account'}</Text>
      <Text style={styles.subtitle}>{isLogin ? 'Enter your credentials to access your account' : 'Enter your credentials to register!'}</Text> 
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
          <Text style={styles.orText}>or {isLogin ? 'sign in' : 'sign up'} with</Text>
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
  containerRed: {  // New red background container
    flex: 1,
    backgroundColor: '#E50914',  // Red background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 0, // This will allow the container to resize based on the content.
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    height: 'auto',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    padding: 10,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 12,
    color: '#ffffff',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    marginBottom: 25,
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  toggleLink: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#E50914',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  orText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    // borderColor: '#ddd',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    fontFamily: 'Poppins-Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -14 }],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#E50914',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: '90%',
    marginBottom: 20,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  }
});

