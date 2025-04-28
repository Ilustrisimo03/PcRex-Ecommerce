import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';
import { CartContext } from '../context/CartContext'; // Import CartContext

const AllProducts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { cartItems } = useContext(CartContext); // Access cart items

  const initialQuery = route.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filterProducts(searchQuery);
  }, []);

  const filterProducts = (query) => {
    setLoading(true);
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
    setLoading(false);
  };

  const handleSearch = () => {
    filterProducts(searchQuery);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E50914" />
        </TouchableOpacity>

        {/* Cart Button */}
            <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
              <View style={styles.cartIconContainer}>
                <Icon name="cart-outline" size={28} color="#000" />
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
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Icon name="magnify" size={24} color="#E50914" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Search Results for "{searchQuery}"</Text>

      <ScrollView>
        {filteredProducts.length === 0 ? (
          <Text style={styles.notFound}>No products found</Text>
        ) : (
          <ProductList products={filteredProducts} />
        )}
      </ScrollView>
    </View>
  );
};

export default AllProducts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: 35,
    paddingVertical: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  notFound: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#E50914',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cartCountText: {
    fontSize: 10,
    color: '#ffff',
    fontWeight: 'bold',
  },
});
