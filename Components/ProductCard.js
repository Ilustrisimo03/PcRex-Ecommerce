
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';


// Static image mapping
const imageMap = {
    'PCREX1.png': require('../assets/PCREX1.png'),
    // You can add other image mappings here if needed
  };

const ProductCard = ({ product }) => {
   // Get the image source using the static image map
   const imageSource = imageMap[product.image];

  return (
    <View style={styles.card}>
       {/* Check if image is available */}
      {imageSource ? (
        <Image source={imageSource} style={styles.image} />
      ) : (
        <Text>Image not available</Text>
      )}
      
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.rating}>Rating: {product.rate}</Text>
       {/* Description with limit of 2 lines and ellipsis */}
       <Text style={styles.description} numberOfLines={2}>
        {product.description}
      </Text>
    </View>
  );
};



const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F5F5F5',
        padding: 8,
        marginBottom: 20,
        borderRadius: 15,
        // elevation: 5,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 }, // Balanced shadow spread
        // shadowOpacity: 0.55, // Softer shadow visibility
        width: '48%', 
        marginBottom: 15,
        marginHorizontal: '1%', // Space between the columns
       
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
