import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';
import CategoryItem from '../Components/CategoryItem';
import HeroSlider from '../Components/HeroSlider';

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
      {/* Non-scrollable Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/PRLOGO-mobileapp.png')} // Replace with your actual logo path
            style={styles.logo}
          />
          <Text style={styles.logoText}>PcRex</Text>
        </View>

        <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartIconContainer}>
            <Icon name="cart-outline" size={24} color="#000" />
            {/* Show the cart count only if there are items */}
            {cartItems.length > 0 && (
              <View style={styles.cartCount}>
                <Text style={styles.cartCountText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Container */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#000" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#000"
        />
        <Icon name="tune" size={20} color="#000" style={styles.filterIcon} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E50914']}  // Set the color of the spinner
          />
        }
      >
        {/* Hero Section */}
        <SafeAreaView style={{ flex: 1 }}>
          <HeroSlider />
        </SafeAreaView>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: -5,
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 15,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc', // light gray border (you can change this to match your theme)
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlignVertical: 'center', // vertical center (Android only)
    height: 35,                  // ensure fixed height for vertical alignment
    paddingVertical: 0,          // remove extra padding if any
  },
  filterIcon: {
    marginLeft: 8,
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
