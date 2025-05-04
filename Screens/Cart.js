// Screens/Cart.js
import React, { useState, useCallback, useMemo, memo, useContext } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Image, StyleSheet,
    ActivityIndicator, Platform, Alert, SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Corrected: Import useCart hook instead of context directly
import { useCart } from '../context/CartContext'; // <-- VERIFY PATH is correct
import PlaceholderImage from '../assets/PRLOGO-mobileapp.png'; // <-- VERIFY PATH is correct

// Price formatting utility (Consider moving to a shared utils folder)
const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₱ ---.--'; // Consistent placeholder
    return numPrice.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// --- Custom CheckBox Component (Memoized) ---
// Use React.memo for functional components
const CustomCheckBox = memo(({ isChecked, onToggle }) => (
    <TouchableOpacity
        onPress={onToggle}
        style={styles.checkboxTap}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
    >
        <View style={[styles.checkboxBase, isChecked && styles.checkboxCheckedStyle]}>
            {isChecked && <Icon name="check-bold" size={14} color="#fff" />}
        </View>
    </TouchableOpacity>
));
// Add displayName for easier debugging
CustomCheckBox.displayName = 'CustomCheckBox';

const Cart = ({ navigation }) => {
    // Use Cart Hook
    const {
        cartItems,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        isLoading: isCartLoading, // Use context loading state
    } = useCart(); // Use the custom hook

    // State for selected items, default to all selected initially
    const [selectedItems, setSelectedItems] = useState(() =>
        cartItems.map(item => item.id)
    );

    // Update selection state if cartItems change externally (e.g., item removed)
    React.useEffect(() => {
        setSelectedItems(prevSelected => {
            const currentCartIds = new Set(cartItems.map(item => item.id));
            // Keep only selected IDs that are still in the cart
            return prevSelected.filter(id => currentCartIds.has(id));
        });
    }, [cartItems]); // Re-run when cartItems array reference changes

    // --- Memoized Calculations ---
    const calculateTotal = useMemo(() => {
        return cartItems
            .filter(item => selectedItems.includes(item.id)) // Filter based on selection
            .reduce((sum, item) => {
                const price = parseFloat(item?.price ?? 0); // Handle potential undefined/null/invalid price
                const quantity = item?.quantity && item.quantity > 0 ? item.quantity : 1; // Default to 1 if invalid
                return sum + (isNaN(price) ? 0 : price * quantity);
            }, 0);
    }, [cartItems, selectedItems]); // Recalculate only when cart or selection changes

    const formattedTotal = useMemo(() => formatPrice(calculateTotal), [calculateTotal]);

    const itemCount = useMemo(() => cartItems.length, [cartItems]);
    const selectedItemCount = useMemo(() => selectedItems.length, [selectedItems]);
    const areAllSelected = useMemo(() => itemCount > 0 && selectedItemCount === itemCount, [itemCount, selectedItemCount]);

    // --- Selection Handlers (Using useCallback) ---
    const toggleSelection = useCallback((id) => {
        setSelectedItems(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(itemId => itemId !== id) // Remove if exists
                : [...prevSelected, id] // Add if doesn't exist
        );
    }, []); // Dependency array is empty as it only uses the setter function's callback form

    const toggleSelectAll = useCallback(() => {
        if (areAllSelected) {
            setSelectedItems([]); // Deselect all
        } else {
            // Select only items currently in the cart
            setSelectedItems(cartItems.map(item => item.id));
        }
    }, [areAllSelected, cartItems]); // Depends on derived state and cartItems

    // Helper to check if an item is selected (simple function, memoization not strictly needed)
    const isSelected = useCallback((id) => selectedItems.includes(id), [selectedItems]);

    // --- Action Handlers (Using useCallback) ---
    const handleCheckoutSelected = useCallback(() => {
        const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));
        if (itemsToCheckout.length === 0) {
            Alert.alert("No Items Selected", "Please select items to proceed to checkout.");
            return;
        }
        // Pass validated items to Checkout screen
        navigation.navigate('Checkout', { itemsToCheckout });
    }, [cartItems, selectedItems, navigation]); // Depends on cart, selection, and navigation

    const confirmRemoveItem = useCallback((item) => {
        // Basic validation before showing alert
        if (!item || typeof item.id === 'undefined' || !item.name) {
            console.warn("Cart: Attempted to remove invalid item:", item);
            Alert.alert("Error", "Cannot remove this item (invalid data).");
            return;
        }
        Alert.alert(
            "Remove Item",
            `Are you sure you want to remove "${item.name}" from your cart?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    onPress: () => {
                        removeFromCart(item.id);
                        // Optional: Also remove from selectedItems if it was selected
                        setSelectedItems(prev => prev.filter(id => id !== item.id));
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    }, [removeFromCart]); // Depends on context function

    // --- Render Item Function (Using useCallback for optimization) ---
    const renderCartItem = useCallback(({ item }) => {
        // Basic validation for item data before rendering
        if (!item || typeof item.id === 'undefined' || typeof item.name !== 'string' || typeof item.price === 'undefined') {
            console.warn("Cart: Skipping render for invalid item data:", item);
            return null; // Don't render if item is invalid
        }
        const isItemSelected = isSelected(item.id);
        const currentQuantity = item.quantity && item.quantity > 0 ? item.quantity : 1; // Ensure valid quantity
        const canDecrease = currentQuantity > 1;
        // Add stock check if available: const canIncrease = currentQuantity < (item.stock || Infinity);

        // Get the first valid image URL or use null
        const imageUrl = Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string'
            ? item.images[0]
            : null;

        return (
            <View style={styles.cartItem}>
                {/* Checkbox */}
                <View style={styles.checkboxContainer}>
                    <CustomCheckBox isChecked={isItemSelected} onToggle={() => toggleSelection(item.id)} />
                </View>
                {/* Image */}
                <Image
                    source={imageUrl ? { uri: imageUrl } : PlaceholderImage} // Use placeholder if no valid URL
                    style={styles.cartItemImage}
                    defaultSource={PlaceholderImage} // Fallback during loading or if URI fails
                    resizeMode="cover" // Ensure image covers the area
                />
                {/* Details */}
                <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={2}>{item.name || 'Unnamed Item'}</Text>
                    <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
                    {/* Quantity Control */}
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            onPress={() => decreaseQuantity(item.id)}
                            disabled={!canDecrease}
                            style={styles.quantityButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Larger hit area
                        >
                            <Icon name="minus-circle-outline" size={26} color={!canDecrease ? "#ccc" : "#555"} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{currentQuantity}</Text>
                        <TouchableOpacity
                            onPress={() => increaseQuantity(item.id)}
                            // disabled={!canIncrease} // Optional: Disable based on stock
                            style={styles.quantityButton}
                             hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Larger hit area
                        >
                            <Icon name="plus-circle-outline" size={26} color={"#E50914"} />
                            {/* Color based on disabled state: color={!canIncrease ? "#ccc" : "#E50914"} */}
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Remove Button */}
                <TouchableOpacity
                    onPress={() => confirmRemoveItem(item)}
                    style={styles.removeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Larger hit area
                >
                    <Icon name="trash-can-outline" size={24} color="#a0a0a0" />
                </TouchableOpacity>
            </View>
        );
    // Dependencies MUST include all external variables/functions used inside that might change
    }, [isSelected, toggleSelection, decreaseQuantity, increaseQuantity, confirmRemoveItem]);

    // --- Loading State ---
    if (isCartLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
                <Text style={styles.loadingText}>Loading Cart...</Text>
            </SafeAreaView>
        );
    }

    // --- Main Render ---
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Your Cart ({itemCount})</Text>
                <View style={styles.headerSpacer} /> {/* Spacer */}
            </View>

            {/* Empty Cart View */}
            {itemCount === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <Icon name="cart-off" size={80} color="#e0e0e0" />
                    <Text style={styles.emptyCartText}>Your cart is empty.</Text>
                    <Text style={styles.emptyCartSubText}>Looks like you haven't added anything yet.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.shopButton}>
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Cart List and Footer
                <>
                    {/* Select All Bar */}
                    <View style={styles.selectAllContainer}>
                        <CustomCheckBox isChecked={areAllSelected} onToggle={toggleSelectAll} />
                        <TouchableOpacity onPress={toggleSelectAll} style={{ flex: 1 }}>
                            <Text style={styles.selectAllText}>Select All ({selectedItemCount}/{itemCount})</Text>
                        </TouchableOpacity>
                        {/* Optional: Add delete selected button here if needed
                        <TouchableOpacity onPress={handleDeleteSelected} disabled={selectedItemCount === 0}>
                            <Text style={[styles.deleteSelectedText, selectedItemCount === 0 && { color: '#ccc' }]}>Delete Selected</Text>
                        </TouchableOpacity>
                        */}
                    </View>

                    {/* Cart Items List */}
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem} // Use the memoized render function
                        keyExtractor={(item) => item.id.toString()} // Ensure key is string
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContentContainer}
                        // Optimization for long lists (optional but good practice)
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={11} // Typically 2 * maxToRenderPerBatch + 1
                        ListFooterComponent={<View style={{ height: 10 }} />} // Small padding at the end
                        extraData={selectedItems} // Trigger re-render if selection changes
                    />

                    {/* Footer: Total and Checkout Button */}
                    <View style={styles.footerContainer}>
                        <View style={styles.totalTextContainer}>
                            <Text style={styles.totalLabelText}>Selected Total ({selectedItemCount} items):</Text>
                            <Text style={styles.totalAmountText}>{formattedTotal}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleCheckoutSelected}
                            style={[styles.checkoutButton, selectedItemCount === 0 && styles.disabledButton]}
                            disabled={selectedItemCount === 0}
                        >
                            <Text style={styles.checkoutText}>Checkout</Text>
                             {/* Optionally show count: ({selectedItemCount}) */}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light grey background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        color: '#555',
    },
    // Header
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
        padding: 5, // Base padding, hitSlop increases area
    },
    title: {
        textAlign: 'center',
        fontSize: 19,
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        color: '#333',
        flex: 1, // Allow title to take center space
        marginHorizontal: 10,
    },
    headerSpacer: { // Ensures title stays centered
        width: 36, // Approx width of back button icon + padding
    },
    // Empty Cart
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: -50, // Adjust spacing slightly
    },
    emptyCartText: {
        fontSize: 19,
        color: '#888',
        marginVertical: 15,
        fontFamily: 'Poppins-Medium', // Ensure font is loaded
    },
    emptyCartSubText: {
        fontSize: 15,
        color: '#aaa',
        marginBottom: 25,
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        textAlign: 'center',
    },
    shopButton: {
        backgroundColor: '#E50914',
        paddingVertical: 12,
        paddingHorizontal: 35,
        borderRadius: 8,
        elevation: 2,
    },
    shopButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        fontSize: 16,
    },
    // Select All Bar
    selectAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 8, // Space before the list starts
    },
    selectAllText: {
        marginLeft: 12,
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        fontSize: 15,
        color: '#444',
        flex: 1, // Allow text to take space
    },
    // List Container
    listContentContainer: {
        paddingHorizontal: 10, // Padding for the list itself
        // Padding bottom handled by footer height + potential safe area
    },
    // Cart Item Row
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 10, // Space between items
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1.5,
    },
    checkboxContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        // alignSelf: 'center', // Align checkbox vertically center (default with alignItems: 'center' on parent)
    },
    checkboxTap: {
        // Style the touchable, not just the inner view
        padding: 5, // Visual padding around checkbox base for easier tap
    },
    checkboxBase: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#bbb',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxCheckedStyle: {
        backgroundColor: '#E50914',
        borderColor: '#E50914',
    },
    cartItemImage: {
        width: 75,
        height: 75,
        borderRadius: 6,
        backgroundColor: '#f0f0f0', // Placeholder background
    },
    cartItemDetails: {
        flex: 1, // Take remaining space
        marginLeft: 12,
        justifyContent: 'space-between', // Distribute content vertically
        minHeight: 75, // Ensure minimum height matches image
        paddingVertical: 2, // Small vertical padding
    },
    cartItemName: {
        fontSize: 14.5,
        fontFamily: 'Poppins-Medium', // Ensure font is loaded
        color: '#333',
        marginBottom: 3,
        lineHeight: 20, // Prevent text cutoff
    },
    cartItemPrice: {
        fontSize: 15,
        color: '#E50914',
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        marginBottom: 6,
    },
    // Quantity Controls
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto', // Push quantity to bottom of details view
    },
    quantityButton: {
        padding: 4, // Visual padding for tap area, hitSlop makes it bigger
    },
    quantityText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        minWidth: 30, // Ensure enough space for number
        textAlign: 'center',
        marginHorizontal: 8, // More space around number
        color: '#333',
        paddingVertical: 2, // Align text vertically better
    },
    // Remove Button
    removeButton: {
        paddingLeft: 12, // Space from details
        paddingVertical: 10,
        // justifyContent: 'center', // Not needed with alignSelf
        // alignItems: 'center', // Not needed with alignSelf
        alignSelf: 'center', // Align vertically center relative to the row height
    },
    // Footer
    footerContainer: {
        // position: 'absolute', // Avoid absolute positioning if possible, let FlatList push it down
        // bottom: 0, left: 0, right: 0, // Remove if not absolute
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // SafeArea padding for iOS bottom bar
    },
    totalTextContainer: {
        flex: 1, // Allow text to take available space
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginRight: 10,
    },
    totalLabelText: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        marginBottom: 2,
    },
    totalAmountText: {
        fontSize: 19,
        color: '#E50914',
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
    },
    checkoutButton: {
        backgroundColor: '#E50914',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        minHeight: 48, // Ensure consistent button height
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#E50914', // Keep color (or use grey like '#bdc3c7')
        opacity: 0.6, // Indicate disabled state with opacity
        elevation: 0, // Reduce elevation when disabled
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        textAlign: 'center',
    },
});

export default Cart; // Add default export