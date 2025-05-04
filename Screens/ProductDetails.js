//src/screens/ProductDetails.js


import React, { useState, useContext, useCallback, useRef, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    RefreshControl, ScrollView, FlatList, Dimensions, Platform,
    Modal, Alert, Pressable, ActivityIndicator, SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Use cart hook
import { useCart } from '../context/CartContext'; // <-- VERIFY PATH
import PlaceholderImage from '../assets/PRLOGO-mobileapp.png'; // <-- VERIFY PATH

const { width } = Dimensions.get('window');

// Price formatting utility
const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '₱ ---.--'; // Consistent placeholder
    return numPrice.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ProductDetails = () => { // Removed route from props, use hook instead
    const navigation = useNavigation();
    const route = useRoute(); // Use hook to get route params
    const { product } = route.params || {}; // Get product from route, provide default empty object

    const flatListRef = useRef(null);

    // --- Context ---
    const { addToCart, cartItems } = useCart(); // Use cart hook

    // --- State ---
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [activeIndex, setActiveIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    // --- ---

    // --- Error Handling & Derived Data ---
    // Validate product structure early
    const isValidProduct = useMemo(() => {
        return product && typeof product.id !== 'undefined' && typeof product.name === 'string' && typeof product.price !== 'undefined';
    }, [product]);

    if (!isValidProduct) {
        // Handle case where product data is invalid or missing
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={60} color="#ccc" />
                <Text style={styles.errorText}>Product data is missing or invalid.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
                    <Text style={styles.errorLink}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Memoize derived data only if product is valid
    const formattedPrice = useMemo(() => formatPrice(product.price), [product.price]);
    const productImages = useMemo(() => {
        return (product.images && Array.isArray(product.images))
            ? product.images.filter(img => typeof img === 'string' && img.trim() !== '' && (img.startsWith('http') || img.startsWith('file'))) // Allow local file URIs too
            : [];
    }, [product.images]);

    const displayImages = useMemo(() => {
        // Use product images if available, otherwise use placeholder
        return productImages.length > 0 ? productImages : [PlaceholderImage];
    }, [productImages]);

    // Ensure stock is a non-negative number
    const stock = useMemo(() => {
        const numStock = parseInt(product?.stock, 10);
        return !isNaN(numStock) && numStock >= 0 ? numStock : 0;
    }, [product?.stock]);

    const isAvailable = useMemo(() => stock > 0, [stock]);

    // Memoize cart item count calculation
    const cartItemCount = useMemo(() => {
        // Could also calculate total quantity in cart if needed:
        // cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        return cartItems.length; // Number of distinct items in cart
    }, [cartItems]);
    // --- ---

    // --- Handlers (useCallback) ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        // TODO: Add actual data fetching logic here if this screen needs to refetch product data
        console.log("ProductDetails: Simulating refresh...");
        try {
            // await fetchProductData(product.id); // Example refetch
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            console.log("ProductDetails: Refresh complete.");
        } catch (error) {
            console.error("ProductDetails: Refresh failed", error);
            Alert.alert("Refresh Failed", "Could not reload product details.");
        } finally {
            setRefreshing(false);
        }
    }, []); // Add dependencies if refetch function relies on external state/props

    // FlatList scroll handler for active index
    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        // Use the first viewable item's index
        if (viewableItems.length > 0 && typeof viewableItems[0].index === 'number') {
            setActiveIndex(viewableItems[0].index);
        }
    }, []); // No dependencies needed

    // Use useRef for viewabilityConfig to prevent recreation on every render
    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50 // Trigger when 50% of the item is visible
    }).current;

    // Modal Handlers
    const increaseModalQuantity = useCallback(() => {
        setSelectedQuantity(prev => Math.min(prev + 1, stock)); // Clamp quantity to stock
    }, [stock]); // Depends on stock

    const decreaseModalQuantity = useCallback(() => {
        setSelectedQuantity(prev => Math.max(1, prev - 1)); // Minimum quantity is 1
    }, []); // No dependencies

    const handleAddToCart = useCallback(() => {
        if (!isAvailable) {
            Alert.alert("Out of Stock", "This item is currently unavailable.");
            return;
        }
        addToCart(product, 1); // Add 1 item
        // Subtle feedback is better than an alert here usually
        // Maybe show a temporary message or animate the cart icon
        console.log(`ProductDetails: Added "${product.name}" to cart.`);
        // Optionally navigate to cart or show confirmation
        // Alert.alert("Added to Cart", `"${product.name}" has been added.`);
    }, [addToCart, product, isAvailable]); // Depends on context function, product, and availability

    const handleBuyNow = useCallback(() => {
        if (!isAvailable) {
            Alert.alert("Out of Stock", "This item is currently unavailable.");
            return;
        }
        // Open modal to select quantity before proceeding
        setSelectedQuantity(1); // Reset quantity when opening modal
        setIsModalVisible(true);
    }, [isAvailable]); // Depends on availability

    const handleProceedToCheckoutFromModal = useCallback(() => {
        // Double check stock and selected quantity
        if (selectedQuantity <= 0) {
             Alert.alert("Invalid Quantity", "Please select at least one item.");
             return;
        }
        if (selectedQuantity > stock) {
            Alert.alert("Stock Issue", `Only ${stock} items available. Please reduce the quantity.`);
            // Optionally adjust selectedQuantity state here:
            // setSelectedQuantity(stock);
            return;
        }

        setIsModalVisible(false);
        // Prepare item with selected quantity for checkout
        const itemForCheckout = { ...product, quantity: selectedQuantity };
        // Pass *only* this item to checkout
        navigation.navigate('Checkout', { itemsToCheckout: [itemForCheckout] });
    }, [selectedQuantity, stock, product, navigation]); // Dependencies

    const closeModal = useCallback(() => setIsModalVisible(false), []);
    // --- ---

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{product.name}</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Cart')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                  <View style={styles.cartIconContainer}>
                    <Icon name="cart-outline" size={28} color="#333" />
                    {cartItemCount > 0 && (
                        <View style={styles.cartCountBadge}>
                            <Text style={styles.cartCountText}>{cartItemCount > 9 ? '9+' : cartItemCount}</Text>
                        </View>
                    )}
                  </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E50914']} tintColor="#E50914" /> }
                showsVerticalScrollIndicator={false}
            >
                {/* Image Carousel */}
                 <View style={styles.carouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={displayImages}
                        horizontal
                        pagingEnabled // Snaps to full width slides
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => `img-detail-${product.id}-${index}-${typeof item === 'string' ? item.slice(-10) : 'placeholder'}`} // More unique key
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item: imageSource }) => (
                            <View style={styles.slide}>
                                <Image
                                    // If imageSource is a string (URL), use {uri: ...}, otherwise assume it's a require() result (number)
                                    source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                                    style={styles.productImage}
                                    resizeMode="contain" // Fit the whole image
                                    defaultSource={PlaceholderImage} // Fallback for network images
                                    // Optional: Add loading indicator per image
                                />
                            </View>
                        )}
                        getItemLayout={(data, index) => (
                            // Important for performance with pagingEnabled
                            { length: width, offset: width * index, index }
                        )}
                        decelerationRate="fast" // Faster swipe deceleration
                        bounces={false} // Prevent bouncing at ends
                    />
                    {/* Pagination Dots */}
                    {displayImages.length > 1 && (
                        <View style={styles.pagination}>
                            {displayImages.map((_, index) => (
                                <View
                                    key={`dot-${index}`}
                                    style={[styles.dot, activeIndex === index ? styles.dotActive : {}]}
                                />
                            ))}
                        </View>
                    )}
                 </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>

                    {/* Rating (Optional) - Conditionally render */}
                    {(product.rating > 0 || product.reviews > 0) && (
                         <View style={styles.ratingContainer}>
                             {typeof product.rating === 'number' && product.rating > 0 && (
                                 <Text style={styles.ratingText}>
                                    <Icon name="star" size={15} color="#f39c12" /> {product.rating.toFixed(1)}
                                </Text>
                             )}
                             {typeof product.reviews === 'number' && product.reviews > 0 && (
                                <Text style={styles.reviewText}>({product.reviews} reviews)</Text>
                             )}
                         </View>
                    )}

                    <Text style={styles.priceText}>{formattedPrice}</Text>

                    {/* Stock Info */}
                    <View style={styles.stockInfoContainer}>
                        <Icon
                            name={isAvailable ? "check-circle-outline" : "close-circle-outline"}
                            size={16}
                            color={isAvailable ? "#27ae60" : "#e74c3c"}
                        />
                        <Text style={[styles.stockText, { color: isAvailable ? "#27ae60" : "#e74c3c" }]}>
                            {isAvailable ? `${stock} available` : "Out of Stock"}
                        </Text>
                    </View>

                     {/* Description */}
                    {product.description && product.description.trim() !== "" && (
                        <>
                            <View style={styles.separator} />
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.descriptionText}>{product.description}</Text>
                        </>
                     )}

                     {/* TODO: Add Specifications Section if data exists */}
                     {/* Example:
                     {product.specifications && (
                        <>
                           <View style={styles.separator} />
                           <Text style={styles.sectionTitle}>Specifications</Text>
                           {Object.entries(product.specifications).map(([key, value]) => (
                              <Text key={key} style={styles.specText}>{key}: {value}</Text>
                           ))}
                        </>
                     )}
                     */}
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                {isAvailable ? (
                    <View style={styles.footerButtonContainer}>
                        {/* Buy Now Button -> Opens Modal */}
                        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                            <Text style={styles.buttonText}>Buy Now</Text>
                        </TouchableOpacity>
                        {/* Add to Cart Button */}
                        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                            <Icon name="cart-plus" size={22} color="#ffffff" />
                            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                 ) : (
                     // Out of Stock Indicator
                     <View style={[styles.footerButtonContainer, styles.outOfStockFooter]}>
                        <Icon name="cancel" size={20} color="#e74c3c" style={{ marginRight: 8 }} />
                        <Text style={styles.outOfStockText}>Currently Unavailable</Text>
                     </View>
                 )}
            </View>

            {/* --- Quantity Selection Modal --- */}
            <Modal
                animationType="slide" // Or "fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={closeModal} // For Android back button
                statusBarTranslucent={true} // Allow modal to go under status bar
            >
                 {/* Backdrop with press handling */}
                 <Pressable style={styles.modalBackdrop} onPress={closeModal}>
                     {/* Modal Content - Prevent backdrop press from closing if tapping inside */}
                     <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        {/* Close Button (Top Right) */}
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal} hitSlop={{top:15, bottom:15, left:15, right:15}}>
                            <Icon name="close-circle" size={30} color="#aaa" />
                        </TouchableOpacity>

                        {/* Modal Header: Product Info */}
                        <View style={styles.modalHeader}>
                             <Image
                                source={displayImages.length > 0 && typeof displayImages[0] === 'string' ? { uri: displayImages[0] } : displayImages[0]}
                                style={styles.modalProductImage}
                                resizeMode="contain"
                                defaultSource={PlaceholderImage} />
                            <View style={styles.modalProductInfo}>
                                <Text style={styles.modalProductName} numberOfLines={2}>{product.name}</Text>
                                <Text style={styles.modalProductPrice}>{formattedPrice}</Text>
                                <Text style={styles.modalProductStock}>(Max quantity: {stock})</Text>
                            </View>
                        </View>

                         <View style={styles.modalSeparator} />

                        {/* Quantity Selection Section */}
                        <View style={styles.modalSection}>
                             <Text style={styles.modalSectionTitle}>Select Quantity</Text>
                             <View style={styles.modalQuantityControl}>
                                {/* Decrease Button */}
                                <TouchableOpacity
                                    onPress={decreaseModalQuantity}
                                    disabled={selectedQuantity <= 1}
                                    style={[styles.modalQuantityButton, selectedQuantity <= 1 && styles.modalButtonDisabled]}
                                    hitSlop={{top:10, bottom:10, left:10, right:10}}
                                >
                                    <Icon name="minus-circle" size={34} color={selectedQuantity <= 1 ? "#ccc" : "#555"} />
                                </TouchableOpacity>
                                {/* Quantity Display */}
                                <Text style={styles.modalQuantityText}>{selectedQuantity}</Text>
                                {/* Increase Button */}
                                <TouchableOpacity
                                    onPress={increaseModalQuantity}
                                    disabled={selectedQuantity >= stock}
                                    style={[styles.modalQuantityButton, selectedQuantity >= stock && styles.modalButtonDisabled]}
                                     hitSlop={{top:10, bottom:10, left:10, right:10}}
                                >
                                    <Icon name="plus-circle" size={34} color={selectedQuantity >= stock ? "#ccc" : "#E50914"} />
                                </TouchableOpacity>
                             </View>
                        </View>

                         {/* Confirm Button */}
                         {/* Calculate total price for the confirm button */}
                         <Text style={styles.modalConfirmPriceLabel}>
                            Total: {formatPrice(selectedQuantity * parseFloat(product?.price ?? 0))}
                         </Text>
                        <TouchableOpacity
                            style={[styles.modalConfirmButton, !isAvailable && styles.modalButtonDisabled]} // Also disable if product became unavailable
                            onPress={handleProceedToCheckoutFromModal}
                            disabled={!isAvailable || selectedQuantity <= 0 || selectedQuantity > stock} // Comprehensive disable check
                         >
                            <Text style={styles.modalConfirmButtonText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                     </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' }, // Light background
    // Error Screen Styles
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    errorText: { fontSize: 17, fontFamily: 'Poppins-Regular', color: '#555', textAlign: 'center', marginBottom: 20, },
    goBackButton: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: '#E50914', borderRadius: 8 },
    errorLink: { fontSize: 16, fontFamily: 'Poppins-Medium', color: '#E50914', },
    // Header Styles
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff', // White header background
    },
    headerButton: {
        padding: 5, // Base padding, hitSlop increases touch area
    },
    title: {
        fontSize: 18,
        fontFamily: "Poppins-SemiBold", // Ensure font is loaded
        color: "#333",
        textAlign: 'center',
        flex: 1, // Allow title to expand
        marginHorizontal: 5, // Small margin around title
    },
    cartIconContainer: {
        position: 'relative', // Needed for absolute positioning of the badge
    },
    cartCountBadge: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: '#E50914', // Theme color
        borderRadius: 9,
        width: 18, // Fixed size circle
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1, // Ensure badge is above icon
    },
    cartCountText: {
        fontSize: 10,
        color: '#ffffff',
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
    },
    // ScrollView Styles
    scrollViewContent: {
        paddingBottom: 100, // Ensure space for the absolute footer
        flexGrow: 1, // Allow content to grow if needed
    },
    // Carousel Styles
    carouselContainer: {
        width: width,
        height: width * 0.85, // Adjust aspect ratio as needed (e.g., 4:3 or 1:1)
        backgroundColor: '#fff', // Background for the carousel area
        marginBottom: 8, // Space below carousel
    },
    slide: {
        width: width, // Full width slide
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5, // Small padding around image
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Show the whole image
    },
    pagination: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Inactive dot color
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#E50914', // Active dot color
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    // Product Info Styles
    infoContainer: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 20,
        backgroundColor: '#fff', // White background for info section
    },
    productName: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        color: '#2c3e50', // Dark blue/grey
        marginBottom: 8,
        lineHeight: 30,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap', // Allow wrapping if name is long
    },
    ratingText: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        color: '#555',
        marginRight: 8, // Space between rating and reviews
        flexDirection: 'row', // Align icon and text
        alignItems: 'center',
    },
    reviewText: {
        fontSize: 14,
        color: '#7f8c8d', // Lighter grey
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
    },
    priceText: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        color: '#E50914', // Theme color
        marginBottom: 12,
    },
    stockInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    stockText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium', // Ensure font is loaded
        marginLeft: 8,
        textTransform: 'capitalize',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0', // Light separator line
        marginVertical: 18,
    },
    sectionTitle: {
        fontSize: 17,
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        color: '#333',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14.5,
        color: '#34495e', // Slightly softer black
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        lineHeight: 23, // Improve readability
    },
    // Footer & Button Styles
    footer: {
        position: 'absolute', // Stick to bottom
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff', // White footer background
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Safe area bottom padding
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    footerButtonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch', // Make buttons same height
    },
    outOfStockFooter: {
        justifyContent: 'center', // Center content when out of stock
        alignItems: 'center',
        paddingVertical: 15, // Match button height roughly
    },
    outOfStockText: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        color: '#e74c3c', // Red color for out of stock
    },
    buyNowButton: {
        backgroundColor: '#f0ad4e', // Example: Orange for Buy Now
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        elevation: 2,
        flex: 1, // Take half the space
        marginRight: 10, // Space between buttons
    },
    addToCartButton: {
        backgroundColor: '#E50914', // Theme color for Add to Cart
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        elevation: 2,
        flex: 1, // Take half the space
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        color: '#ffffff',
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker backdrop
        justifyContent: 'flex-end', // Modal appears from bottom
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 35 : 25, // Safe area padding at bottom
        paddingHorizontal: 20,
        width: '100%',
        maxHeight: '75%', // Limit modal height if content is long
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        padding: 5,
        zIndex: 10, // Ensure button is clickable
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingRight: 35, // Space for the close button
    },
    modalProductImage: {
        width: 65,
        height: 65,
        borderRadius: 8,
        marginRight: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    modalProductInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    modalProductName: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        color: '#333',
        marginBottom: 4,
    },
    modalProductPrice: {
        fontSize: 15,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        color: '#E50914',
        marginBottom: 4,
    },
    modalProductStock: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular', // Ensure font is loaded
        color: '#777',
    },
    modalSeparator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 15,
    },
    modalSection: {
        marginBottom: 20,
        alignItems: 'center', // Center quantity control
    },
    modalSectionTitle:{
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold', // Ensure font is loaded
        color: '#444',
        marginBottom: 18,
        textAlign: 'center',
    },
    modalQuantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center buttons and text
    },
    modalQuantityButton: {
        padding: 10, // Increase tap area around icon
    },
    modalQuantityText: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        color: '#333',
        minWidth: 60, // Ensure space for 2-3 digit numbers
        textAlign: 'center',
        marginHorizontal: 20, // More space around number
    },
    modalButtonDisabled: {
        opacity: 0.4, // Make disabled state clear
    },
    modalConfirmPriceLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#555',
        textAlign: 'center',
        marginBottom: 12,
    },
    modalConfirmButton: {
        backgroundColor: '#E50914', // Theme color
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10, // Space above button
        height: 50,
    },
    modalConfirmButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold', // Ensure font is loaded
        color: '#ffffff',
    },
});

export default ProductDetails; // Add default export