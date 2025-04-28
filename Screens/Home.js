import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';
import CategoryItem from '../Components/CategoryItem';
import HeroSlider from '../Components/HeroSlider';

import { LinearGradient } from 'expo-linear-gradient';


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
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const { cartItems } = useContext(CartContext); // Access cartItems from CartContext

  // Navigate to the SearchResults screen
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('AllProducts', { query: searchQuery });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
  colors={['#E50914', '#C70039']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.headerContainer}
>
  {/* Row containing Cart and Search */}
  <View style={styles.topRow}>
    
    {/* Search Bar */}
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        placeholderTextColor="#000"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity onPress={handleSearch}>
        <Icon name="magnify" size={24} color="#E50914" />
      </TouchableOpacity>
    </View>
    {/* Cart Button */}
    <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
      <View style={styles.cartIconContainer}>
        <Icon name="cart-outline" size={28} color="#fff" />
        {cartItems.length > 0 && (
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{cartItems.length}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>

  </View>
</LinearGradient>


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
        <ProductList products={products} />
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
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // cart on left, search on right
  },
  
  CartIcon: {
    marginLeft: 20,
  },
  
  cartIconContainer: {
    position: 'relative',
  },
  
  cartCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cartCountText: {
    fontSize: 10,
    color: '#E50914',
    fontWeight: 'bold',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 10,
    height: 40,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  
});

export default Home;
