import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';  // Import Bottom Tab Navigator

import GetStarted from './Screens/GetStarted';
import SignIn_SignUp from './Screens/SignIn_SignUp';
import Home from './Screens/Home';
import Products from './Screens/Products';
import Cart from './Screens/Cart';
import Account from './Screens/Account';
import ForgotPassword from './Screens/ForgotPassword';
import ProductDetails from './Screens/ProductDetails';
import CategoryList from './Screens/CategoryList';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#fff", // Tab bar background color (white)
          justifyContent: "center",
          height: 60,
          width: "100%", // Adjust width to center
          alignSelf: "center", // Center the tab bar horizontally
          borderTopWidth: 0, // Remove the top border (underline)
          borderTopColor: "transparent", // Ensure the top border color is transparent
        },
        tabBarLabelStyle: {
          textAlign: "center", // Center the label
          fontSize: 12, // Smaller font size for tab labels
          fontWeight: "bold", // Make tab label text bold
          color: "#000", // Black color for text
        },
        tabBarIconStyle: {
          width: 30, // Set fixed width for the icons
          height: 30, // Set fixed height for the icons
          color: "#000", // Black color for icons
          top: 5,
        },
        tabBarActiveTintColor: "#E50914", // Active tab icon and label color (Red)
        tabBarInactiveTintColor: "#000", // Inactive tab icon and label color (Black)
        tabBarShowLabel: true, // Show the label under the icons
        tabBarInactiveBackgroundColor: "#fff", // White background for inactive tabs
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? "cart" : "cart-outline"} size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? "account-circle" : "account-circle-outline"} size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const App = () => {
  return (
    <>
      <StatusBar hidden={false} translucent={true} backgroundColor="transparent" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="GetStarted">
          {/* Loading Screen is the first screen before authentication */}
          <Stack.Screen name="GetStarted" component={GetStarted} options={{ headerShown: false }} />
          {/* Authentication screens */}
          <Stack.Screen name="SignIn_SignUp" component={SignIn_SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
          <Stack.Screen name="Products" component={Products} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
          <Stack.Screen name="CategoryList" component={CategoryList} options={{ headerShown: false }} />
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
          {/* Main Application Screens */}
          <Stack.Screen
            name="Home"
            component={TabNavigator} // Use the TabNavigator for main app flow
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
