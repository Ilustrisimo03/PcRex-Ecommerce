import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { Alert, Platform, ToastAndroid } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, RefreshControl, ScrollView, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';
import CategoryItem from '../Components/CategoryItem';

import { CartContext } from '../context/CartContext'; // Import CartContext



// Extract unique categories
const categories = Array.from(
  new Map(products.map((product) => [product.category.name, product.category])).values()
);

const { width } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();

  const [fontsLoaded, setFontsLoaded] = useState(false);
   const [refreshing, setRefreshing] = useState(false);



   const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };


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

  const { cartItems } = useContext(CartContext); // Access cartItems from CartContext

  return (
    <View style={styles.container}>
      {/* Main Scrollable Content */}
      <ScrollView style={styles.content} 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E50914']}  // Set the color of the spinner
          />
        }
        >
        
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity style={styles.profileIcon}>
          <Icon name="account" size={30} color="#000" />
        </TouchableOpacity>


          <TextInput placeholder="Search products..." style={styles.searchBar} />

           
          <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
            <View style={styles.cartIconContainer}>
              <Icon name="cart-outline" size={24} color="#000" />
              {/* Show the cart count only if there are items */}
              {cartItems.length > 0 && (
                <View style={styles.cartCount}>
                  <Text style={styles.cartCountText}>{cartItems.length}</Text> {/* Ensure it's wrapped in <Text> */}
                </View>
              )}
            </View>
          </TouchableOpacity>
          </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>PC REX</Text>
          <Text style={styles.heroText}>Build. Upgrade. Dominate.</Text>
          <Text style={styles.heroDescription}>
            Unleash the power of performance. Customize your dream PC with the best parts on the market.
          </Text>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {categories.map((category, index) => (
            <CategoryItem key={index} name={category.name} icon={category.icon} />
          ))}
        </ScrollView>

        {/* Product List */}
        <ScrollView vertical showsVerticalScrollIndicator={false}>
          <ProductList products={products} />
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingText: {
    color: '#E50914',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#111',
    borderRadius: 10,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#ff0000',
    textTransform: 'uppercase',
  },
  heroText: {
    fontSize: 21,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginTop: 5,
  },
  heroDescription: {
    fontSize: 12,
    color: '#ddd',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  profileIcon: {
    borderRadius: 50, // To make the image circular
    overflow: 'hidden', // Ensure the image is clipped to the circular shape
    width: 40, // Adjust the size of the circle
    height: 40, // Adjust the size of the circle
    borderWidth: 2, // Optional: to add a border around the profile image
    borderColor: '#E50914', // Optional: border color (can be your theme color)
    justifyContent: 'center', 
    alignItems: 'center',
  },
 
  searchBar: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333',
  },
  CartIcon: {
    marginLeft: 5,
  },
  cartIconContainer: {
    position: 'relative',  // For positioning the count over the icon
  },
  cartCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E50914',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Home;
