// Screens/OrderHistory.js

import React, { useCallback } from 'react'; // Removed useState, useEffect, useFocusEffect etc.
import {
    View, Text, FlatList, StyleSheet, SafeAreaView,
    TouchableOpacity, Platform, Alert // Keep Alert if used in handleViewOrderDetails
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
// No longer need useAuth unless displaying user-specific info unrelated to orders
import { useOrders } from '../context/OrdersContext'; // <-- Import useOrders hook

// --- Utilities (Keep these) ---
const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₱ ---.--';
    return numPrice.toLocaleString('en-PH', {
        style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2,
    });
};

const formatDate = (isoString) => {
    if (!isoString) return 'Date N/A';
    try {
        // Use a more universally compatible format, adjust locale as needed
        return new Date(isoString).toLocaleDateString('en-CA', { // en-CA gives YYYY-MM-DD
            year: 'numeric', month: 'short', day: 'numeric',
        });
        /* // Alternative US format
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
        */
    } catch (e) {
        console.warn("Invalid date format encountered:", isoString);
        return 'Invalid Date';
    }
};
// --- ---

const OrderHistory = () => {
    const navigation = useNavigation();
    const { orders } = useOrders(); // <-- Get orders directly from the context

    // Removed isLoading, error, refreshing states and related effects/handlers

    // --- Navigation Handler (Keep, adjust as needed for OrderDetails) ---
    const handleViewOrderDetails = useCallback((order) => {
        // Add a more robust check for a valid order object before navigating
        if (!order || typeof order !== 'object' || !order.id) {
             console.warn("OrderHistory: Attempted to view details for invalid/incomplete order object:", order);
             Alert.alert("Error", "Cannot view details for this order. Data might be incomplete.");
             return;
        }
        console.log("OrderHistory: Navigating to details for Order (Session ID):", order.id);
        // Ensure OrderDetails screen exists and can handle the passed 'orderData'
        navigation.navigate('OrderDetails', { orderData: order, orderId: order.id }); // Pass the full order object
    }, [navigation]);

    // --- Render Order Item (Keep, ensure fields match orderData from context) ---
    const renderOrderItem = useCallback(({ item }) => {
         // Use a more robust check for essential item validity before rendering
         if (!item || typeof item !== 'object' || !item.id || !item.summary || !item.orderDate) {
            console.warn("OrderHistory: Skipping render for invalid/incomplete item:", item);
            return null; // Don't render incomplete items
         }

        // Extract a portion of the session ID for display (e.g., last 8 chars or after last '_')
        const displayOrderId = item.id.includes('_')
            ? item.id.substring(item.id.lastIndexOf('_') + 1)
            : item.id.slice(-8); // Fallback for IDs without '_'

        const status = item.status || 'Unknown'; // Default status
        const statusKey = status.replace(/\s+/g, ''); // For style lookup (e.g., "Processing" -> "Processing")

        return (
            <TouchableOpacity
                style={styles.orderItem}
                onPress={() => handleViewOrderDetails(item)}
                activeOpacity={0.7}
            >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId} numberOfLines={1}>Order #{displayOrderId}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.orderDate)}</Text>
                </View>

                {/* Order Summary */}
                <View style={styles.orderSummary}>
                    {/* Item Count */}
                    <Text style={styles.orderItemCount}>
                        {item.summary?.totalQuantity ?? 0} {item.summary?.totalQuantity === 1 ? 'item' : 'items'}
                    </Text>
                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge,
                        styles[`status${statusKey}`] || styles.statusUnknown // Dynamic status style
                    ]}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                    {/* Total Price */}
                    <Text style={styles.orderTotal}>{formatPrice(item.summary?.total ?? 0)}</Text>
                </View>

                {/* Optional: Preview of first item */}
                {item.items && item.items.length > 0 && item.items[0]?.name && ( // Check item[0] and name exist
                    <Text style={styles.orderPreview} numberOfLines={1}>
                        Includes: {item.items[0].name}
                        {item.items.length > 1 ? ` + ${item.items.length - 1} more` : ''}
                    </Text>
                )}

                {/* Chevron Icon */}
                <Icon name="chevron-right" size={24} color="#bbb" style={styles.chevron} />
            </TouchableOpacity>
        )
    }, [handleViewOrderDetails]); // Dependency remains

    // --- Render Empty List Component (Simplified for Session) ---
    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Icon name="receipt-text-clock-outline" size={60} color="#ccc" /> {/* Changed Icon */}
            <Text style={styles.emptyText}>No orders placed during this session.</Text>
            <Text style={styles.emptySubText}>Orders placed will appear here until you close the app.</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('HomeTabs', { screen: 'Home' })} // Adjust navigation target if needed
                style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Order History (Session)</Text> {/* Clarified title */}
                <View style={styles.headerSpacer} />{/* To balance the back button */}
            </View>

            {/* Display the list of session orders */}
            <FlatList
                data={orders} // <-- Directly use orders from context
                renderItem={renderOrderItem}
                keyExtractor={(item, index) => item.id ? item.id : `order-${index}`} // Use unique session ID or fallback
                contentContainerStyle={[
                    styles.listContainer,
                    orders.length === 0 && styles.emptyListContainer // Apply style only when empty
                ]}
                ListEmptyComponent={renderEmptyComponent} // Use the simplified empty component
                showsVerticalScrollIndicator={false}
                // Removed RefreshControl as data is only in local state (session)
            />

        </SafeAreaView>
    )
}

