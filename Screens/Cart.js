import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import { CartContext } from '../context/CartContext';

const Cart = ({ navigation }) => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

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

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
    });
  };

  const calculateTotal = () => {
    const total = cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    return formatPrice(total);
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedItems.includes(id);
  const areAllSelected = selectedItems.length === cartItems.length && cartItems.length > 0;

  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

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
        <View style={{ width: 24 }} /> {/* Empty space for balance */}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Icon name="cart-remove" size={80} color="#E50914" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Product")} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.selectAllContainer}>
            <CustomCheckBox isChecked={areAllSelected} onToggle={toggleSelectAll} />
            <Text style={styles.selectAllText}>Select All</Text>
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => `${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }} // Optional bottom padding
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <View style={styles.checkboxContainer}>
                  <CustomCheckBox
                    isChecked={isSelected(item.id)}
                    onToggle={() => toggleSelection(item.id)}
                  />
                </View>
                <Image source={{ uri: item.images[0] }} style={styles.cartItemImage} />
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
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

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: {calculateTotal()}</Text>
            <TouchableOpacity
              style={[styles.checkoutButton, { opacity: selectedItems.length > 0 ? 1 : 0.5 }]}
              disabled={selectedItems.length === 0}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const CustomCheckBox = ({ isChecked, onToggle }) => (
  <TouchableOpacity onPress={onToggle} style={styles.checkboxTap}>
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked && <Icon name="check" size={16} color="#fff" />}
    </View>
  </TouchableOpacity>
);

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
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCartText: { fontSize: 18, color: '#777', marginVertical: 10, fontFamily: 'Poppins-SemiBold' },
  shopButton: { backgroundColor: '#E50914', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  shopButtonText: { color: '#fff', fontFamily: 'Poppins-Bold' },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectAllText: {
    marginLeft: 10,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333',
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingVertical: 5,
    flex: 1, // Ensure that items can expand and take up space
  },
  cartItemImage: { width: 80, height: 80, borderRadius: 8 },
  cartItemDetails: { flex: 1, marginLeft: 10 },
  cartItemName: { fontSize: 16, fontFamily: 'Poppins-Bold' },
  cartItemPrice: { fontSize: 14, color: '#E50914', marginVertical: 5, fontFamily: 'Poppins-SemiBold' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityText: { fontSize: 16, marginHorizontal: 10 },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    height: '100%',
  },
  checkboxTap: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: '#E50914',
  },
  removeButton: { justifyContent: 'center', alignItems: 'center' },
  totalContainer: { marginTop: 10, alignItems: 'baseline' },
  totalText: { fontSize: 18, color: '#333', fontFamily: 'Poppins-SemiBold' },
  checkoutButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  checkoutText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, fontFamily: 'Poppins-Regular', color: '#444' },
});

export default Cart;
