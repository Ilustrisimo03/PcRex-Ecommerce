// components/PCBuilder.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import products from '../Screens/Products.json';
import ProductSelector from './ProductSelector';
import * as Font from 'expo-font';
import { CartContext } from '../context/CartContext';

const categories = [
  'Mice', 'Keyboards', 'Processors', 'Motherboard', 'Graphics Cards', 'Power Supplies', 'Networking',
  'PC Cases', 'RAM (Memory)', 'Storage Devices', 'Monitors', 'Speakers', 'Cooling Systems',
];

const PCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState({});
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { addMultipleToCart, cartItems } = useContext(CartContext);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
        'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
      });
      setFontsLoaded(true);
    };
    loadFonts().catch(() => setFontsLoaded(false));
  }, []);

  const handleSelect = (category, product) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: prev[category]?.id === product.id ? null : product,
    }));
  };

  const handleUnselectAll = () => {
    setSelectedComponents({});
  };

  const calculateTotal = () => {
    return Object.values(selectedComponents).reduce((sum, item) => {
      return sum + (parseFloat(item?.price) || 0);
    }, 0);
  };

  const renderSummary = () => {
    return categories
      .filter(category => selectedComponents[category])
      .map(category => {
        const item = selectedComponents[category];
        return (
          <View key={category} style={styles.summaryRow}>
            <Text style={styles.categoryLabel}>{category}</Text>
            <Text style={styles.selectedItem} numberOfLines={1}>
              {item ? item.name : 'None selected'}
            </Text>
          </View>
        );
      });
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={categories}
      keyExtractor={(item) => item}
      ListHeaderComponent={<Text style={styles.header}>Build Your Own PC</Text>}
      renderItem={({ item: category }) => {
        const filtered = products.filter(p => p.category.name === category);
        return (
          <ProductSelector
            key={category}
            category={category}
            products={filtered}
            onSelect={(product) => handleSelect(category, product)}
            isSelected={selectedComponents[category]}
          />
        );
      }}
      ListFooterComponent={
        Object.keys(selectedComponents).length > 0 ? (
          <>
            <Text style={styles.summaryTitle}>Build Summary</Text>
            <View style={styles.summaryContainer}>
              {renderSummary()}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price:</Text>
                <Text style={styles.totalPrice}>
                  ₱{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.buildButton}
              onPress={() => {
                const selectedItems = Object.values(selectedComponents).filter(item => item !== null);
                addMultipleToCart(selectedItems); // Add multiple items at once

                Alert.alert("Success", "All selected components have been added to your cart!");
                setSelectedComponents({});
              }}
            >
              <Text style={styles.buildButtonText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.unselectAllButton}
              onPress={handleUnselectAll}
            >
              <Text style={styles.unselectAllButtonText}>Unselect All</Text>
            </TouchableOpacity>
          </>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    color: '#E50914',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#E50914',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 30,
    marginBottom: 10,
  },
  summaryContainer: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  categoryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  selectedItem: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#111',
    textAlign: 'right',
    flex: 1.2,
  },
  totalRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#222',
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#E50914',
  },
  buildButton: {
    backgroundColor: '#E50914',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buildButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  unselectAllButton: {
    backgroundColor: '#ddd',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  unselectAllButtonText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default PCBuilder;
