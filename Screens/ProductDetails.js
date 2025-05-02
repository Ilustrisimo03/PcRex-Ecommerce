import React, { useState, useContext, useCallback, useRef } from 'react'; // Added useRef
import { useNavigation } from '@react-navigation/native';
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    RefreshControl, ScrollView, FlatList, Dimensions, Platform,
    Modal, // Keep Modal import
    Alert,
    Pressable,
    ActivityIndicator // Keep ActivityIndicator just in case
    // *** NO NEED TO IMPORT StatusBar for this fix ***
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CartContext } from '../context/CartContext'; // <-- VERIFY PATH
import PlaceholderImage from '../assets/PRLOGO-mobileapp.png'; // <-- VERIFY PATH

const { width } = Dimensions.get('window');
// Define the width for each slide - let's use screen width minus some padding
const SLIDE_WIDTH = width - 40; // e.g., 20px padding on each side

const ProductDetails = ({ route }) => {
    const navigation = useNavigation();
    const { product } = route.params;
    const flatListRef = useRef(null); // Ref for FlatList

    // --- State ---
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [activeIndex, setActiveIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    // --- ---

    // --- Error Handling & Setup ---
    if (!product) { /* ... error handling ... */ return null; }
    const { addToCart, cartItems } = useContext(CartContext);
    const formattedPrice = parseFloat(product?.price ?? 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2, });
    const productImages = (product?.images && Array.isArray(product.images) && product.images.length > 0) ? product.images.filter(img => typeof img === 'string' && img.startsWith('http')) : [];
    const displayImages = productImages.length > 0 ? productImages : [PlaceholderImage];
    // --- End Setup ---

    // --- Handlers ---
    const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => { setRefreshing(false); }, 1000); }, []);

    // Use viewability config for better index tracking on scroll
    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    }, []);
    const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 }; // Trigger when 50% of item is visible

    // Modal Handlers (keep existing)
    const increaseModalQuantity = () => setSelectedQuantity(prev => Math.min(prev + 1, product?.stock ?? 0));
    const decreaseModalQuantity = () => setSelectedQuantity(prev => Math.max(1, prev - 1));
    const handleProceedToCheckoutFromModal = () => {
        const stock = product?.stock ?? 0;
        if (selectedQuantity > stock) { Alert.alert("Stock Issue", `Only ${stock} items available.`); return; }
        setIsModalVisible(false);
        navigation.navigate('Checkout', { itemsToCheckout: [{ ...product, quantity: selectedQuantity }] });
    };
    const openQuantityModal = () => { setSelectedQuantity(1); setIsModalVisible(true); };
    // --- ---

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{product?.name ?? 'Product Details'}</Text>
                <TouchableOpacity style={styles.headerCartIcon} onPress={() => navigation.navigate('Cart')}>
                  <View style={styles.cartIconContainer}>
                    <Icon name="cart-outline" size={28} color="#333" />
                    {cartItems.length > 0 && ( <View style={styles.cartCount}> <Text style={styles.cartCountText}>{cartItems.length}</Text> </View> )}
                  </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E50914']} /> }
            >
                {/* --- Image Carousel (HeroSlider Style) --- */}
                <View style={styles.carouselContainer}>
                    <FlatList
                        ref={flatListRef} // Assign ref
                        data={displayImages}
                        horizontal
                        pagingEnabled // Critical for snapping
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => `img-detail-${index}`}
                        // --- Use viewability config instead of onScroll for index ---
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        // --- ---
                        renderItem={({ item }) => (
                            // --- The Image itself is the slide item ---
                            <Image
                                source={typeof item === 'string' ? { uri: item } : item}
                                style={styles.slideImage} // Apply specific slide image style
                                resizeMode="cover" // <-- USE COVER to fill the area
                                defaultSource={PlaceholderImage}
                            />
                            // --- Removed the inner View wrapper ---
                        )}
                        // Ensure layout is calculated correctly for paging
                        getItemLayout={(data, index) => (
                            { length: SLIDE_WIDTH, offset: SLIDE_WIDTH * index, index }
                        )}
                    />
                    {/* Pagination Dots */}
                    {displayImages.length > 1 && (
                        <View style={styles.dotsContainer}>
                            {displayImages.map((_, index) => (
                                <View key={`dot-${index}`} style={[styles.dot, activeIndex === index && styles.activeDot]} />
                            ))}
                        </View>
                    )}
                </View>
                {/* --- End Image Carousel --- */}


                {/* Product Info */}
                <View style={styles.detailsContainer}>
                     {/* ... product details text, rating, price, description, stock ... */}
                    <Text style={styles.name}>{product?.name ?? 'Product Name'}</Text>
                    {(product?.rate || product?.review > 0) && ( <View style={styles.ratingContainer}> {product?.rate && <Text style={styles.rating}> <Icon name="star" size={15} color="#f39c12" /> {(product.rate).toFixed(1)} </Text>} {product?.review > 0 && <Text style={styles.reviews}>{product.review} reviews</Text>} </View> )}
                    <Text style={styles.price}>{formattedPrice}</Text>
                    {product?.description && ( <Text style={styles.description}> {product.description} </Text> )}
                    {(product?.stock !== undefined) && ( <View style={styles.stockContainer}> <Icon name="package-variant-closed" size={16} color={product.stock > 5 ? "#27ae60" : product.stock > 0 ? "#f39c12" : "#e74c3c"} /> <Text style={[styles.stock, { color: product.stock > 5 ? "#27ae60" : product.stock > 0 ? "#f39c12" : "#e74c3c" }]}> {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"} </Text> </View> )}
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            {(product?.stock ?? 0) > 0 ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buyNowButton} onPress={openQuantityModal} >
                        <Text style={styles.buyNowText}>Buy Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addToCartButton} onPress={() => { addToCart(product); }}>
                        <Icon name="cart-plus" size={22} color="#ffffff" />
                    </TouchableOpacity>
                </View>
             ) : (
                 <View style={[styles.buttonContainer, styles.outOfStockContainer]}>
                    <Text style={styles.outOfStockText}>Currently Unavailable</Text>
                 </View>
             )}

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
                // ****** THE ONLY CHANGE IS HERE ******
                statusBarTranslucent={true}
                // **************************************
            >
                 {/* ... modal structure (no changes needed inside) ... */}
                  <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)} >
                     <Pressable style={styles.modalContent} onPress={() => {}}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                                <Icon name="close-circle" size={28} color="#aaa" />
                            </TouchableOpacity>
                            <Image source={displayImages.length > 0 && typeof displayImages[0] === 'string' ? { uri: displayImages[0] } : displayImages[0]} style={styles.modalProductImage} resizeMode="contain" defaultSource={PlaceholderImage} />
                            <View style={styles.modalProductInfo}>
                                <Text style={styles.modalProductName} numberOfLines={2}>{product?.name ?? ''}</Text>
                                <Text style={styles.modalProductPrice}>{formattedPrice}</Text>
                                <Text style={styles.modalProductStock}>(Stock: {product?.stock ?? 0})</Text>
                            </View>
                        </View>
                         <View style={styles.modalSeparator} />
                        <View style={styles.modalSection}>
                             <Text style={styles.modalSectionTitle}>Quantity</Text>
                             <View style={styles.modalQuantityControl}>
                                <TouchableOpacity onPress={decreaseModalQuantity} disabled={selectedQuantity <= 1} style={[styles.modalQuantityButton, selectedQuantity <= 1 && styles.modalButtonDisabled]} >
                                    <Icon name="minus" size={24} color={selectedQuantity <= 1 ? "#ccc" : "#E50914"} />
                                </TouchableOpacity>
                                <Text style={styles.modalQuantityText}>{selectedQuantity}</Text>
                                <TouchableOpacity onPress={increaseModalQuantity} disabled={selectedQuantity >= (product?.stock ?? 0)} style={[styles.modalQuantityButton, selectedQuantity >= (product?.stock ?? 0) && styles.modalButtonDisabled]} >
                                    <Icon name="plus" size={24} color={selectedQuantity >= (product?.stock ?? 0) ? "#ccc" : "#E50914"} />
                                </TouchableOpacity>
                             </View>
                        </View>
                        <TouchableOpacity style={styles.modalProceedButton} onPress={handleProceedToCheckoutFromModal} >
                            <Text style={styles.modalProceedButtonText}>Confirm (₱{(selectedQuantity * parseFloat(product?.price ?? 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</Text>
                        </TouchableOpacity>
                     </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

// --- Styles (Exactly as you provided them) ---
const styles = StyleSheet.create({
    // ... (All your existing styles from the previous version) ...
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    errorText: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#e74c3c', textAlign: 'center', marginBottom: 15, },
    errorLink: { fontSize: 16, fontFamily: 'Poppins-Medium', color: '#E50914', },
    header: { flexDirection: "row", alignItems: "center", justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 40 : 50, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fff', },
    backButton: { padding: 5, },
    headerCartIcon: { padding: 5, },
    cartIconContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center', },
    cartCount: { position: 'absolute', top: -6, right: -8, backgroundColor: '#E50914', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff', },
    cartCountText: { fontSize: 10, color: '#ffffff', fontFamily: 'Poppins-Bold', },
    title: { fontSize: 18, fontFamily: "Poppins-SemiBold", color: "#333", textAlign: 'center', marginHorizontal: 10, flexShrink: 1, },
    scrollViewContent: { paddingBottom: 100, flexGrow: 1, },
    carouselOuterContainer: { backgroundColor: '#fff', paddingVertical: 15, marginBottom: 10, }, // Added this style in previous fix
    imageWrapper: { width: SLIDE_WIDTH, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, overflow: 'hidden', }, // Added this style in previous fix
    carouselContainer: { // Style from your provided code (might conflict/override imageWrapper aspect ratio)
        width: SLIDE_WIDTH,
        alignSelf: 'center',
        aspectRatio: 4 / 3, // This was added previously
        marginVertical: 15,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#e9ecef',
    },
    slideImage: { // Style from your provided code
        width: SLIDE_WIDTH,
        height: '100%',
        resizeMode: 'cover',
    },
    dotsContainer: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginHorizontal: 4, },
    activeDot: { backgroundColor: '#ffffff', width: 10, height: 10, borderRadius: 5, },
    detailsContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, backgroundColor: '#fff',}, // Adjusted padding
    name: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#2c3e50', marginBottom: 8, },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', },
    rating: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#555', marginRight: 8, flexDirection: 'row', alignItems: 'center', },
    reviews: { fontSize: 13, color: '#7f8c8d', marginRight: 15, fontFamily: 'Poppins-Regular', },
    price: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#E50914', marginVertical: 12, },
    description: { fontSize: 14, color: '#34495e', fontFamily: 'Poppins-Regular', lineHeight: 22, marginBottom: 15, },
    stockContainer: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingTop: 12 },
    stock: { fontSize: 14, fontFamily: 'Poppins-Medium', marginLeft: 8, },
    buttonContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e0e0e0', },
    outOfStockContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 20, },
    outOfStockText: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#e74c3c', },
    buyNowButton: { backgroundColor: '#E50914', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, elevation: 2, flex: 1, marginRight: 10, },
    buyNowText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#ffffff', },
    addToCartButton: { backgroundColor: '#34495e', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, elevation: 2, minWidth: 50, },

    // --- Modal Styles ---
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end',}, // Your original backdrop style
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingHorizontal: 20, width: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.15, shadowRadius: 5, elevation: 10, },
    closeButton: { position: 'absolute', top: 8, right: 0, padding: 5, zIndex: 10, }, // Your close button style
    modalHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 30, },
    modalProductImage: { width: 65, height: 65, borderRadius: 8, marginRight: 15, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f8f8f8', },
    modalProductInfo: { flex: 1, justifyContent: 'center', },
    modalProductName: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#333', marginBottom: 4, },
    modalProductPrice: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#E50914', marginBottom: 4, },
    modalProductStock: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#777', },
    modalSeparator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15, },
    modalSection: { marginBottom: 20, },
    modalSectionTitle:{ fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#444', marginBottom: 12, textAlign: 'left', },
    modalQuantityControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', },
    modalQuantityButton: { padding: 10, },
    modalQuantityText: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#333', minWidth: 50, textAlign: 'center', marginHorizontal: 20, },
    modalButtonDisabled: { opacity: 0.4, },
    modalProceedButton: { backgroundColor: '#E50914', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10, },
    modalProceedButtonText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#ffffff', },
});

export default ProductDetails;