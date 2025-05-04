// Screens/OrderDetails.js

import React, { useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Platform, ActivityIndicator, Image // Added Image for potential future use
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Utilities (Copied from OrderHistory for self-containment, or import from a shared file) ---
const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₱ ---.--';
    // Ensure it always shows 2 decimal places
    const formatted = numPrice.toLocaleString('en-PH', {
        style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
    return formatted;
};

const formatDate = (isoString) => {
    if (!isoString) return 'Date N/A';
    try {
        const date = new Date(isoString);
        // Example: "Sep 15, 2023, 10:30 AM" - Adjust options as needed
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    } catch (e) {
        console.warn("Invalid date format encountered:", isoString);
        return 'Invalid Date';
    }
};
// --- ---

// --- Status Badge Styles (Copied for consistency, or import) ---
const statusStyles = StyleSheet.create({
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
        alignSelf: 'flex-start', // Align badge nicely within its container
        marginTop: 5,
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'Poppins-Bold', // Ensure font is linked
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Add all status colors here, matching OrderHistory
    statusPending: { backgroundColor: '#ffb703' },
    statusProcessing: { backgroundColor: '#0096c7' },
    statusShipped: { backgroundColor: '#17a2b8' },
    statusDelivered: { backgroundColor: '#52b788' },
    statusCancelled: { backgroundColor: '#d90429' },
    statusFailed: { backgroundColor: '#e74c3c' },
    statusReturned: { backgroundColor: '#7f8c8d' },
    statusUnknown: { backgroundColor: '#adb5bd' },
});
// --- ---

const OrderDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderData, orderId } = route.params || {};

    useEffect(() => {
        // Log received data (keep for debugging if needed)
        // console.log("OrderDetails: Received Order ID:", orderId);
        // console.log("OrderDetails: Received Order Data:", JSON.stringify(orderData, null, 2));
    }, [orderData, orderId]);

    // Extract display ID logic (same as OrderHistory)
    const displayOrderId = orderId?.includes('_')
        ? orderId.substring(orderId.lastIndexOf('_') + 1)
        : orderId?.slice(-8) ?? 'N/A';

    // Get Status and dynamic style key
    const status = orderData?.status || 'Unknown';
    const statusKey = status.replace(/\s+/g, ''); // e.g., "Processing"
    const currentStatusStyle = statusStyles[`status${statusKey}`] || statusStyles.statusUnknown;

    // Loading/Error State (Basic)
    if (!orderData || !orderId) {
        // Added ActivityIndicator for initial loading feel, though data should be passed directly
        // If fetching was involved here, this would be more elaborate
        return (
            <SafeAreaView style={styles.containerCentered}>
                {/* <ActivityIndicator size="large" color="#E50914" /> */}
                <Text style={styles.errorText}>Error: Order details not found.</Text>
                <Text style={styles.errorSubText}>Please go back and try again.</Text>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonError}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ---- Main Render ----
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={styles.headerSpacer} />{/* Balance the back button */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* Order Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Order ID:</Text>
                        <Text style={[styles.value, styles.valueBold]}>#{displayOrderId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Order Date:</Text>
                        <Text style={styles.value}>{formatDate(orderData.orderDate)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Status:</Text>
                        {/* Status Badge */}
                        <View style={[statusStyles.statusBadge, currentStatusStyle]}>
                           <Text style={statusStyles.statusText}>{status}</Text>
                        </View>
                    </View>
                     {/* Add more fields if available e.g., Payment Method, Shipping Address */}
                     {/*
                     <View style={styles.infoRow}>
                        <Text style={styles.label}>Payment:</Text>
                        <Text style={styles.value}>{orderData.paymentMethod || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Shipping To:</Text>
                        <Text style={styles.value} numberOfLines={2}>{orderData.shippingAddress?.full || 'N/A'}</Text>
                    </View>
                    */}
                </View>

                {/* Items Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({orderData.summary?.totalQuantity ?? 0})</Text>
                    {orderData.items && orderData.items.length > 0 ? (
                        orderData.items.map((item, index) => (
                            <View key={item.id || `item-${index}`} style={styles.itemContainer}>
                                {item.image && // Conditionally render image if available
                                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                                }
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.name || 'Unnamed Item'}</Text>
                                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noItemsText}>No items found in this order.</Text>
                    )}
                </View>

                {/* Order Summary Section */}
                <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Order Summary</Text>
                     {/* You might have subtotal, delivery fee etc. in a real scenario */}
                     {/* Example structure if you had more details:
                     <View style={styles.summaryRow}>
                         <Text style={styles.summaryLabel}>Subtotal:</Text>
                         <Text style={styles.summaryValue}>{formatPrice(orderData.summary?.subtotal ?? 0)}</Text>
                     </View>
                     <View style={styles.summaryRow}>
                         <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                         <Text style={styles.summaryValue}>{formatPrice(orderData.summary?.deliveryFee ?? 0)}</Text>
                     </View>
                     <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                         <Text style={styles.summaryLabelTotal}>Grand Total:</Text>
                         <Text style={styles.summaryValueTotal}>{formatPrice(orderData.summary?.total ?? 0)}</Text>
                     </View>
                     */}
                     {/* Simple Total for now */}
                      <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                         <Text style={styles.summaryLabelTotal}>Total Amount:</Text>
                         <Text style={styles.summaryValueTotal}>{formatPrice(orderData.summary?.total ?? 0)}</Text>
                     </View>
                </View>

                 {/* Add buttons for actions like "Reorder", "Track Shipment" if applicable */}

            </ScrollView>
        </SafeAreaView>
    )
}

// --- Enhanced Styles for OrderDetails ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light background
    },
    containerCentered: { // For error/loading state
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5, // Hit area
    },
    headerTitle: {
        textAlign: 'center',
        fontSize: 19,
        fontFamily: 'Poppins-SemiBold', // Ensure font is linked
        color: '#333',
        flex: 1, // Allows centering
    },
    headerSpacer: {
        width: 36, // Match icon size + padding
    },
    scrollContainer: {
        paddingVertical: 20,
        paddingHorizontal: 15,
        flexGrow: 1, // Ensures content can scroll if needed
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Poppins-SemiBold', // Ensure font is linked
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Use flex-start for multi-line values
        marginBottom: 12,
        paddingVertical: 3, // Small vertical padding for spacing
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#555',
        marginRight: 10,
        flexShrink: 1, // Allow label to shrink if value is long
        minWidth: 90, // Give labels consistent width
    },
    value: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#333',
        textAlign: 'right',
        flex: 1, // Allow value to take remaining space
    },
    valueBold: {
        fontFamily: 'Poppins-Medium', // Make certain values slightly bolder
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    // Style for item image (optional)
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 15,
        backgroundColor: '#eee', // Placeholder bg color
    },
    itemDetails: {
        flex: 1, // Take available space
        marginRight: 10,
    },
    itemName: {
        fontSize: 15,
        fontFamily: 'Poppins-Medium', // Ensure font is linked
        color: '#444',
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#777',
    },
    itemPrice: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold', // Ensure font is linked
        color: '#E50914', // Theme color
        textAlign: 'right',
        minWidth: 80, // Ensure price alignment
    },
    noItemsText: {
        fontSize: 14,
        fontFamily: 'Poppins-Italic', // Ensure font is linked
        color: '#888',
        textAlign: 'center',
        paddingVertical: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#555',
    },
    summaryValue: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium', // Ensure font is linked
        color: '#333',
    },
    summaryTotalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 10,
        paddingTop: 10,
    },
    summaryLabelTotal: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold', // Ensure font is linked
        color: '#333',
    },
    summaryValueTotal: {
        fontSize: 17,
        fontFamily: 'Poppins-Bold', // Ensure font is linked
        color: '#E50914', // Theme color
    },
    errorText: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold', // Ensure font is linked
        color: '#d90429', // Error color
        textAlign: 'center',
        marginBottom: 10,
    },
    errorSubText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
     backButtonError: {
        marginTop: 15,
        backgroundColor: '#6c757d', // Grey color for back button in error state
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
    }
});

export default OrderDetails;