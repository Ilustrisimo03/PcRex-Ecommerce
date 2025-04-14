import React, { useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Products from '../Screens/Products.json';
import { useNavigation } from '@react-navigation/native';
import { CartContext } from '../context/CartContext'; // Import CartContext

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // spacing + 2 cards

const Product = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { cartItems } = useContext(CartContext); // Access cart items


  // Navigate to the SearchResults screen
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('AllProducts', { query: searchQuery });
    }
  };


  // Filter products by search query
  const filteredProducts = Products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.price}>₱{item.price}</Text>
      <Text style={styles.rating}>Rating: {item.rate}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E50914" />
        </TouchableOpacity>
        <Text style={styles.title}>All Products</Text>
        <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartIconContainer}>
            <Icon name="cart-outline" size={24} color="#000" />
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
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                placeholderTextColor="#000"
                value={searchQuery}
                onChangeText={setSearchQuery} // Update search query
              />
              <TouchableOpacity onPress={handleSearch}>
                <Icon name="magnify" size={24} color="#E50914" />
              </TouchableOpacity>
            </View>
      

      {/* Conditional rendering for no search results */}
      {filteredProducts.length === 0 ? (
        <View style={styles.notFoundContainer}>
          <Icon name="close-circle-outline" size={48} color="#E50914" />
          <Text style={styles.notFoundText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Product;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Added this line to space out the elements
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  CartIcon: {
    marginLeft: 5,
  },
  cartIconContainer: {
    position: 'relative',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlignVertical: 'center',
    height: 35,
    paddingVertical: 0,
  },
  filterIcon: {
    marginLeft: 8,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    color: '#E50914',
    fontFamily: 'Poppins-Medium',
  },
  rating: {
    fontSize: 11,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  description: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 2,
  },
  notFoundContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  notFoundText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Poppins-Medium',
    marginTop: 10,
  },
});
