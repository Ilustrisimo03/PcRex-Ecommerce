import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import products from '../Screens/Products.json';
import ProductSelector from './ProductSelector';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const categories = ['Components', 'Peripherals', 'Accessories', 'Furniture', 'Built PC'];

const PCBuildList = ({
  selectedComponents,
  handleSelect,
  toggleCategory,
  expandedCategories,
}) => {
  const renderCategoryHeader = (category, isCategoryExpanded) => {
    return (
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(category)}
      >
        <Text style={styles.categoryTitle}>{category}</Text>
        <Animated.View style={styles.toggleIcon}>
          <Icon
            name={isCategoryExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#fff"
            style={isCategoryExpanded ? styles.iconRotated : null}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item}
      renderItem={({ item: category }) => {
        const filtered = products.filter(p => p.category.name === category);
        const isCategoryExpanded = expandedCategories[category];

        return (
          <View style={styles.categoryContainer}>
            {/* Category Header */}
            {renderCategoryHeader(category, isCategoryExpanded)}

            {/* Show products if the category is expanded */}
            {isCategoryExpanded && (
              <ProductSelector
                key={category}
                category={category}
                products={filtered}
                onSelect={(product) => handleSelect(category, product)}
                isSelected={selectedComponents[category]}
              />
            )}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E50914', 
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  toggleIcon: {
    transform: [{ rotate: '0deg' }],
  },
  iconRotated: {
    transform: [{ rotate: '180deg' }],
  },
});

export default PCBuildList;
