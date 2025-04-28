import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartContext } from '../context/CartContext';

const ProductDetails = ({ route }) => {
    const navigation = useNavigation();
    const { product } = route.params;
    const { addToCart } = useContext(CartContext);
    const { cartItems } = useContext(CartContext);

    // Format price with commas for thousands
    const formattedPrice = parseFloat(product.price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

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
        <View style={styles.container}>
            {/* Top Navigation */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#E50914" />
                </TouchableOpacity>

                <Text style={styles.title}>{product.name}</Text>

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

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#E50914']}
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
                    <Text style={styles.price}>{formattedPrice}</Text>

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

            {/* Buttons */}
            <View style={styles.buttonContainer}>
            <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={() => navigation.navigate('ProceedCheckout')} // Navigate to ProceedCheckout screen
                >
                
                    <Text style={styles.proceedText}>Buy Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => addToCart(product)} // Add product to cart
                >
                    <Icon name="cart-plus" size={18} color="#ffffff" />
                </TouchableOpacity>

               
            </View>
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
    title: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold",
        textAlign: "center",
        color: "#333",
        flex: 1,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 10,
        justifyContent: 'center',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
    },
    cartButton: {
        backgroundColor: '#E50914',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 5,
        marginLeft: 10,
    },
    proceedButton: {
        backgroundColor: '#333',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        elevation: 5,
        flex: 1,
        
    },
    proceedText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        color: '#ffffff',
        marginLeft: 10,
    },
});

export default ProductDetails;
