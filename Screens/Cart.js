import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native'; // Added Alert, Platform
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font'; // Keep if fonts are used
import { CartContext } from '../context/CartContext'; // <-- VERIFY PATH

const Cart = ({ navigation }) => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);
  const [fontsLoaded, setFontsLoaded] = useState(true); // Assume loaded or remove if not using Font hook here
  const [selectedItems, setSelectedItems] = useState([]); // State for selected item IDs

  // Font loading useEffect can be removed if fonts are loaded globally or not used here

  // Price formatting
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₱ N/A'; // Handle invalid price
    return numPrice.toLocaleString('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate total based on selected items
  const calculateTotal = () => {
    const total = cartItems
      .filter(item => selectedItems.includes(item.id)) // Filter by selected IDs
      .reduce((sum, item) => {
          const price = parseFloat(item.price);
          const quantity = item.quantity || 1; // Default quantity to 1 if missing
          return sum + (isNaN(price) ? 0 : price * quantity); // Multiply by quantity
      }, 0);
    return formatPrice(total); // Format the final sum
  };

  // Toggle individual item selection
  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Check if an item is selected
  const isSelected = (id) => selectedItems.includes(id);

  // Check if all items are selected
  const areAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  // Toggle select all items
  const toggleSelectAll = () => {
    if (areAllSelected) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems(cartItems.map(item => item.id)); // Select all
    }
  };

  // Handle navigating to checkout with selected items
  const handleCheckoutSelected = () => {
    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
    if (itemsToCheckout.length === 0) {
      Alert.alert("No Items Selected", "Please select items to checkout.");
      return;
    }
    navigation.navigate('Checkout', { itemsToCheckout: itemsToCheckout });
  };

  // Optional: Confirm before removing item
  const confirmRemoveItem = (item) => {
      Alert.alert(
          "Remove Item",
          `Are you sure you want to remove "${item.name}" from your cart?`,
          [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", onPress: () => removeFromCart(item.id), style: "destructive" }
          ]
      );
  }


  // Font loading check (keep if using Font hook)
  // if (!fontsLoaded) { /* ... loading indicator ... */ }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Cart ({cartItems.length})</Text>
        <View style={{ width: 30 }} /> {/* Adjust spacer width */}
      </View>

      {/* Empty Cart View */}
      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Icon name="cart-outline" size={80} color="#e0e0e0" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Cart List and Footer
        <>
          {/* Select All */}
          <View style={styles.selectAllContainer}>
            <CustomCheckBox isChecked={areAllSelected} onToggle={toggleSelectAll} />
            <Text style={styles.selectAllText}>Select All ({selectedItems.length}/{cartItems.length})</Text>
            {/* Optional: Add delete selected button? */}
          </View>

          {/* Cart Items List */}
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `${item.id}`} // Ensure key is a string
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            renderItem={({ item }) => (
              // Cart Item Row
              <View style={styles.cartItem}>
                {/* Checkbox */}
                <View style={styles.checkboxContainer}>
                  <CustomCheckBox isChecked={isSelected(item.id)} onToggle={() => toggleSelection(item.id)} />
                </View>
                {/* Image */}
                <Image
                    source={{ uri: item.images && item.images[0] ? item.images[0] : undefined }}
                    style={styles.cartItemImage}
                    defaultSource={require('../assets/PRLOGO-mobileapp.png')} // <-- VERIFY PATH
                />
                {/* Details */}
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
                  {/* Quantity Control */}
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        onPress={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1} // Disable minus if quantity is 1
                        style={styles.quantityButton}
                    >
                      <Icon name="minus" size={20} color={item.quantity <= 1 ? "#ccc" : "#E50914"} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        onPress={() => increaseQuantity(item.id)}
                        style={styles.quantityButton}
                    >
                      <Icon name="plus" size={20} color="#E50914" />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Remove Button */}
                <TouchableOpacity onPress={() => confirmRemoveItem(item)} style={styles.removeButton}>
                  <Icon name="delete-outline" size={24} color="#a0a0a0" />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Footer: Total and Checkout Button */}
          <View style={styles.footerContainer}>
            <View style={styles.totalTextContainer}>
                <Text style={styles.totalLabelText}>Total (Selected):</Text>
                <Text style={styles.totalAmountText}>{calculateTotal()}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCheckoutSelected} // Use the correct handler
              style={[styles.checkoutButton, selectedItems.length === 0 && styles.disabledButton]} // Apply disabled style
              disabled={selectedItems.length === 0} // Disable button logically
            >
              <Text style={styles.checkoutText}>Checkout ({selectedItems.length})</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// --- Custom CheckBox Component (Keep as is or refine style) ---