// --- Styles (Keep existing styles - ensure fontFamily names match your project) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light background
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
        padding: 5, // Make it easier to tap
    },
    title: {
        textAlign: 'center',
        fontSize: 19,
        fontFamily: 'Poppins-SemiBold', // Ensure this font is linked
        color: '#333',
        flex: 1, // Allow title to take space and center
        marginHorizontal: 10, // Give space between button and title edge
    },
    headerSpacer: {
        width: 36, // Roughly match the size of the back button + padding
    },
    listContainer: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        flexGrow: 1, // Important for centering empty component
    },
    emptyListContainer: { // Applied when list is empty via contentContainerStyle
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        flexGrow: 1, // Ensure it takes full space if list is empty
    },
    orderItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        position: 'relative', // For absolute positioning of chevron
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        paddingBottom: 8,
    },
    orderId: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold', // Ensure this font is linked
        color: '#333',
        flexShrink: 1, // Prevent long IDs from pushing date off-screen
        marginRight: 10,
    },
    orderDate: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular', // Ensure this font is linked
        color: '#666',
    },
    orderSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 4,
    },
    orderItemCount: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular', // Ensure this font is linked
        color: '#555',
        flex: 1, // Allow it to take available space before status/total
        marginRight: 8,
    },
    orderTotal: {
        fontSize: 15,
        fontFamily: 'Poppins-Bold', // Ensure this font is linked
        color: '#E50914', // Theme color
        textAlign: 'right',
        flexShrink: 0, // Prevent total from shrinking
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        marginHorizontal: 5, // Give space around the badge
        alignSelf: 'center', // Vertically center badge in its row space
        minWidth: 70, // Ensure badge has some minimum width
        alignItems: 'center', // Center text inside badge
    },
    statusText: {
        fontSize: 10,
        fontFamily: 'Poppins-Bold', // Ensure this font is linked
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Status Color Definitions (Keep these, ensure keys match potential status values)
    statusPending: { backgroundColor: '#ffb703' },     // Yellow/Orange
    statusProcessing: { backgroundColor: '#0096c7' }, // Blue
    statusShipped: { backgroundColor: '#17a2b8' },    // Teal
    statusDelivered: { backgroundColor: '#52b788' },  // Green
    statusCancelled: { backgroundColor: '#d90429' },  // Red
    statusFailed: { backgroundColor: '#e74c3c' },     // Another failure red
    statusReturned: { backgroundColor: '#7f8c8d' },   // Grey
    statusUnknown: { backgroundColor: '#adb5bd' },    // Default Grey

    orderPreview: {
        fontSize: 13,
        fontFamily: 'Poppins-Italic', // Ensure this font is linked
        color: '#888',
        marginTop: 5,
        paddingRight: 25, // Ensure text doesn't overlap chevron
    },
    chevron: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -12 }], // Adjust to vertically center the icon
    },
    emptyContainer: {
        // Centering is now handled by listContainer + emptyListContainer style merge
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        paddingBottom: 50, // Add padding at the bottom
        // flex: 1, // Not needed here, handled by contentContainerStyle
    },
    emptyText: {
        fontSize: 17,
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Poppins-Medium', // Ensure this font is linked
        marginTop: 15,
        marginBottom: 8,
        lineHeight: 24,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular', // Ensure this font is linked
        marginBottom: 25,
        lineHeight: 20,
    },
    actionButton: {
        backgroundColor: '#E50914', // Theme color
        paddingVertical: 12,
        paddingHorizontal: 35,
        borderRadius: 8,
        elevation: 2,
        marginTop: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Bold', // Ensure this font is linked
        fontSize: 16,
    },
});

export default OrderHistory;