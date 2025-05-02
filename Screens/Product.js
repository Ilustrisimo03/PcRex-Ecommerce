import React, { useState, useContext, useMemo } from 'react'; // Added useMemo
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, TextInput, Platform, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from '../Components/ProductCard'; // Import ProductCard
import CategoryList from '../Components/CategoryList'; // Import CategoryList

// Import structured data (already flattened in your code)
import productsData from '../Screens/Products.json';

const { width } = Dimensions.get('window');
// const CARD_WIDTH = (width - 48) / 2; // spacing + 2 cards - Not directly used here, but good to keep if ProductCard needs it implicitly

// --- Define Sort Options (Copied from CategoryProductScreen) ---
const SORT_OPTIONS = {
    DEFAULT: 'Default',
    PRICE_ASC: 'Price: Low to High',
    PRICE_DESC: 'Price: High to Low',
    NAME_ASC: 'Name: A to Z',
    // Add more options like NAME_DESC if needed
};

const Product = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category
    const [sortOption, setSortOption] = useState(SORT_OPTIONS.DEFAULT); // NEW: State for sorting
    const { cartItems } = useContext(CartContext);

    // Flatten the products data (already done)
    const allProductsFlat = Object.values(productsData).flat();

    // Extract category names from the structured data keys (already done)
    const categoryNames = Object.keys(productsData);

    // --- Filtering Logic (remains the same) ---
    const filteredProducts = useMemo(() => {
        console.log('Filtering products...'); // Add log for debugging
        return allProductsFlat.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
            // console.log(`Item: ${item.name}, Category: ${item.category}, Search: ${matchesSearch}, Cat Match: ${matchesCategory}`);
            return matchesSearch && matchesCategory;
        });
    }, [allProductsFlat, searchQuery, selectedCategory]); // Recalculate when base data, search, or category changes

    // --- NEW: Sorting Logic applied AFTER filtering ---
    const sortedAndFilteredProducts = useMemo(() => {
        console.log(`Sorting ${filteredProducts.length} products by ${sortOption}`); // Add log for debugging
        let productsToDisplay = [...filteredProducts]; // Start with the filtered list

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
            case SORT_OPTIONS.DEFAULT:
            default:
                // Keep the order from filtering (or original if no filter applied)
                 // If you want default to be by ID or original order, you might need
                 // to ensure the initial `allProductsFlat` has a stable order or sort by ID here.
                 // For now, it just uses the order resulting from filtering.
                break;
        }
        return productsToDisplay;
    }, [filteredProducts, sortOption]); // Recalculate only when filtered list or sort option changes

    const handleSearch = () => {
        // This search function currently navigates away for a global search.
        // If you want the search to *only* filter the current list, remove the navigation.
        // Keeping it as is for now based on the original code.
        if (searchQuery.trim() !== '') {
             // Maybe just filter the current view instead of navigating?
             // If so, remove the navigation line. The filtering is already handled by `filteredProducts`.
             console.log("Performing search filter locally...");
             // navigation.navigate('AllProducts', { query: searchQuery }); // Keep or remove based on desired UX
        }
    };

    const handleCategorySelect = (category) => {
        const newCategory = category === selectedCategory ? null : category;
        console.log("Selected category:", newCategory);
        setSelectedCategory(newCategory);
        setSortOption(SORT_OPTIONS.DEFAULT); // Optionally reset sort when category changes
    };

    // --- Render Sort Button Helper ---
    const renderSortButton = (optionKey, optionText) => (
        <TouchableOpacity
            key={optionKey}
            style={[styles.sortButton, sortOption === optionText && styles.sortButtonActive]}
            onPress={() => {
                console.log("Setting sort option:", optionText);
                setSortOption(optionText);
            }}
        >
            <Text style={[styles.sortButtonText, sortOption === optionText && styles.sortButtonTextActive]}>
                {/* Show shorter text like 'Low to High' */}
                {optionText.split(': ')[1] ?? optionText}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* --- Header (remains the same) --- */}
            <LinearGradient
                colors={['#E50914', '#C70039']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerContainer}
            >
                <View style={styles.topRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search products..."
                            placeholderTextColor="#555"
                            value={searchQuery}
                            onChangeText={setSearchQuery} // Filters happen automatically via useMemo
                            onSubmitEditing={handleSearch} // Optional: Trigger navigation or specific action
                            returnKeyType="search"
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

            {/* --- Category Title & Product Count --- */}
                            <View style={styles.allProducttitleBar}>
                                 <Text style={styles.allProductTitleText}>All Product</Text>
                                 
                                 
                            </View>
            {/* Consider adding an "All" button */}
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContainer}>
                 <CategoryList
                    name="All"
                    onPress={() => handleCategorySelect(null)} // Select 'All' categories
                    style={selectedCategory === null ? styles.selectedCategory : null} // Highlight when 'All' is selected
                 />
                {categoryNames.map((name, index) => (
                    <CategoryList
                        key={index}
                        name={name}
                        onPress={() => handleCategorySelect(name)} // Handle category selection
                        style={selectedCategory === name ? styles.selectedCategory : null} // Highlight selected category
                    />
                ))}
            </ScrollView>

            {/* --- NEW: Sorting Options --- */}
            {/* Only show sorting if there are products in the filtered list */}
            {filteredProducts.length > 0 && (
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
            

            {/* --- Product List / Not Found Message --- */}
            {/* Use sortedAndFilteredProducts for the list */}
            {sortedAndFilteredProducts.length === 0 ? (
                <View style={styles.notFoundContainer}>
                    <Icon name={searchQuery.length > 0 || selectedCategory ? "magnify-close" : "tag-off-outline"} size={60} color="#ccc" />
                    <Text style={styles.notFoundText}>
                         {searchQuery.length > 0 || selectedCategory
                            ? `No products found ${selectedCategory ? `in ${selectedCategory}` : ''} ${searchQuery ? `matching "${searchQuery}"` : ''}`
                            : "No products available." // Generic message if no filters applied and still no products
                         }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sortedAndFilteredProducts} // *** Use the sorted and filtered list ***
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ProductCard product={item} />} // Render using ProductCard
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    // Optimization: Prevent unnecessary re-renders if item data hasn't changed deeply
                    // extraData={sortOption} // Add state that affects rendering but isn't in `data`
                />
            )}
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8', // Changed background slightly
    },
    headerContainer: {
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: 20,
        // marginBottom: 10, // Remove margin, handle spacing below
        paddingHorizontal: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
         marginRight: 10, // Add some margin
         padding: 5, // Make touchable area slightly larger
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        flex: 1,
        paddingHorizontal: 15,
        height: 40,
        elevation: 2, // Subtle shadow for search bar
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0, // Ensure text is centered vertically
        marginRight: 5,
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        color: '#333',
    },
    CartIcon: {
        marginLeft: 10, // Adjusted margin
        padding: 5,
    },
    cartIconContainer: {
        position: 'relative',
        // padding: 5, // Already handled by CartIcon padding
    },
    cartCount: {
        position: 'absolute',
        top: -5, // Adjust position
        right: -7, // Adjust position
        backgroundColor: '#fff',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5, // Make border slightly thicker
        borderColor: '#E50914',
    },
    cartCountText: {
        fontSize: 9, // Slightly smaller text
        color: '#E50914',
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        fontWeight: 'bold',
    },

    allProducttitleBar: {
      flexDirection: 'row',
      alignItems: 'baseline', // Align text baselines
      justifyContent: 'space-between', // Push count to the right
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 5, // Less padding below title before sort options
  },
  allProductTitleText: {
      fontSize: 24, // Slightly larger title
      fontFamily: 'Poppins-Bold',
      color: '#1c1c1c',
      fontWeight: 'bold',
       flexShrink: 1, // Allow title to shrink if needed
       marginRight: 8, // Space between title and count
  },
    // --- Category Styles ---
     categoryScrollContainer: {
        paddingVertical: 12, // Add vertical padding
        paddingHorizontal: 16, // Add horizontal padding
        // backgroundColor: '#fff', // Optional: Add a background if needed
        // borderBottomWidth: 1, // Optional: Separator line
        // borderBottomColor: '#eee',
    },
     selectedCategory: { // Style to highlight the selected CategoryList item
        backgroundColor: '#FFE5E8', // Example highlight color
        borderColor: '#FAD1D5',     // Example border color
    },
    // --- Sort Option Styles (Copied and adapted from CategoryProductScreen) ---
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
        backgroundColor: '#FFE5E8', // Theme accent color
        borderColor: '#FAD1D5', // Theme color border
    },
    sortButtonText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        color: '#555',
    },
    sortButtonTextActive: {
        fontFamily: 'Poppins-Medium', // Ensure font is loaded
        color: '#C70039', // Darker theme color text
    },
    // --- Product List Styles ---
    list: {
        paddingHorizontal: 12, // Adjust horizontal padding for cards
        paddingTop: 5, // Add a little space above the list
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12, // Adjust spacing between rows
    },
    // --- Not Found Styles ---
    notFoundContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30, // More padding
        marginTop: -60, // Adjust position if header/sort takes space
    },
    notFoundText: {
        fontSize: 16,
        color: '#888', // Slightly darker grey
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        marginTop: 15,
        textAlign: 'center',
        lineHeight: 22, // Improve readability
    },
});

export default Product;