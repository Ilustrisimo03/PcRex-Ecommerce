import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon

// --- CHANGE 1: Rename prop from isSelected to selectedProduct ---
const ProductSelector = ({ category, products, onSelect, selectedProduct }) => {
  return (
    // Remove the container View and categoryTitle if PCBuildList already handles the header
    // <View style={styles.container}>
    //   <Text style={styles.categoryTitle}>{category}</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false} // Keep this
        // Add some padding if needed, or handle in parent
        // contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => {
          // --- CHANGE 2: Use selectedProduct for checking selection ---
          // Check if the current item 'item' is the same as the 'selectedProduct' passed via props
          const isCurrentlySelected = selectedProduct?.id === item.id;
          // --- End Change ---

          return (
            <TouchableOpacity // Make the whole row pressable
                style={styles.productRowContainer}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
            >
              <View style={[styles.productRow, isCurrentlySelected ? styles.selectedRow : null]}>
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.image}
                    // Add default source or placeholder maybe?
                  />
                  <View style={styles.info}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.price}>₱{parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  {/* Use an Icon for selection indicator instead of a button */}
                  <View style={styles.selectIndicator}>
                    <Icon
                        name={isCurrentlySelected ? "check-circle" : "circle-outline"}
                        size={26}
                        color={isCurrentlySelected ? "#28a745" : "#ccc"} // Green when selected, gray otherwise
                    />
                  </View>
                  {/* Original Button (can be removed if Icon indicator is preferred) */}
                  {/*
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      isCurrentlySelected ? styles.selectedButton : {},
                    ]}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={styles.selectButtonText}>
                      {isCurrentlySelected ? 'Selected' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                   */}
              </View>
            </TouchableOpacity>
          );
        }}
        // Add separator for better visual distinction
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    // </View>
  );
}

// --- Updated Styles ---
const styles = StyleSheet.create({
  // Removed container and categoryTitle styles as they might be redundant if handled by PCBuildList

  productRowContainer: { // Container for the pressable row
    // Add styling if needed, e.g., margins
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // More vertical padding
    paddingHorizontal: 8, // Horizontal padding
    backgroundColor: '#fff', // Ensure white background
  },
  selectedRow: {
    backgroundColor: '#e9f5ea', // Light green background when selected
  },
  image: {
    width: 55, // Slightly smaller image
    height: 55,
    borderRadius: 6,
    resizeMode: 'contain', // Use contain to see the whole image
    marginRight: 12,
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  info: {
    flex: 1, // Take remaining space
    justifyContent: 'center', // Center text vertically
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 2, // Space between name and price
  },
  price: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#E50914', // Brand color for price
  },
  selectIndicator: { // Style for the icon indicator
    paddingLeft: 10, // Space from the info text
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: { // Style for the separator line
      height: 1,
      backgroundColor: '#f0f0f0', // Light gray separator
      // Add marginHorizontal if padding is applied to productRow
  },
  // Removed selectButton and related styles as Icon indicator is preferred
  /*
  selectButton: {
    paddingVertical: 6, // Adjusted padding
    paddingHorizontal: 12,
    backgroundColor: '#E50914',
    borderRadius: 15, // Pill shape
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  selectedButton: {
    backgroundColor: '#28a745', // Green when selected
  },
  */
});

export default ProductSelector;