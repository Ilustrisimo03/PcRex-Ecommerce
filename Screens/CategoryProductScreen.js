// src/Screens/CategoryProductScreen.js
import React, { useEffect, useContext, useState, useMemo } from 'react'; // Added useMemo
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

// --- Component Imports (VERIFY PATHS) ---
import ProductList from '../Components/ProductList';
import { CartContext } from '../context/CartContext';

// --- Data Import (VERIFY PATH) ---
import allProductsData from './Products.json'; // Used for global search fallback

const { width } = Dimensions.get('window');

// Define Sort Options
const SORT_OPTIONS = {
    DEFAULT: 'Default',
    PRICE_ASC: 'Price: Low to High',
    PRICE_DESC: 'Price: High to Low',
    NAME_ASC: 'Name: A to Z',
};

const CategoryProductScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { cartItems } = useContext(CartContext);

    // State for search and NEW state for sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState(SORT_OPTIONS.DEFAULT);

    // Get parameters - use originalProducts to preserve the initial list
    const { categoryName = 'Category', products: originalProducts = [] } = route.params || {};

    // Memoize the sorted/displayed products list
    const displayedProducts = useMemo(() => {
        let productsToDisplay = [...originalProducts]; // Start with a copy of original products

        // Apply sorting based on sortOption
        switch (sortOption) {
            case SORT_OPTIONS.PRICE_ASC:
                productsToDisplay.sort((a, b) => parseFloat(a?.price ?? 0) - parseFloat(b?.price ?? 0));
                break;
            case SORT_OPTIONS.PRICE_DESC:
                productsToDisplay.sort((a, b) => parseFloat(b?.price ?? 0) - parseFloat(a?.price ?? 0));
                break;
            case SORT_OPTIONS.NAME_ASC:
                productsToDisplay.sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? ''));
                break;
            // Add cases for NAME_DESC, RATING_DESC etc. if needed
            default:
                // No sorting or keep original order (already copied)
                break;
        }
        return productsToDisplay;
    }, [originalProducts, sortOption]); // Recalculate only when original products or sort option changes

    // Calculate product count from the original list
    const productCount = originalProducts.length;

    // Handle Search Submission (keeps global search for now)
    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            navigation.navigate('AllProducts', {
                query: searchQuery,
                productsToSearch: allProductsData
            });
            setSearchQuery('');
        }
    };

    // --- Render Sort Button ---
    const renderSortButton = (optionKey, optionText) => (
        <TouchableOpacity
            key={optionKey}
            style={[styles.sortButton, sortOption === optionText && styles.sortButtonActive]}
            onPress={() => setSortOption(optionText)}
        >
            <Text style={[styles.sortButtonText, sortOption === optionText && styles.sortButtonTextActive]}>
                {optionText.split(': ')[1] ?? optionText} {/* Show shorter text like 'Low to High' */}
            </Text>
        </TouchableOpacity>
    );

    return (
        // Use View container as header covers status bar
        <View style={styles.container}>
            {/* --- Custom Header --- */}
            <LinearGradient colors={['#E50914', '#C70039']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.headerContainer} >
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
                        <Icon name="arrow-left" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <TextInput style={styles.searchInput} placeholder={`Search products...`} placeholderTextColor="#777" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} returnKeyType="search" />
                        <TouchableOpacity onPress={handleSearch} style={styles.searchIconTouchable}>
                            <Icon name="magnify" size={24} color="#E50914" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
                        <View style={styles.cartIconContainer}>
                            <Icon name="cart-outline" size={28} color="#fff" />
                            {cartItems.length > 0 && ( <View style={styles.cartCount}> <Text style={styles.cartCountText}>{cartItems.length}</Text> </View> )}
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            {/* --- END HEADER --- */}

            {/* --- Scrollable Content Area --- */}
            <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} >

                {/* --- Category Title & Product Count --- */}
                <View style={styles.titleBar}>
                     <Text style={styles.categoryTitleText}>{categoryName}</Text>
                     {/* Display count only if there are products */}
                     {productCount > 0 && (
                         <Text style={styles.productCountText}>({productCount} Items)</Text>
                     )}
                </View>

                 {/* --- Sorting Options --- */}
                 {/* Only show sorting if there are products to sort */}
                {productCount > 0 && (
                    <View style={styles.sortContainer}>
                         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScrollContent}>
                            {renderSortButton('DEFAULT', SORT_OPTIONS.DEFAULT)}
                            {renderSortButton('PRICE_ASC', SORT_OPTIONS.PRICE_ASC)}
                            {renderSortButton('PRICE_DESC', SORT_OPTIONS.PRICE_DESC)}
                            {renderSortButton('NAME_ASC', SORT_OPTIONS.NAME_ASC)}
                            {/* Add more buttons if needed */}
                         </ScrollView>
                    </View>
                 )}


                {/* --- Product List or "No Products" Message --- */}
                {/* Base the "no products" message on the ORIGINAL data */}
                {originalProducts.length > 0 ? (
                    <View style={styles.productListWrapper}>
                        {/* Pass the SORTED products to the list */}
                        <ProductList products={displayedProducts} />
                    </View>
                ) : (
                    <View style={styles.contentWrapper}>
                         <View style={styles.noProductsContainer}>
                            <Icon name="tag-off-outline" size={70} color="#e0e0e0" />
                            <Text style={styles.noProductsTitle}>No Products Found</Text>
                            <Text style={styles.noProductsText}> There are currently no products available in the {categoryName} category. </Text>
                         </View>
                    </View>
                )}

                <View style={{ height: 30 }} />{/* Bottom Spacer */}
            </ScrollView>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8', },
    // Header Styles (keep existing)
    headerContainer: { paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 15, paddingHorizontal: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
    backButton: { padding: 8, },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, flex: 1, paddingHorizontal: 15, height: 42, marginHorizontal: 8, },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#333', paddingVertical: 0, },
    searchIconTouchable:{ paddingLeft: 8, },
    CartIcon: { marginLeft: 0, padding: 8, },
    cartIconContainer: { position: 'relative', },
    cartCount: { position: 'absolute', top: -6, right: -9, backgroundColor: '#fff', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#E50914', },
    cartCountText: { fontSize: 9, color: '#E50914', fontFamily: 'Poppins-Bold', fontWeight: 'bold', },
    // Content Styles
    scrollContainer: { flex: 1, },
    // --- Category Title Bar ---
     titleBar: {
        flexDirection: 'row',
        alignItems: 'baseline', // Align text baselines
        justifyContent: 'space-between', // Push count to the right
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 5, // Less padding below title before sort options
    },
    categoryTitleText: {
        fontSize: 24, // Slightly larger title
        fontFamily: 'Poppins-Bold',
        color: '#1c1c1c',
        fontWeight: 'bold',
         flexShrink: 1, // Allow title to shrink if needed
         marginRight: 8, // Space between title and count
    },
    productCountText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },
    // --- Sort Options ---
     sortContainer: {
        paddingVertical: 8,
        paddingBottom: 15, // More space after sorting buttons
        paddingLeft: 16, // Align with title padding start
        // borderBottomWidth: 1, // Optional separator
        // borderBottomColor: '#eee',
        // backgroundColor: '#fff', // Optional background
    },
     sortScrollContent: {
        // Ensure buttons have space on the right end
        paddingRight: 16,
    },
    sortButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortButtonActive: {
        backgroundColor: '#FFE5E8', // Use theme accent color
        borderColor: '#FAD1D5', // Use theme color
    },
    sortButtonText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#555',
    },
    sortButtonTextActive: {
        fontFamily: 'Poppins-Medium', // Bolder text when active
        color: '#C70039', // Darker theme color text
    },
    // --- Product List ---
     productListWrapper: {
        paddingHorizontal: 8, // Padding around the ProductList component
        marginTop: 5, // Space after sorting options
    },
    // "No Products" Styles
    contentWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 30, paddingBottom: 50, paddingHorizontal: 20, },
    noProductsContainer: { alignItems: 'center', padding: 20, },
     noProductsTitle: { // Added title for empty state
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#555',
        marginTop: 15,
        marginBottom: 5,
    },
    noProductsText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#888', textAlign: 'center', }, // Slightly smaller info text
    // Loader Style
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', },
});

export default CategoryProductScreen;