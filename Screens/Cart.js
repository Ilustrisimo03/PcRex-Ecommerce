import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import { CartContext } from '../context/CartContext'; // Ensure your context is properly set

const Cart = ({ navigation }) => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);
  
  

  // Function to calculate the total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0).toFixed(2);
  };

   const [fontsLoaded, setFontsLoaded] = useState(false);
  
    // Load custom font
    useEffect(() => {
      const loadFonts = async () => {
        await Font.loadAsync({
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
        });
        setFontsLoaded(true);
      };
  
      loadFonts().catch(() => setFontsLoaded(false));
    }, []);
  
    if (!fontsLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Loading</Text>
        </View>
      );
    }
  return (
    <View style={styles.container}>
       <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#E50914" />
      </TouchableOpacity>
      <Text style={styles.title}>Your Cart</Text>
    </View>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Icon name="cart-remove" size={80} color="#E50914" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => `${item.id}-${index}`} // Ensuring uniqueness
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                {/* Displaying the first image from the images array */}
                <Image source={{ uri: item.images[0] }} style={styles.cartItemImage} /> 
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>₱{item.price}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity onPress={() => decreaseQuantity(item.id)}>
                      <Icon name="minus-circle" size={24} color="#E50914" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => increaseQuantity(item.id)}>
                      <Icon name="plus-circle" size={24} color="#E50914" />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                  <Icon name="trash-can" size={26} color="#E50914" />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Total and Checkout Button */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ₱{calculateTotal()}</Text>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    width: '100%',  
  },
  title: {
    color: '#000',
    fontSize: 20,
    alignItems: 'center',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    flex: 1, 
  },
  emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCartText: { fontSize: 18, color: '#777', marginVertical: 10,fontFamily: 'Poppins-Bold',  },
  shopButton: { backgroundColor: '#E50914', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  shopButtonText: { color: '#fff', fontFamily: 'Poppins-Bold', },
  cartItem: { flexDirection: 'row', marginBottom: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  cartItemImage: { width: 80, height: 80, borderRadius: 8 },
  cartItemDetails: { flex: 1, marginLeft: 10 },
  cartItemName: { fontSize: 16, fontFamily: 'Poppins-Bold', },
  cartItemPrice: { fontSize: 14, color: '#E50914', marginVertical: 5, fontFamily: 'Poppins-SemiBold',},
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityText: { fontSize: 16, marginHorizontal: 10 },
  removeButton: { justifyContent: 'center', alignItems: 'center' },
  totalContainer: { marginTop: 20, },
  totalText: {fontSize:18, color: '#E50914', fontFamily: 'Poppins-SemiBold',},
  checkoutButton: { backgroundColor: '#E50914', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  checkoutText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold',},
});

export default Cart;
