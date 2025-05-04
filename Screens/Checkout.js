// Screens/Checkout.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Image, Alert, Platform
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext'; // <-- Import useOrders hook
import PlaceholderImage from '../assets/PRLOGO-mobileapp.png'; // <-- VERIFY PATH

// Price formatting utility
const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₱ ---.--';
    return numPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const Checkout = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { clearCart } = useCart(); // Still needed to clear cart after order
    const { currentUser, userProfile, fetchAddresses } = useAuth(); // fetchAddresses still needed for shipping
    const { addOrder } = useOrders(); // <-- Get addOrder function from OrdersContext

    const [shippingAddress, setShippingAddress] = useState(null);
    const [availableAddresses, setAvailableAddresses] = useState([]);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // --- Get Items to Checkout ---
    const itemsToCheckout = useMemo(() => {
        const items = route.params?.itemsToCheckout;
        return Array.isArray(items)
            ? items.filter(item => item && typeof item.id !== 'undefined' && typeof item.price !== 'undefined' && typeof item.quantity === 'number' && item.quantity > 0)
            : [];
    }, [route.params?.itemsToCheckout]);

    // --- Load Addresses (Remains the same) ---
    useEffect(() => {
        // This effect remains unchanged as it fetches addresses, not orders
        let isMounted = true;
        setIsAddressLoading(true);

        const unsubscribe = fetchAddresses((addresses, error) => {
            if (!isMounted) return;

            if (error) {
                console.error("Checkout: Failed to fetch addresses -", error);
                setAvailableAddresses([]);
                setShippingAddress({ id: 'error', name: 'Error Loading Address', street: 'Please try again.' });
            } else {
                setAvailableAddresses(addresses);
                const defaultAddr = addresses.find(addr => addr.isDefault);
                const initialAddr = defaultAddr || (addresses.length > 0 ? addresses[0] : null);

                if (shippingAddress && !addresses.some(a => a.id === shippingAddress.id)) {
                     console.log("Checkout: Previously selected address no longer valid, reverting.");
                     setShippingAddress(initialAddr);
                } else if (!shippingAddress) {
                    setShippingAddress(initialAddr);
                }
                if (addresses.length === 0) {
                    setShippingAddress(null);
                }
            }
            setIsAddressLoading(false);
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [currentUser, fetchAddresses]); // Keep dependencies

    // --- Listen for selected address (Remains the same) ---
     useFocusEffect(
        useCallback(() => {
            if (route.params?.selectedAddress) {
                const newAddress = route.params.selectedAddress;
                if (availableAddresses.some(a => a.id === newAddress.id)) {
                    console.log("Checkout FocusEffect: Setting selected address:", newAddress.id);
                    setShippingAddress(newAddress);
                } else {
                     console.warn("Checkout FocusEffect: Received address is no longer valid.");
                     Alert.alert("Address Error", "The selected address is no longer available. Please choose another.");
                }
                navigation.setParams({ selectedAddress: undefined });
            }
        }, [route.params?.selectedAddress, navigation, availableAddresses])
    );

    // --- Calculations (Remains the same) ---
     const { subtotal, totalQuantity } = useMemo(() => {
        let calculatedSubtotal = 0;
        let calculatedQuantity = 0;
        itemsToCheckout.forEach(item => {
            const price = parseFloat(item?.price ?? 0);
            const quantity = parseInt(item?.quantity ?? 0, 10);
            if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
                calculatedSubtotal += price * quantity;
                calculatedQuantity += quantity;
            }
        });
        return { subtotal: calculatedSubtotal, totalQuantity: calculatedQuantity };
     }, [itemsToCheckout]);

    const shippingCost = useMemo(() => (subtotal > 0 ? 50.00 : 0), [subtotal]);
    const taxRate = 0.12;
    const taxAmount = useMemo(() => subtotal * taxRate, [subtotal]);
    const total = useMemo(() => subtotal + shippingCost + taxAmount, [subtotal, shippingCost, taxAmount]);

    // --- Navigate to Address Selection (Remains the same) ---
    const handleChangeAddress = useCallback(() => {
        if (!currentUser) { Alert.alert("Login Required", "Please log in to manage addresses."); return; }
        navigation.navigate('SavedAddresses', { isSelecting: true, currentAddressId: shippingAddress?.id });
    }, [navigation, currentUser, shippingAddress]);

    // --- Place Order Handler (MODIFIED to use OrdersContext) ---
    const handlePlaceOrder = useCallback(async () => {
        // Validations (Keep these)
        if (itemsToCheckout.length === 0) { Alert.alert("Empty Order", "No valid items to checkout."); return; }
        if (!currentUser) { Alert.alert("Login Required", "Please log in to place an order."); return; }
        if (!shippingAddress || !shippingAddress.id || shippingAddress.id === 'error') {
            Alert.alert("Address Required", "Please select or add a valid shipping address.");
            if (!isAddressLoading && availableAddresses.length === 0) {
                navigation.navigate('AddAddress', { isFromCheckout: true });
            } else {
                handleChangeAddress();
            }
            return;
        }

        setIsPlacingOrder(true);

        // --- Prepare Order Data for Session Storage ---
        const orderData = {
            // Generate a simple unique ID for this session only
            id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: currentUser.uid, // Keep user association if needed
            userName: userProfile?.name || currentUser.displayName || 'Unknown User',
            userEmail: currentUser.email || 'N/A',
            items: itemsToCheckout.map(item => ({
                id: item.id, // Product ID
                name: item.name,
                price: parseFloat(item.price ?? 0),
                quantity: parseInt(item.quantity ?? 0, 10),
                image: (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : null
            })),
            shippingAddress: { ...shippingAddress }, // Copy address details
            summary: {
                subtotal: subtotal,
                shipping: shippingCost,
                tax: taxAmount,
                total: total,
                itemCount: itemsToCheckout.length,
                totalQuantity: totalQuantity,
            },
            status: 'Pending', // Default status for session order
            paymentMethod: 'Cash on Delivery',
            orderDate: new Date().toISOString(), // Timestamp for when it was placed
        };

        console.log("--- Placing Order (Session Storage) ---");
        console.log(`Generated Order ID (Session): ${orderData.id}`);
        console.log("--------------------------------------");

        // Simulate a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // --- Add the order to the OrdersContext ---
            addOrder(orderData); // <--- Core change: Add to context

            // --- Clear relevant cart items ---
            // If itemsToCheckout comes directly from cart, clearCart is fine.
            // If it's a selection, you might need more specific logic here.
            clearCart();

            setIsPlacingOrder(false); // Update state before showing alert

            // --- Success feedback ---
            Alert.alert(
                "Order Placed (Session)",
                "Your order has been recorded for this session. View it in Order History.",
                [{
                    text: "View Orders",
                    onPress: () => {
                        console.log("Checkout: Navigating to Order History.");
                        // Navigate and reset stack, showing OrderHistory within HomeTabs
                         navigation.reset({
                             index: 0,
                             routes: [{ name: 'HomeTabs', params: { screen: 'OrderHistory' } }],
                         });
                         // Adjust 'HomeTabs' and 'OrderHistory' if your navigator names differ
                    }
                }],
                { cancelable: false }
            );

        } catch (error) {
            // Catch potential errors during addOrder or clearCart (less likely)
            console.error("Checkout: Error processing order for session.", error);
            Alert.alert("Order Processing Failed", "Something went wrong while recording your order. Please try again.");
            setIsPlacingOrder(false); // Ensure loading state is reset on error
        }

    }, [
        itemsToCheckout, shippingAddress, currentUser, userProfile, subtotal, shippingCost,
        taxAmount, total, totalQuantity, clearCart, navigation, handleChangeAddress,
        addOrder, // <-- Add context function to dependencies
        availableAddresses, isAddressLoading // <-- Keep other relevant dependencies
    ]);

    // --- Render Cart Item (Remains the same) ---
    const renderCheckoutItem = useCallback(({ item }) => {
        if (!item || typeof item.id === 'undefined') return null;
        const lineTotal = (item.quantity || 1) * parseFloat(item.price ?? 0);
        const imageUrl = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;

        return (
           <View style={styles.cartItemContainer}>
               <Image
                   source={imageUrl ? { uri: imageUrl } : PlaceholderImage}
                   style={styles.cartItemImage}
                   defaultSource={PlaceholderImage} // Fallback for network images
                />
               <View style={styles.cartItemDetails}>
                   <Text style={styles.cartItemName} numberOfLines={1}>{item.name || 'Unknown Item'}</Text>
                   <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
                   <Text style={styles.cartItemQuantity}>Quantity: {item.quantity || 1}</Text>
               </View>
               <Text style={styles.cartItemLineTotal}>{formatPrice(lineTotal)}</Text>
           </View>
        );
    }, []);

    // --- Render Address Section (Remains the same) ---
    const renderAddressSection = () => {
        if (isAddressLoading) {
            return (
                <View style={[styles.addressBox, styles.addressLoadingBox]}>
                    <ActivityIndicator size="small" color="#E50914" />
                    <Text style={styles.loadingAddressText}>Loading addresses...</Text>
                </View>
            );
        }
        if (shippingAddress?.id === 'error') {
             return (
                 <TouchableOpacity style={styles.addressBox} onPress={handleChangeAddress} disabled={isPlacingOrder}>
                    <Icon name="alert-circle-outline" size={20} color="#E50914" style={{ marginRight: 8 }}/>
                    <Text style={styles.noAddressText}>Error loading address. Tap to retry.</Text>
                 </TouchableOpacity>
             );
        }
        if (!shippingAddress) {
             const actionText = availableAddresses.length > 0 ? "Tap here to select address" : "Tap here to add address";
             const actionTarget = availableAddresses.length > 0 ? handleChangeAddress : () => navigation.navigate('AddAddress', { isFromCheckout: true });
             return (
                 <TouchableOpacity style={styles.addressBox} onPress={actionTarget} disabled={isPlacingOrder}>
                     <Icon name="map-marker-alert-outline" size={20} color="#E50914" style={{ marginRight: 8 }}/>
                     <View>
                        <Text style={styles.noAddressText}>No shipping address selected.</Text>
                        <Text style={styles.addAddressLink}>{actionText}</Text>
                     </View>
                 </TouchableOpacity>
            );
        }
        // Display the selected address
        return (
            <View style={styles.addressBox}>
                 <Icon name="map-marker-outline" size={20} color="#555" style={styles.addressIcon}/>
                 <View style={styles.addressDetailsContainer}>
                    <Text style={styles.addressTextBold}>{shippingAddress.name || 'N/A'}</Text>
                    {shippingAddress.phone && <Text style={styles.addressText}>{shippingAddress.phone}</Text>}
                    <Text style={styles.addressText}>{shippingAddress.addressLine1 || shippingAddress.street || 'Address Line 1 Missing'}</Text>
                    {shippingAddress.addressLine2 && <Text style={styles.addressText}>{shippingAddress.addressLine2}</Text>}
                    <Text style={styles.addressText}>
                        {`${shippingAddress.city || ''}${shippingAddress.city && shippingAddress.province ? ', ' : ''}${shippingAddress.province || shippingAddress.state || ''} ${shippingAddress.postalCode || ''}`.trim()}
                    </Text>
                    {shippingAddress.country && <Text style={styles.addressText}>{shippingAddress.country}</Text>}
                </View>
                {/* Change Button moved to header */}
            </View>
        );
    };

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Header */}
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} disabled={isPlacingOrder} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                    <Icon name="arrow-left" size={26} color={isPlacingOrder ? '#ccc' : '#333'} />
                </TouchableOpacity>
                <Text style={styles.title}>Confirm Order</Text>
                <View style={styles.headerSpacer} />{/* Spacer */}
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>

                {/* Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                        {/* Show change button only if an address is loaded/selected */}
                        {!isAddressLoading && shippingAddress && shippingAddress.id !== 'error' && availableAddresses.length > 0 && (
                             <TouchableOpacity onPress={handleChangeAddress} disabled={isPlacingOrder}>
                                <Text style={[styles.editText, isPlacingOrder && { color: '#ccc'}]}>Change</Text>
                             </TouchableOpacity>
                        )}
                    </View>
                     {renderAddressSection()}
                </View>

                <View style={styles.separatorThin} />

                {/* Order Items Section */}
                 <View style={styles.section}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Order Items ({totalQuantity})</Text>
                     </View>
                     {itemsToCheckout.length > 0 ? (
                        <FlatList
                            data={itemsToCheckout}
                            renderItem={renderCheckoutItem}
                            keyExtractor={(item, index) => `${item.id}_${index}`} // Ensure unique keys if IDs aren't strictly unique in the checkout list itself
                            scrollEnabled={false} // Disable scroll within ScrollView
                            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                         />
                     ) : (
                        <View style={styles.emptyItemsBox}>
                            <Icon name="package-variant-closed-remove" size={30} color="#999" />
                            <Text style={styles.emptyItemsText}>No items selected for checkout.</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                                <Text style={styles.linkText}>Return to Cart</Text>
                            </TouchableOpacity>
                        </View>
                     )}
                 </View>

                <View style={styles.separatorThin} />

                {/* Payment Method Section */}
                 <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                         <TouchableOpacity onPress={() => Alert.alert("Select Payment", "Only Cash on Delivery is currently available.")} disabled={true}>
                            <Text style={[styles.editText, { color: '#ccc' }]}>Change</Text>
                         </TouchableOpacity>
                    </View>
                     <View style={styles.paymentBox}>
                        <Icon name="cash-multiple" size={22} color="#198754" style={{ marginRight: 10 }} />
                        <Text style={styles.paymentText}>Cash on Delivery (COD)</Text>
                     </View>
                </View>

                 <View style={styles.separatorThin} />

                {/* Order Summary Section */}
                 <View style={[styles.section, { marginBottom: 0 }]}>
                    <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal ({totalQuantity} items)</Text>
                        <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping Fee</Text>
                        <Text style={styles.summaryValue}>{formatPrice(shippingCost)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax ({(taxRate * 100).toFixed(0)}%)</Text>
                        <Text style={styles.summaryValue}>{formatPrice(taxAmount)}</Text>
                    </View>
                    <View style={styles.separatorBold} />
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Payment</Text>
                        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        // Disable if placing order, no items, or no valid address
                        (isPlacingOrder || itemsToCheckout.length === 0 || !shippingAddress || shippingAddress.id === 'error') && styles.disabledButton
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={isPlacingOrder || itemsToCheckout.length === 0 || !shippingAddress || shippingAddress.id === 'error'}
                >
                    {isPlacingOrder
                        ? <ActivityIndicator size="small" color="#ffffff" />
                        : <Text style={styles.placeOrderButtonText}>Place Order</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// --- Styles (Keep existing styles - ensure fontFamily names match your project) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa', },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 15 : 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', },
    backButton: { padding: 5, }, // hitSlop added inline
    title: { textAlign: 'center', fontSize: 19, fontFamily: 'Poppins-SemiBold', color: '#333', flex: 1, marginHorizontal: 10, },
    headerSpacer: { width: 36 }, // Match back button area
    scrollView: { flex: 1, },
    scrollViewContent: { paddingBottom: 100, }, // Space for footer button
    section: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 15, marginBottom: 8, },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, },
    sectionTitle: { fontSize: 16.5, fontFamily: 'Poppins-SemiBold', color: '#343a40', },
    editText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#E50914', },
    linkText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#E50914', textDecorationLine: 'underline'},
    // Address Styles
    addressBox: { paddingVertical: 8, minHeight: 70, flexDirection: 'row', alignItems: 'flex-start', }, // Align items start for multi-line addresses
    addressLoadingBox: { justifyContent: 'center', alignItems: 'center', minHeight: 70 },
    addressDetailsContainer: { flex: 1, },
    addressIcon: { marginRight: 12, alignSelf: 'flex-start', marginTop: 2, },
    addressText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#495057', marginBottom: 3, lineHeight: 20, },
    addressTextBold: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#343a40', marginBottom: 4, },
    loadingAddressText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#888', marginLeft: 10, },
    noAddressText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#666', marginBottom: 4, },
    addAddressLink: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#E50914', },
    // Payment Styles
    paymentBox: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, },
    paymentText: { fontSize: 14.5, fontFamily: 'Poppins-Regular', color: '#333'},
    // Item Styles
    cartItemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, },
    cartItemImage: { width: 55, height: 55, borderRadius: 6, marginRight: 12, backgroundColor: '#e9ecef', },
    cartItemDetails: { flex: 1, marginRight: 8, justifyContent: 'center', },
    cartItemName: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#343a40', marginBottom: 3, },
    cartItemPrice: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6c757d', },
    cartItemQuantity: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6c757d', marginTop: 3, },
    cartItemLineTotal: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#343a40', textAlign: 'right', minWidth: 70, },
    itemSeparator: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 5, marginHorizontal: 5 }, // Added slight horizontal margin
    emptyItemsBox: { alignItems: 'center', paddingVertical: 30, },
    emptyItemsText: { textAlign: 'center', fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6c757d', marginTop: 10, marginBottom: 15, },
    // Summary Styles
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, },
    summaryLabel: { fontSize: 14.5, fontFamily: 'Poppins-Regular', color: '#495057', },
    summaryValue: { fontSize: 14.5, fontFamily: 'Poppins-Medium', color: '#343a40', },
    totalRow: { marginTop: 10, paddingVertical: 5, },
    totalLabel: { fontSize: 17, fontFamily: 'Poppins-SemiBold', color: '#212529', },
    totalValue: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#E50914', },
    // Separators
    separatorThin: { height: 8, backgroundColor: '#f8f9fa', },
    separatorBold: { height: 1, backgroundColor: '#e9ecef', marginVertical: 12, },
    // Footer Styles
    footer: {
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
        elevation: 8,
        shadowColor: "#000", shadowOffset: { width: 0, height: -2, }, shadowOpacity: 0.1, shadowRadius: 4,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Adjust for safe area insets on iOS
    },
    placeOrderButton: {
        backgroundColor: '#E50914',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50, // Fixed height for button
        elevation: 2,
    },
    placeOrderButtonText: { fontSize: 16, color: '#ffffff', fontFamily: 'Poppins-Bold', },
    disabledButton: { backgroundColor: '#E50914', opacity: 0.6, elevation: 0 },
});

export default Checkout;