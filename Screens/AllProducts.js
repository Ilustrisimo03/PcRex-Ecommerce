import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  FlatList, // Changed from ScrollView to FlatList for better performance
  Dimensions, // Added Dimensions
  Platform, // Added Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// --- CHANGE 1: Import structured data ---
import productsData from '../Screens/Products.json';
// Assuming ProductList might not be needed if we use FlatList directly here
// import ProductList from '../Components/ProductList';
import ProductCard from '../Components/ProductCard'; // Import ProductCard instead
import { CartContext } from '../context/CartContext';

// --- CHANGE 2: Flatten the data ---
const allProductsFlat = Object.values(productsData).flat();
// --- End Change ---

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Match CARD_WIDTH from other screens

const AllProducts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { cartItems } = useContext(CartContext);

  const initialQuery = route.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Keep loading state

  // Use useEffect to filter whenever searchQuery changes or on initial load
  useEffect(() => {
    filterProducts(searchQuery);
  }, [searchQuery]); // Re-filter when searchQuery changes

  const filterProducts = (query) => {
    setLoading(true); // Show loading indicator during filtering
    // --- CHANGE 3: Filter the flattened data ---
    const lowerCaseQuery = query.toLowerCase();
    const filtered = allProductsFlat.filter((product) =>
      product.name.toLowerCase().includes(lowerCaseQuery)
      // Optional: Add description search
      // || product.description.toLowerCase().includes(lowerCaseQuery)
      // Optional: Add category search (though less relevant here)
      // || product.category.name.toLowerCase().includes(lowerCaseQuery)
    );
    // --- End Change ---
    setFilteredProducts(filtered);
    setLoading(false); // Hide loading indicator
  };

  // This function is triggered by the search icon press, it ensures filtering happens
  // even if the text input's onChangeText hasn't fired the useEffect yet (less common now)
  // or if the user wants to explicitly trigger a search (e.g., after pressing enter - needs onSubmitEditing on TextInput)
  const handleSearch = () => {
    filterProducts(searchQuery);
  };

  // Render item function for FlatList
  const renderItem = ({ item }) => (
    <ProductCard
        product={item}
        onPress={() => navigation.navigate("ProductDetails", { product: item })}
        isGridView={true} // Assuming grid view for search results
        // Pass other necessary props to ProductCard
      />
  );


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        {/* Cart Button */}
        <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartIconContainer}>
            <Icon name="cart-outline" size={28} color="#333" />
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
         <Icon name="magnify" size={22} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search all products..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery} // Live filtering via useEffect
          onSubmitEditing={handleSearch} // Allow searching via keyboard submit
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Icon name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

       {/* Display search term or results count */}
       {!loading && (
         <Text style={styles.resultsInfoText}>
           {searchQuery ? `Results for "${searchQuery}"` : 'Showing all products'}
           {filteredProducts.length > 0 ? ` (${filteredProducts.length})` : ''}
         </Text>
       )}


      {/* Use FlatList for rendering results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyStateContainer}>
            <Icon name="magnify-close" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No products found for "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2} // Use 2 columns for grid view
          columnWrapperStyle={styles.row} // Style for spacing columns
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default AllProducts;

// --- Styles adapted from previous examples for consistency ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? 30 : 40,
  },
  header: { // Consistent header style
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: { // Added specific title style
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  cartIcon: { // Consistent cart icon style
    padding: 5,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartCount: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#E50914',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  searchContainer: { // Consistent search container style
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
    height: 45,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  clearIcon: {
    marginLeft: 8,
    padding: 5,
  },
  resultsInfoText: { // Style for the text showing search query/results count
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  loadingContainer: { // Consistent loading style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // Add some padding if header is hidden
  },
  emptyStateContainer: { // Consistent empty state style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50, // Adjust margin
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  listContent: { // Padding for FlatList content
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: { // Style for grid columns
    justifyContent: "space-between",
    marginBottom: 16, // Add space between rows
  },
});