import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const categoryIcons = {
  Accessories: 'usb',
  'Built PC': 'desktop-classic',
  Component: 'memory',
  Furniture: 'desk',
  Peripherals: 'keyboard',
  Default: 'tag',
};

const CategoryList = ({ categories, onSelectCategory }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((categoryName) => {
          const iconName = categoryIcons[categoryName] || categoryIcons.Default;
          return (
            <TouchableOpacity
              key={categoryName}
              style={styles.categoryItem}
              onPress={() => onSelectCategory(categoryName)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <Icon name={iconName} size={24} color="#E50914" />
              </View>
              <Text style={styles.categoryText} numberOfLines={1}>
                {categoryName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    paddingLeft: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 12,
    color: '#111',
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    width: 80,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    textAlign: 'center',
  },
});

export default CategoryList;
