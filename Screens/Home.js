import React, { useState, useEffect, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Platform, Dimensions, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
// Import the FLAT ARRAY of products data
import productsData from '../Screens/Products.json'; // This is an ARRAY
import ProductList from '../Components/ProductList';
import HeroSlider from '../Components/HeroSlider';
import CategoryList from '../Components/CategoryList'; // Import CategoryList

import { LinearGradient } from 'expo-linear-gradient';
import { CartContext } from '../context/CartContext';

// --- CHANGES START HERE ---

// Correctly extract unique category names from the FLAT ARRAY
// 1. Map through the array to get the category name for each product
const allCategoryNamesRaw = productsData.map(product =>
    // Use optional chaining ?. in case category or name is missing
    product.category?.name
);

// 2. Filter out any undefined/null values (if any product missed category.name)
const validCategoryNames = allCategoryNamesRaw.filter(name => name);

// 3. Get unique category names using a Set
const uniqueCategoryNames = [...new Set(validCategoryNames)];

// Use the unique names for the list
const categoryNames = uniqueCategoryNames;

// Since productsData is already a flat array, we can use it directly for ProductList
const allProductsFlat = productsData;

// --- CHANGES END HERE ---


const { width } = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { cartItems } = useContext(CartContext);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts: ", error);
        setFontsLoaded(true); // Avoid infinite loading
      }
    };

    loadFonts();
  }, []);


  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('AllProducts', {
        query: searchQuery,
        // Pass the actual flat array
        productsToSearch: allProductsFlat
      });
    }
  };

  // --- UPDATED: Function to handle category selection -> NAVIGATE ---
  const handleCategorySelect = (categoryName) => {
    console.log("Navigating for Category:", categoryName);

    // 1. Filter products for the selected category *before* navigating
    const productsForCategory = allProductsFlat.filter(
        p => p.category?.name === categoryName
    );

    // 2. Navigate to the new screen, passing the name and the filtered products
    navigation.navigate('CategoryProductScreen', { // Use the name you'll define in the Navigator
      categoryName: categoryName,
      products: productsForCategory,
    });
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#E50914', '#C70039']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <View style={styles.topRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch}>
              <Icon name="magnify" size={24} color="#E50914" />
            </TouchableOpacity>
          </View>
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
            colors={['#E50914']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* --- CATEGORY LIST --- */}
        {/* REMOVED selectedCategory prop */}
        <CategoryList
          categories={categoryNames}
          onSelectCategory={handleCategorySelect}
          // selectedCategory={selectedCategory} // Removed
        />

        {/* Hero Slider */}
        <View style={styles.heroSliderContainer}>
            <HeroSlider />
        </View>

        {/* Product List Title */}
         <Text style={styles.productListTitle}>Featured Products</Text>

        {/* --- Product List --- */}
        {/* Pass the original flat array */}
        <ProductList products={allProductsFlat} />

        

      </ScrollView>
    </View>
  );
};

// Styles remain the same as before
const styles = StyleSheet.create({
    container: {
      flex: 1,
      
      backgroundColor: '#f8f8f8', // Slightly off-white background
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: '#E50914',
      marginTop: 10,
      fontSize: 16,
      fontFamily: 'Poppins-SemiBold',
    },
    content: { // Removed padding here
      flex: 1,
    },
    headerContainer: {
      paddingTop: Platform.OS === 'android' ? 40 : 50,
      paddingBottom: 20,
      paddingHorizontal: 15,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // marginBottom: 10, // Add space below header if needed
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    CartIcon: {
      marginLeft: 15,
    },
    cartIconContainer: {
      position: 'relative',
      padding: 5,
    },
    cartCount: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#fff',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E50914',
    },
    cartCountText: {
      fontSize: 10,
      color: '#E50914',
      fontFamily: 'Poppins-Bold',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 20,
      flex: 1,
      paddingHorizontal: 15,
      height: 40,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 0,
      marginRight: 5,
      fontFamily: 'Poppins-Regular',
      color: '#333',
    },
    heroSliderContainer: {
        // Add margin/padding around the slider if needed
        
        marginHorizontal: 15, // Add horizontal margin to align if content has padding
        borderRadius: 15, // Optional: round corners of slider container
        overflow: 'hidden', // Ensure slider respects border radius
    },
    productListTitle: { // Style for the "Featured Products" title
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',

        marginLeft: 15, // Align with other content padding
    },
});

export default Home;