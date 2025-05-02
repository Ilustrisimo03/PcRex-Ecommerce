// src/Screens/CategoryProductScreen.js
import React, { useEffect, useContext, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform // Import Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

import ProductList from '../Components/ProductList';
import { CartContext } from '../context/CartContext';
// Ensure correct path to Products.json relative to CategoryProductScreen.js
import allProductsData from './Products.json';

const { width } = Dimensions.get('window');

const CategoryProductScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { cartItems } = useContext(CartContext);

    const [searchQuery, setSearchQuery] = useState('');

    // Get parameters passed from Home screen
    const { categoryName = 'Category', products = [] } = route.params || {};

    // Handle Global Search (no change needed)
    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            navigation.navigate('AllProducts', {
                query: searchQuery,
                productsToSearch: allProductsData
            });
            setSearchQuery('');
        }
    };

    // --- REMOVED: useEffect for navigation.setOptions ---
    // We are building the header manually now.

    return (
        // Use SafeAreaView to avoid notch/status bar overlap IF header is not covering it
        // If header IS covering status bar (like Home), View might be enough
        <SafeAreaView style={styles.container}>
             {/* --- CUSTOM HEADER --- */}
            <LinearGradient
                colors={['#E50914', '#C70039']} // Same colors as Home
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerContainer} // Use same style name as Home
            >
                <View style={styles.topRow}>
                    {/* --- Back Button --- */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()} // Navigate back
                    >
                        <Icon name="arrow-left" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* --- Search Container (inside header) --- */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search products...`} // More specific placeholder
                            placeholderTextColor="#777" // Lighter placeholder
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                       
                         {/* Optional: Spacer if no clear button */}
                         {searchQuery.length === 0 && <View style={{width: 10}}/>}

                        <TouchableOpacity onPress={handleSearch}>
                            <Icon name="magnify" size={24} color="#E50914" />
                        </TouchableOpacity>
                    </View>
                    {/* --- --- */}

                    {/* --- Cart Icon (inside header) --- */}
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
                    {/* --- --- */}
                </View>
            </LinearGradient>
            {/* --- END OF CUSTOM HEADER --- */}

            {/* --- Scrollable Content Area --- */}
            <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                {/* Optional: Add Title Text Again if needed, otherwise header serves as title */}
                {/* <Text style={styles.categoryTitleText}>{categoryName}</Text> */}

                {/* --- Product Listing --- */}
                {products.length > 0 ? (
                    <ProductList products={products} />
                ) : (
                    // Add ActivityIndicator check in case products are still loading
                    // (though currently they are passed directly)
                    // Use a View with flex: 1 for the "No products" message
                    // to help center it vertically if needed.
                    <View style={styles.contentWrapper}>
                         <View style={styles.noProductsContainer}>
                            <Icon name="tag-off-outline" size={60} color="#ccc" />
                            <Text style={styles.noProductsText}>
                                No products found in {categoryName}.
                            </Text>
                         </View>
                    </View>
                )}
                {/* --- --- */}

                {/* Add some bottom padding inside ScrollView */}
                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
// Combine styles from Home header and previous CategoryProductScreen styles
const styles = StyleSheet.create({
    container: { // Changed from safeArea to container, acting as the main screen wrapper
      flex: 1,
      backgroundColor: '#f8f8f8', // Background for the content area below header
    },
    // --- Header Styles (Copied/Adapted from Home) ---
    headerContainer: {
      paddingTop: Platform.OS === 'android' ? 40 : 50, // Adjust for status bar
      paddingBottom: 15, // Slightly less bottom padding? Adjust as needed
      paddingHorizontal: 10, // Adjusted horizontal padding
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      // Elevation/Shadow can remain if desired
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', // Ensure spacing
    },
    backButton: {
        padding: 5, // Make it easier to tap
        marginRight: 5, // Space between back button and search bar
    },
    searchContainer: { // This is the search bar *inside* the header
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 20,
      flex: 1, // Allow it to take available space
      paddingHorizontal: 12, // Adjusted padding
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      // Remove explicit paddingVertical here if handled by container padding
      marginRight: 5,
      fontFamily: 'Poppins-Regular',
      color: '#333',
    },
    CartIcon: { // Cart Icon Wrapper on the right
      marginLeft: 5, // Space between search and cart
      padding: 5, // Easier to tap
    },
    cartIconContainer: { // Inner view for badge positioning
      position: 'relative',
    },
    cartCount: { // Badge styling (same as Home)
      position: 'absolute',
      top: -5,
      right: -8,
      backgroundColor: '#fff',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E50914',
    },
    cartCountText: { // Text inside badge (same as Home)
      fontSize: 10,
      color: '#E50914',
      fontFamily: 'Poppins-Bold',
    },
    // --- Styles for Scrollable Content Area ---
    scrollContainer: {
        flex: 1, // Ensure ScrollView takes remaining space
    },
    contentWrapper: { // Added wrapper for centering "No products" message
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50, // Add some space from top
    },
    noProductsContainer: { // Centered content for no products
        alignItems: 'center',
        padding: 20,
    },
    noProductsText: {
        fontSize: 17,
        fontFamily: 'Poppins-Medium', // Slightly bolder
        color: '#888', // Grey color
        textAlign: 'center',
        marginTop: 15,
    },
    // --- Loader Style (keep for potential future use) ---
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
     // --- Removed old header/search styles ---
    // cartIconTouchable: { ... }, // Use CartIcon now
    // searchWrapper: { ... }, // Search is inside header now
});

export default CategoryProductScreen;