import React, { useState, useContext } from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, FlatList  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartContext } from '../context/CartContext'; // Import CartContext


const ProductDetails = ({ route, navigation }) => {
    const { product } = route.params;
    const { addToCart } = useContext(CartContext); // Get addToCart function from context
    const { cartItems } = useContext(CartContext); // Access cartItems from CartContext

    // Get images from the product object
  const productImages = product.images || [product.image];

    const [activeIndex, setActiveIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    
    
      const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      };
    

    return (
        <View style={styles.container} >
          {/* Top Navigation */}
          <View style={styles.header} >
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E50914" />
                  </TouchableOpacity>

                  <Text style={styles.title}>{product.name}</Text>

                  <TouchableOpacity style={styles.CartIcon} onPress={() => navigation.navigate('Cart')}>
                              <View style={styles.cartIconContainer}>
                                <Icon name="cart-outline" size={24} color="#000" />
                                {/* Show the cart count only if there are items */}
                                {cartItems.length > 0 && (
                                  <View style={styles.cartCount}>
                                    <Text style={styles.cartCountText}>{cartItems.length}</Text>  {/* Ensure it's wrapped in <Text> */}
                                  </View>
                                )}
                              </View>
                  </TouchableOpacity>
            </View>
    
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} 
           refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E50914']}  // Set the color of the spinner
            />
          }>
            {/* Product Image Carousel */}
            <View style={styles.imageContainer}>
              <FlatList
                data={productImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                onScroll={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
                  );
                  setActiveIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.image} />
                )}
              />
              {/* Pagination Dots */}
              <View style={styles.dotsContainer}>
                {productImages.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.dot, activeIndex === index && styles.activeDot]}
                  />
                ))}
              </View>
            </View>
    
            {/* Product Info */}
            <View style={styles.detailsContainer}>
              <Text style={styles.name}>{product.name}</Text>
    
              {/* Ratings & Reviews */}
              <View style={styles.ratingContainer}>
              <Text style={styles.rating}>
                <Icon name="star" size={16} color="gold" /> {product.rate}
              </Text>
              <Text style={styles.reviews}>{product.review} reviews</Text>
              <Text style={styles.percent}>
                <Icon name="thumb-up" size={16} color="green" /> {product.percent} %
              </Text>
              <Text style={styles.comment}>
                <Icon name="comment-text-outline" size={16} color="black" /> 
              </Text>
              </View>
    
              {/* Price */}
              <Text style={styles.price}>₱{product.price}</Text>
              
                
              {/* Description */}
              <Text style={styles.description} numberOfLines={3}>
                {product.description} <Text style={styles.readMore}>Read more</Text>
              </Text>


             {/* Stock Availability */}
                <View style={styles.stockContainer}>
                    <Icon 
                    name="package-variant" 
                    size={16} 
                    color={product.stock > 3 ? "green" : product.stock > 0 ? "yellow" : "red"} 
                    />
                    <Text style={[styles.stock, { color: product.stock > 3 ? "green" : product.stock > 0 ? "orange" : "red" }]}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </Text>
                </View>

            </View>
          </ScrollView>
    
           {/* Sticky Add to Cart Button */}
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => addToCart(product)} // Add product to cart
            >
              <Text style={styles.cartText}>Add to cart</Text>
            </TouchableOpacity>
        </View>
      );
    };
  
  const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 30,
        backgroundColor: '#ffffff',
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      },
      backButton: {
        padding: 5,
      },
      CartIcon: {
        marginLeft: 5,
      },
      cartIconContainer: {
        position: 'relative',  // For positioning the count over the icon
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
      title: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        textAlign: "center",
        color: "#333",
        flex: 1,
      },
      imageContainer: {
        alignItems: 'center',
        marginVertical: 10, // Vertical margin between image containers
        marginHorizontal: 10, // Optional: Horizontal margin for gap between containers
        justifyContent: 'center', // Align items to center
    },
    
    image: {
        width: 320,
        height: 350,
        resizeMode: 'cover',
        
    },
    
      dotsContainer: {
        flexDirection: 'row',
        marginTop: 5,
      },
      dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E50914',
        marginHorizontal: 3,
      },
      activeDot: {
        backgroundColor: '#000',
      },
      detailsContainer: {
        padding: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      },
      name: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#333',
      },
      ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
      },
      rating: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        marginRight: 8,
      },
      reviews: {
        fontSize: 12,
        color: 'gray',
        marginRight: 10,
        fontFamily: 'Poppins-Regular',
      },
      percent: {
        fontSize: 12,
        color: 'green',
        marginRight: 5,
        fontFamily: 'Poppins-SemiBold',
      },
      comment: {
        fontSize: 12,
        color: 'gray',
        marginRight: 10,
        fontFamily: 'Poppins-Regular',
      },
      price: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#E50914',
        marginTop: 10,
      },
      
      description: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        
      },
      stockContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        },
        stock: {
        fontSize: 14,
        color: "gray",
        marginLeft: 5,
        },
      readMore: {
        fontSize: 14,
        color: '#E50914',
        fontFamily: 'Poppins-SemiBold',
      },
      cartButton: {
        position: 'absolute', // Para naka-sticky sa ibaba
        bottom: 20, // Distansya mula sa ibaba ng screen
        left: 10, // Distansya mula sa kaliwa
        right: 10, // Distansya mula sa kanan
        backgroundColor: '#E50914',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12, // Mas consistent spacing
        borderRadius: 10,
        elevation: 5, // Para may shadow effect (Android)
        shadowColor: '#000', // Shadow para sa iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      CartIcon: {
        marginLeft: 10,
      },
      cartText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#ffffff',
        textAlign: 'center',
      },
  });

export default ProductDetails;
