import React, { useContext, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Image, Alert, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useRoute
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartContext } from '../context/CartContext'; // <-- VERIFY PATH

// Placeholder Address Data
const placeholderAddress = {
    name: "Juan Dela Cruz", street: "123 Main Street, Brgy. Sample", city: "Quezon City",
    postalCode: "1101", country: "Philippines", phone: "+63 917 123 4567"
};

const Checkout = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { clearCart } = useContext(CartContext); // Only need clearCart

    const [isLoading, setIsLoading] = useState(false);

    // --- Get Items to Checkout from Route Params ---
    // Default to empty array if params or itemsToCheckout is missing
    const itemsToCheckout = route.params?.itemsToCheckout ?? [];
    // --- ---

    // --- Calculations based on itemsToCheckout ---
    const calculateSubtotal = () => {
        return itemsToCheckout.reduce((sum, item) => {
            const price = parseFloat(item?.price); // Add safe access
            const quantity = item?.quantity || 1; // Default quantity to 1
            return sum + (isNaN(price) ? 0 : price * quantity);
        }, 0);
    };

    const subtotal = calculateSubtotal();
    // Define shipping and tax (can be dynamic later)
    const shippingCost = subtotal > 0 ? 50.00 : 0;
    const taxRate = 0.12; // 12%
    const taxAmount = subtotal * taxRate;
    const total = subtotal + shippingCost + taxAmount;
    const itemCount = itemsToCheckout.reduce((count, item) => count + (item?.quantity || 1), 0);
    // --- ---

    // --- Place Order Handler ---
    const handlePlaceOrder = async () => {
        if (itemsToCheckout.length === 0) {
            Alert.alert("No Items", "There are no items selected for checkout.");
            return;
        }

        setIsLoading(true);
        // Simulate API call
        console.log("--- Placing Order ---");
        console.log("Address:", placeholderAddress);
        console.log("Items:", JSON.stringify(itemsToCheckout, null, 2)); // Pretty print items
        console.log("Subtotal:", subtotal);
        console.log("Shipping:", shippingCost);
        console.log("Tax:", taxAmount);
        console.log("Total:", total);
        console.log("---------------------");

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

        // --- Handle Success ---
        setIsLoading(false);
        Alert.alert( "Order Placed!", "Your order has been successfully placed.",
            [ { text: "OK", onPress: () => {
                    // IMPORTANT: Decide if clearCart (all items) is correct,
                    // or if you need context modification to remove only specific items.
                    // For now, using clearCart for simplicity.
                    clearCart();
                    navigation.navigate('Home'); // Go Home after order
                } } ]
        );
        // --- TODO: Add API Error Handling ---
    };
    // --- ---

    // --- Render Cart Item for Checkout Screen ---
    const renderCheckoutItem = ({ item }) => ( // Renamed function for clarity
        <View style={styles.cartItemContainer}>
            <Image
                source={{ uri: item?.images?.[0] }} // Safe access to image
                style={styles.cartItemImage}
                defaultSource={require('../assets/PRLOGO-mobileapp.png')} // <-- VERIFY PATH
            />
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName} numberOfLines={1}>{item?.name ?? 'Unknown Item'}</Text>
                {/* Display quantity if available (from Cart) */}
                {item?.quantity && (
                    <Text style={styles.cartItemQuantity}>Qty: {item.quantity}</Text>
                )}
                 {/* Display price per item */}
                 <Text style={styles.cartItemPrice}>
                    ₱{parseFloat(item?.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
            </View>
            {/* Display line total (price * quantity) */}
            <Text style={styles.cartItemLineTotal}>
                 ₱{((item?.quantity || 1) * parseFloat(item?.price ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
        </View>
    );
    // --- ---

    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Header (Added for consistency) */}
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Main Scrollable Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>

                {/* Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                        <TouchableOpacity onPress={() => Alert.alert("Edit Address", "Address editing feature coming soon!")}>
                             <Icon name="pencil-outline" size={20} color="#E50914" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressBox}>
                        <Text style={styles.addressTextBold}>{placeholderAddress.name}</Text>
                        <Text style={styles.addressText}>{placeholderAddress.phone}</Text>
                        <Text style={styles.addressText}>{placeholderAddress.street}</Text>
                        <Text style={styles.addressText}>{`${placeholderAddress.city}, ${placeholderAddress.postalCode}`}</Text>
                    </View>
                </View>

                <View style={styles.separatorThin} />

                {/* Order Items Section */}
                <View style={styles.section}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order Items ({itemCount})</Text>
                    </View>
                    {itemsToCheckout.length > 0 ? (
                        <FlatList
                            data={itemsToCheckout} // Use items passed via route
                            renderItem={renderCheckoutItem} // Use the checkout item renderer
                            keyExtractor={(item) => item?.id?.toString() ?? `item-${Math.random()}`} // Safer key
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={styles.emptyCartText}>No items to display for checkout.</Text>
                    )}
                </View>

                <View style={styles.separatorThin} />

                {/* Order Summary Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
                        <Text style={styles.summaryValue}>₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>₱{shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                     <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax ({(taxRate * 100).toFixed(0)}%)</Text>
                        <Text style={styles.summaryValue}>₱{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.separatorBold} />
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Order Total</Text>
                        <Text style={styles.totalValue}>₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, (isLoading || itemsToCheckout.length === 0) && styles.disabledButton]} // Apply disabled style
                    onPress={handlePlaceOrder}
                    disabled={isLoading || itemsToCheckout.length === 0} // Disable logically
                >
                    {isLoading ? ( <ActivityIndicator size="small" color="#ffffff" /> ) : ( <Text style={styles.placeOrderButtonText}>Place Order</Text> )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// --- Styles (Mostly same as before, added header styles) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa', },
    // Header (Copied from Cart)
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', },
    backButton: { padding: 5 },
    title: { textAlign: 'center', fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#333', flex: 1, marginHorizontal: 10, },
    // ---
    scrollView: { flex: 1, },
    scrollViewContent: { paddingBottom: 100, }, // Space for footer
    section: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 15, marginBottom: 8, },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
    sectionTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#343a40', },
    addressBox: { /* Style as needed */ },
    addressText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#495057', marginBottom: 3, lineHeight: 20, },
    addressTextBold: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#343a40', marginBottom: 4, },
    separatorThin: { height: 1, backgroundColor: '#e9ecef', marginVertical: 4, }, // Adjusted margin
    separatorBold: { height: 1.5, backgroundColor: '#dee2e6', marginVertical: 12, }, // Made bolder
    // Cart Item Styles (Checkout version)
    cartItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', },
    cartItemImage: { width: 55, height: 55, borderRadius: 6, marginRight: 12, backgroundColor: '#e9ecef', },
    cartItemDetails: { flex: 1, marginRight: 8, },
    cartItemName: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#343a40', marginBottom: 2, },
    cartItemQuantity: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6c757d', marginTop: 2, },
    cartItemPrice: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6c757d', }, // Price per item
    cartItemLineTotal: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#343a40', textAlign: 'right', }, // Total for the line
    emptyCartText: { textAlign: 'center', fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6c757d', paddingVertical: 20, },
    // Summary Styles
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, },
    summaryLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#495057', },
    summaryValue: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#343a40', },
    totalRow: { marginTop: 8, },
    totalLabel: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#212529', }, // Larger total label
    totalValue: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#E50914', }, // Larger total value
    // Footer Styles
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: Platform.OS === 'ios' ? 20 : 15, paddingHorizontal: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#dee2e6', elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: -2, }, shadowOpacity: 0.1, shadowRadius: 4, },
    placeOrderButton: { backgroundColor: '#E50914', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', height: 50, },
    placeOrderButtonText: { fontSize: 16, color: '#ffffff', fontFamily: 'Poppins-Bold', },
    disabledButton: { backgroundColor: '#fd9fa3', opacity: 0.8 }, // Consistent disabled style
});

export default Checkout;