import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Importing MaterialCommunityIcons
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';

const AllProducts = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Hook for navigation
  const { query } = route.params; // Get the search query passed from the Home screen
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filterProducts = () => {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
      setLoading(false);
    };

    filterProducts();
  }, [query]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#E50914" /> {/* MaterialCommunityIcons arrow-left */}
      </TouchableOpacity>
      <Text style={styles.title}>Search Results for "{query}"</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  notFound: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 10,
    marginTop: 20,
    marginBottom: 20,
  },
});

export default AllProducts;
