import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

  import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import GetStarted from './Screens/GetStarted';
import SignIn_SignUp from './Screens/SignIn_SignUp';
import Home from './Screens/Home';
import Product from './Screens/Product';
import Build from './Screens/Build';
import Cart from './Screens/Cart';
import Account from './Screens/Account';
import ForgotPassword from './Screens/ForgotPassword';
import ProductDetails from './Screens/ProductDetails';
import CategoryList from './Components/CategoryList';
import CategoryProductScreen from './Screens/CategoryProductScreen';
import SaveAddresses from './Screens/SaveAddresses';
import AddEditAddress from './Screens/AddEditAddress';

import EditProfile from './Screens/EditProfile';
import OrderHistory from './Screens/OrderHistory';
import OrderDetails from './Screens/OrderDetails';

import AllProducts from './Screens/AllProducts';
import Checkout from './Screens/Checkout';

// Context
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; // <--- Import AuthProvider
import { OrdersProvider } from './context/OrdersContext'; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
  screenOptions={{
    tabBarBackground: () => (
      <LinearGradient
        colors={['#E50914', '#C70039']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, borderRadius: 25 }}
      />
    ),
    tabBarStyle: {
      position: 'absolute',
      bottom: 10,
      left: 10,
      right: 10,
      height: 60,
      marginHorizontal: 10, // this adds space on the sides to visually center it
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 20,
      overflow: 'hidden', // important to prevent background bleed outside rounded corners
    },
    tabBarIconStyle: {
      width: 30,
      height: 30,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      marginBottom: 10,
    },
    tabBarActiveTintColor: '#FFFFFF',
    tabBarInactiveTintColor: '#FFD1D1', 
    tabBarShowLabel: true,
    tabBarLabelPosition: 'below-icon',
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
            
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Products"
        component={Product}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? "store" : "store-outline"}
              size={size}
              color={color}
            
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Build"
        component={Build}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? "devices" : "devices"}
              size={size}
              color={color}
            
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
     // Wrap with AuthProvider *before* CartProvider if Cart needs Auth info,
    // or wrap CartProvider if Auth needs Cart info (usually Auth is higher level)
    <AuthProvider>
    <CartProvider>
    <OrdersProvider> {/* <--- Wrap here */}
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
          <Stack.Screen name="Checkout" component={Checkout} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
          <Stack.Screen name="OrderHistory" component={OrderHistory} options={{ headerShown: false }} />
          <Stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: false }} />
          <Stack.Screen name="Product" component={Product} options={{ headerShown: false }} />
          <Stack.Screen name="Build" component={Build} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
          <Stack.Screen name="CategoryList" component={CategoryList} options={{ headerShown: false }} />
          <Stack.Screen name="CategoryProductScreen" component={CategoryProductScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AllProducts" component={AllProducts} options={{ headerShown: false }} />
          <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
          <Stack.Screen name="SaveAddresses" component={SaveAddresses} options={{ headerShown: false }} />
          <Stack.Screen name="AddEditAddress" component={AddEditAddress} options={{ headerShown: false }} />
          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </OrdersProvider>
    </CartProvider>
    </AuthProvider>
  );
};

export default App;
