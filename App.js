import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import GetStarted from './Screens/GetStarted';
import SignIn_SignUp from './Screens/SignIn_SignUp';
import Home from './Screens/Home';
import Product from './Screens/Product';
import Cart from './Screens/Cart';
import Account from './Screens/Account';
import ForgotPassword from './Screens/ForgotPassword';
import ProductDetails from './Screens/ProductDetails';
import CategoryList from './Screens/CategoryList';
import AllProducts from './Screens/AllProducts';

// Context
import { CartProvider } from './context/CartContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: "#fff", // Swapped: Now white
          height: 75,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
          paddingBottom: 10,
        },
        tabBarIconStyle: {
          width: 45,
          height: 45,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 10,
          fontFamily: 'Roboto',
          fontWeight: '600',
        },
        tabBarActiveTintColor: "#E50914", // Swapped: Now red
        tabBarInactiveTintColor: "#666666", 
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarAnimationEnabled: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
              style={{
                transform: focused ? [{ scale: 1.2 }] : [{ scale: 1 }],
                transition: 'transform 0.3s ease',
              }}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? "cart" : "cart-outline"}
              size={size}
              color={color}
              style={{
                transform: focused ? [{ scale: 1.2 }] : [{ scale: 1 }],
                transition: 'transform 0.3s ease',
              }}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Account"
        component={Account}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? "account-circle" : "account-circle-outline"}
              size={size}
              color={color}
              style={{
                transform: focused ? [{ scale: 1.2 }] : [{ scale: 1 }],
                transition: 'transform 0.3s ease',
              }}
            />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <CartProvider>
      <StatusBar hidden={false} translucent={true} backgroundColor="transparent" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="GetStarted"
          screenOptions={{
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  opacity: current.progress,
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                    {
                      scale: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.2, 1],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen
            name="GetStarted"
            component={GetStarted}
            options={{
              headerShown: false,
              cardStyle: { backgroundColor: '#fff' },
            }}
          />
          <Stack.Screen name="SignIn_SignUp" component={SignIn_SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
          <Stack.Screen name="Product" component={Product} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
          <Stack.Screen name="CategoryList" component={CategoryList} options={{ headerShown: false }} />
          <Stack.Screen name="AllProducts" component={AllProducts} options={{ headerShown: false }} />
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;
