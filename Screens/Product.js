import React, { useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, TextInput, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext';
import { LinearGradient } from 'expo-linear-gradient';
import ProductCard from '../Components/ProductCard'; // Import ProductCard
import CategoryList from '../Components/CategoryList'; // Import CategoryList

// Import structured data (already flattened in your code)
import productsData from '../Screens/Products.json';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // spacing + 2 cards

const Product = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // New state for selected category
  const { cartItems } = useContext(CartContext);

  // Flatten the products data
  const allProductsFlat = Object.values(productsData).flat();

  // Extract category names from the structured data keys
  const categoryNames = Object.keys(productsData);

  // Filter the data based on the search query and selected category
  const filteredProducts = allProductsFlat.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      // Pass search query to another screen if necessary
      navigation.navigate('AllProducts', { query: searchQuery });
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category); // Toggle category selection
  };

  return (
    <View style={styles.container}>
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
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch} // Trigger search on submit
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

      {/* Categories - Loop through extracted category names */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {categoryNames.map((name, index) => (
          <CategoryList
            key={index}
            name={name}
            onPress={() => handleCategorySelect(name)} // Handle category selection
            style={selectedCategory === name ? styles.selectedCategory : null} // Highlight selected category
          />
        ))}
      </ScrollView>

      {/* Conditional rendering for no search results */}
      {filteredProducts.length === 0 && searchQuery.length > 0 ? (
        <View style={styles.notFoundContainer}>
          <Icon name="magnify-close" size={60} color="#ccc" />
          <Text style={styles.notFoundText}>No products found for "{searchQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts} // Use the dynamically filtered list
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ProductCard product={item} />} // Render using ProductCard
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    marginBottom: 10,
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
  backButton: {
    marginRight: 10, // Add some margin
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    marginRight: 5,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
 
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -50,
  },
  notFoundText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Poppins-Medium',
    marginTop: 15,
    textAlign: 'center',
  },
  
});

export default Product;
