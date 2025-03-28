
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductDetails', { product })}>
      <Image source={{ uri: product.images[0]}} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
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
        borderRadius: 15,
       // **Balanced Shadow**
      // shadowColor: '#000',
      // shadowOffset: { width: 0, height: 0 }, // Even shadow on all sides
      // shadowOpacity: 0.25, // Adjusted for softer look
      // shadowRadius: 8, // Creates a more natural blur
      // elevation: 5, // Ensures shadow on Android
      elevation: 2, // Para may shadow effect (Android)
        shadowColor: '#000', // Shadow para sa iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        width: '48%', 
      },
      image: {
        width: '100%',
        height: 120, // Adjusted height for a better image view
        borderRadius: 12,
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
