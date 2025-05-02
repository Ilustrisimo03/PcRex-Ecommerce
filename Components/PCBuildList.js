import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import productsData from '../Screens/Products.json'; // <-- VERIFY PATH
import ProductSelector from './ProductSelector'; // <-- VERIFY PATH
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- List the TYPES for the builder (No change needed here) ---
const pcBuilderTypes = [
    'Processor', 'Motherboard', 'RAM', 'SSD Drive', 'Graphics Card',
    'PC Case', 'Power Supply Unit', 'Cooling Fan', 'Sound Card', 'WiFi Card'
];
const availableTypes = pcBuilderTypes;
// --- ---

const PCBuildList = ({ selectedComponents, handleSelect, toggleCategory, expandedCategories, }) => {

  // Render header function (no logic change, only style applied below)
  const renderCategoryHeader = (typeName, isCategoryExpanded) => {
    return (
      <TouchableOpacity
        style={styles.categoryHeader} // Use updated style
        onPress={() => toggleCategory(typeName)}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryTitle}>{typeName}</Text> {/* Use updated style */}
        <Icon
          name={isCategoryExpanded ? 'chevron-up' : 'chevron-down'}
          size={24} // Slightly smaller icon
          color="#fff"
        />
      </TouchableOpacity>
    );
  };

  // FlatList and renderItem logic remain the same
  return (
    <FlatList
      data={availableTypes}
      keyExtractor={(typeName) => typeName}
      renderItem={({ item: typeName }) => {
        const isCategoryExpanded = expandedCategories[typeName];
        const categoryProducts = productsData.filter( product => product.type === typeName );

        return (
          <View style={styles.categorySection}> {/* Use updated style */}
            {renderCategoryHeader(typeName, isCategoryExpanded)}
            {isCategoryExpanded && (
              <View style={styles.productSelectorContainer}> {/* Style remains same */}
                {categoryProducts.length > 0 ? (
                  <ProductSelector
                    products={categoryProducts}
                    onSelect={(product) => handleSelect(typeName, product)}
                    selectedProduct={selectedComponents[typeName]}
                  />
                ) : (
                  <Text style={styles.noProductsText}>
                    No products found for type '{typeName}'. Check JSON data or type list.
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      }}
      // Separator adjusted slightly
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />} // Reduce space between categories
      scrollEnabled={false}
    />
  );
};

// --- MINIMIZED STYLES ---
const styles = StyleSheet.create({
    categorySection: {
        marginBottom: 8, // Reduced space between sections
        backgroundColor: '#fff',
        borderRadius: 6, // Slightly less rounded corners
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0', // Lighter border
         // Add a subtle shadow to the section instead of the header
        shadowColor: "#ccc",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.18,
        shadowRadius: 1.5,
        elevation: 1.5,
    },
    categoryHeader: {
        paddingVertical: 10, // Reduced vertical padding
        paddingHorizontal: 14, // Reduced horizontal padding
        backgroundColor: '#E50914',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryTitle: {
        fontFamily: 'Poppins-Medium', // Medium weight might be enough
        fontSize: 14, // Reduced font size
        color: '#fff',
        flexShrink: 1,
        marginRight: 8, // Reduced margin
    },
    productSelectorContainer: {
        paddingTop: 5, // Reduce top padding slightly
        paddingBottom: 0, // Remove bottom padding if ProductSelector items have margin
        paddingHorizontal: 5, // Reduce horizontal padding slightly
        backgroundColor: '#fff',
    },
    noProductsText: {
        textAlign: 'center',
        color: '#888',
        paddingVertical: 15, // Reduced padding
        fontFamily: 'Poppins-Regular',
        fontSize: 13, // Slightly smaller text
    },
});

export default PCBuildList;