import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();

  // Format the price with commas as thousands separators
  const formattedPrice = parseFloat(product.price).toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetails', { product })}>
      
      <Image source={{ uri: product.images[0] }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formattedPrice}</Text>
      <Text style={styles.rating}>Rating: {product.rate}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {product.description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 8,
    marginRight: 10,
    borderRadius: 5,
    width: '48%',
    borderWidth: 1, // Optional: add a border around the card
    borderColor: '#CCCCCC', // Light border color for subtle separation 
  },
  image: {
    width: '100%',
    height: 120, // Adjusted height for a better image view
    borderRadius: 5,
    marginBottom: 5, // Spacing below the image
  },
  name: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    marginTop: 5,
    color: '#333',
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
  },
});

export default ProductCard;
