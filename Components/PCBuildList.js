import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// --- CHANGE 1: Import structured data ---
import productsData from '../Screens/Products.json';
import ProductSelector from './ProductSelector'; // Assuming ProductSelector is correctly implemented
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- CHANGE 2: Get categories from the data keys ---
const availableCategories = Object.keys(productsData);

const PCBuildList = ({
  selectedComponents,
  handleSelect,
  toggleCategory,
  expandedCategories,
}) => {
  // Function to render the collapsible header for each category
  const renderCategoryHeader = (category, isCategoryExpanded) => {
    // Optional: Get a representative icon for the category if needed
    // const iconName = categoryIconMap[category] || 'help-circle-outline';

    return (
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(category)}
        activeOpacity={0.7} // Add feedback on press
      >
        {/* Optional: Add icon <Icon name={iconName} size={20} color="#fff" style={{ marginRight: 8 }} /> */}
        <Text style={styles.categoryTitle}>{category}</Text>
        {/* Animated chevron might need state/animation setup, simplified here */}
        <Icon
          name={isCategoryExpanded ? 'chevron-up' : 'chevron-down'}
          size={28} // Slightly larger icon
          color="#fff"
        />
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      // --- CHANGE 2 (cont.): Use derived categories ---
      data={availableCategories}
      keyExtractor={(item) => item} // Category name is the key
      renderItem={({ item: category }) => {
        // --- CHANGE 3: Access products directly for the category ---
        // Get the list of products for the current category directly from the structured data
        // Add a check in case the category somehow doesn't exist in the data
        const categoryProducts = productsData[category] || [];
        // --- End Change ---

        // Check if the current category should be expanded
        const isCategoryExpanded = expandedCategories[category];

        return (
          <View style={styles.categorySection}>
            {/* Render the clickable category header */}
            {renderCategoryHeader(category, isCategoryExpanded)}

            {/* Conditionally render the ProductSelector only if the category is expanded */}
            {isCategoryExpanded && (
              <View style={styles.productSelectorContainer}>
                {/* Check if there are products in this category */}
                {categoryProducts.length > 0 ? (
                  <ProductSelector
                    // Pass the specific products for this category
                    products={categoryProducts}
                    // Pass the callback function for when a product is selected
                    onSelect={(product) => handleSelect(category, product)}
                    // Pass the currently selected product for this category (if any)
                    // Use optional chaining just in case selectedComponents[category] is undefined initially
                    selectedProduct={selectedComponents[category]}
                  />
                ) : (
                  // Display a message if no products are found for this category
                  <Text style={styles.noProductsText}>
                    No products available in this category.
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      }}
      // Optional: Add some spacing between category sections if needed
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    />
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  categorySection: { // Renamed from categoryContainer
    marginBottom: 10, // Space between categories
    backgroundColor: '#fff', // White background for the section containing header and selector
    borderRadius: 8, // Rounded corners for the whole section
    overflow: 'hidden', // Keep content within rounded corners
    borderWidth: 1,
    borderColor: '#eee', // Subtle border
  },
  categoryHeader: {
    paddingVertical: 15, // Increased padding
    paddingHorizontal: 16,
    backgroundColor: '#E50914', // Keep brand color
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Removed shadow and margin from header, applied border to categorySection instead
    // Removed borderRadius from header as it's applied to categorySection
  },
  categoryTitle: {
    fontFamily: 'Poppins-SemiBold', // Keep font
    fontSize: 16, // Slightly smaller title for better fit
    color: '#fff', // White text
    flexShrink: 1, // Allow text to shrink if needed
    marginRight: 10, // Space between text and icon
  },
  productSelectorContainer: {
    padding: 10, // Add padding around the product selector component
    backgroundColor: '#fff', // Ensure background is white
  },
  noProductsText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
   // Removed icon styles as the simple Icon component is used directly
});

export default PCBuildList;