const CustomCheckBox = ({ isChecked, onToggle }) => (
    <TouchableOpacity onPress={onToggle} style={styles.checkboxTap}>
        <View style={[styles.checkboxBase, isChecked && styles.checkboxCheckedStyle]}>
            {isChecked && <Icon name="check-bold" size={14} color="#fff" />}
        </View>
    </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Lighter background
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: { padding: 5 },
    title: {
        textAlign: 'center',
        fontSize: 20, // Slightly smaller title
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        flex: 1,
        marginHorizontal: 10,
    },
    // Empty Cart
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCartText: {
        fontSize: 18,
        color: '#888', // Lighter text
        marginVertical: 15,
        fontFamily: 'Poppins-Medium',
    },
    shopButton: {
        backgroundColor: '#E50914',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    shopButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
    },
    // Select All Bar
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff', // White background for this bar
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 5, // Space below select all
    },
    selectAllText: {
        marginLeft: 10,
        fontFamily: 'Poppins-Regular', // Regular weight
        fontSize: 15,
        color: '#444',
    },
    // List Container
     listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 150, // Ensure space below list for footer
    },
    // Cart Item Row
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 10, // Space between items
        borderRadius: 8,
        padding: 10,
        alignItems: 'center', // Vertically align items in the row
        borderWidth: 1,
        borderColor: '#eee',
    },
    checkboxContainer: {
        // Removed fixed height, align self center if needed
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8, // Space between checkbox and image
        alignSelf: 'center', // Align checkbox vertically center
    },
     checkboxTap: { padding: 5 }, // Increase tap area
     checkboxBase: { // Base style for the checkbox square/circle
        width: 22,
        height: 22,
        borderRadius: 4, // Slightly rounded square
        borderWidth: 1.5,
        borderColor: '#bbb', // Grey border
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxCheckedStyle: { // Style when checked
        backgroundColor: '#E50914',
        borderColor: '#E50914',
    },
    cartItemImage: {
        width: 70, // Slightly smaller image
        height: 70,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
    },
    cartItemDetails: {
        flex: 1, // Allow details to take remaining space
        marginLeft: 12,
        justifyContent: 'space-between', // Distribute content vertically
    },
    cartItemName: {
        fontSize: 15, // Slightly smaller name
        fontFamily: 'Poppins-Medium', // Medium weight
        color: '#333',
        marginBottom: 4,
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#E50914',
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8, // Space below price
    },
    // Quantity Controls
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // Removed marginTop, adjusted in details container
    },
    quantityButton: {
        padding: 4, // Tap area for buttons
    },
    quantityText: {
        fontSize: 15,
        fontFamily: 'Poppins-Medium',
        minWidth: 30, // Ensure space for number
        textAlign: 'center',
        marginHorizontal: 8, // Space around number
        paddingVertical: 2, // Add some vertical padding if needed
        // borderWidth: 1, // Optional border around quantity
        // borderColor: '#ddd',
        // borderRadius: 4,
    },
    // Remove Button
    removeButton: {
        paddingLeft: 10, // Space from details
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center', // Align button vertically center
    },
    // Footer
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row', // Arrange total and button side-by-side
        justifyContent: 'space-between', // Space them out
        alignItems: 'center', // Align vertically center
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 5, // Add shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
     totalTextContainer: {
        flexDirection: 'column', // Stack label and amount
        alignItems: 'flex-start', // Align text to the left
    },
    totalLabelText: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        marginBottom: 1, // Small space between label and amount
    },
    totalAmountText: {
        fontSize: 18, // Larger total amount
        color: '#E50914',
        fontFamily: 'Poppins-Bold',
    },
    checkoutButton: {
        backgroundColor: '#E50914',
        paddingVertical: 10, // Slightly smaller button vertically
        paddingHorizontal: 25, // Wider button horizontally
        borderRadius: 8,
        // Removed width: '100%', adjusted flex layout
    },
     disabledButton: { // Style for disabled button
        backgroundColor: '#fd9fa3', // Lighter/greyed out color
        opacity: 0.7,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 15, // Slightly smaller checkout text
        fontFamily: 'Poppins-Bold',
    },
    // Loading styles
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadingText: { marginTop: 10, fontSize: 16, fontFamily: 'Poppins-Regular', color: '#444' },
});

export default Cart;