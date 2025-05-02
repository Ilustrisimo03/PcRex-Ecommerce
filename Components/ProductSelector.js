import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Reusable Product Item Card ---
const ProductItem = ({ item, isSelected, onSelect }) => {
  // Basic validation remains the same
  if (!item || !item.name || item.price === undefined) { return null; }

  // Formatting functions remain the same
  const formattedPrice = () => {
     const priceNum = parseFloat(item.price);
     return isNaN(priceNum) ? 'N/A' : priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const getImageUrl = () => {
    if (item.images && Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string' && item.images[0].startsWith('http')) {
      return item.images[0];
    }
    return null;
  };
  const imageUrl = getImageUrl();

  return (
    // Apply new styles to TouchableOpacity and conditionally add selected style
    <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]} // Use updated styles
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
    >
      {/* Image with updated style */}
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />
      )}
      {!imageUrl && ( // Optional: Placeholder if no image
          <View style={[styles.productImage, styles.imagePlaceholder]}>
              <Icon name="image-off-outline" size={20} color="#ccc"/>
          </View>
      )}

      {/* Info container */}
      <View style={styles.infoContainer}>
        {/* Text with updated styles */}
        <Text style={[styles.productName, isSelected && styles.selectedText]} numberOfLines={2}>
            {item.name}
        </Text>
        <Text style={[styles.productPrice, isSelected && styles.selectedText]}>
            ₱{formattedPrice()}
        </Text>
      </View>

      {/* Selection indicator using Icon */}
      <View style={styles.selectionIndicator}>
        <Icon
            name={isSelected ? "check-circle" : "radiobox-blank"} // Using radio button style for selection
            size={24} // Keep icon size reasonable
            color={isSelected ? "#E50914" : "#d0d0d0"} // Theme color when selected, lighter gray otherwise
        />
      </View>
    </TouchableOpacity>
  );
};
// --- ---

// --- Main ProductSelector Component ---
const ProductSelector = ({ products, onSelect, selectedProduct }) => {
  // renderProductItem and component logic remain the same
  const renderProductItem = ({ item }) => {
    const isSelected = selectedProduct?.id === item.id;
    return ( <ProductItem item={item} isSelected={isSelected} onSelect={onSelect} /> );
  };

  if (!products || !Array.isArray(products)) { return <Text style={styles.errorText}>Error loading products.</Text>; }
  if (products.length === 0) { return null; } // Handled by parent

  return (
    <FlatList
      data={products}
      renderItem={renderProductItem}
      keyExtractor={(item) => item && item.id !== undefined ? item.id.toString() : `product-${Math.random()}`}
      scrollEnabled={true}
      contentContainerStyle={styles.listContainer}
      // Remove separator for a cleaner look, rely on card margin
      // ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

// --- MODERNIZED AND MINIMIZED STYLES ---
const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 5, // Minimal padding for the list itself
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10, // Slightly more rounded
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 10, // Reduced horizontal padding
    marginBottom: 8, // Reduced space between cards
    borderWidth: 1, // Thin border
    borderColor: '#efefef', // Lighter default border
    // Use a more subtle shadow
    shadowColor: "#bdbdbd",
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.15,
    shadowRadius: 3.0,
    elevation: 2, // Minimal elevation for Android
  },
  selectedCard: {
    borderColor: '#FFD4D7', // Lighter red border for selected
    backgroundColor: '#FFF8F8', // Very subtle pink/red tint background
  },
  productImage: {
    width: 45, // Slightly smaller image
    height: 45,
    borderRadius: 6, // Keep rounded corners
    marginRight: 10, // Slightly reduced space
    backgroundColor: '#f8f8f8', // Lighter placeholder background
  },
   imagePlaceholder: { // Style for the placeholder view
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13, // Slightly smaller font
    color: '#222', // Darker text
    marginBottom: 1, // Minimal space between lines
    lineHeight: 18, // Adjust line height for smaller font
  },
  productPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13, // Slightly smaller font
    color: '#E50914', // Keep theme color
  },
  selectedText: {
    // Color doesn't need to change much if background/border indicate selection
    // color: '#C70039', // Optional darker red text if desired
  },
  selectionIndicator: {
    marginLeft: 8, // Reduced space
    padding: 4, // Padding around icon if needed
    justifyContent: 'center', // Center icon vertically
    alignItems: 'center',     // Center icon horizontally
  },
  errorText: {
      textAlign: 'center',
      color: 'red',
      paddingVertical: 20,
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
  },
  // separator: { // Removed separator for cleaner look
  //   height: 1,
  //   backgroundColor: '#f5f5f5',
  // }
});

export default ProductSelector;