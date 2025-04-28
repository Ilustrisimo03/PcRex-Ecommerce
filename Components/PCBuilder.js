import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import products from '../Screens/Products.json';
import ProductSelector from './ProductSelector';
import * as Font from 'expo-font';
import { CartContext } from '../context/CartContext';

const categories = [
  'Components', 'Peripherals', 'Accessories', 'Furniture', 'Built PC'
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

    const loadSavedBuild = async () => {
      try {
        const savedBuild = await AsyncStorage.getItem('savedBuild');
        if (savedBuild) {
          setSelectedComponents(JSON.parse(savedBuild));
        }
      } catch (error) {
        console.error("Failed to load saved build", error);
      }
    };

    loadFonts();
    loadSavedBuild();
  }, []);

  const handleSelect = (category, product) => {
    setSelectedComponents(prev => {
      const updated = {
        ...prev,
        [category]: prev[category]?.id === product.id ? null : product,
      };
      saveBuild(updated); // Save the updated build
      return updated;
    });
  };

  const handleUnselectAll = () => {
    setSelectedComponents({});
    saveBuild({}); // Save the empty build
  };

  const saveBuild = async (build) => {
    try {
      await AsyncStorage.setItem('savedBuild', JSON.stringify(build));
    } catch (error) {
      console.error("Failed to save build", error);
    }
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

  const handleSaveBuild = () => {
    const savedBuild = Object.values(selectedComponents).filter(item => item !== null);
    if (savedBuild.length > 0) {
      Alert.alert("Build Saved", "Your PC build has been saved!");
      saveBuild(selectedComponents); // Save the current build
    } else {
      Alert.alert("No Components", "You haven't selected any components.");
    }
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
                addMultipleToCart(selectedItems);
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveBuild}
            >
              <Text style={styles.saveButtonText}>Save Build</Text>
            </TouchableOpacity>
          </>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
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
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  header: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#E50914',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  summaryContainer: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  categoryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  selectedItem: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#111',
    textAlign: 'right',
    flex: 1.2,
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#222',
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#E50914',
  },
  buildButton: {
    backgroundColor: '#E50914',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buildButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  unselectAllButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  unselectAllButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});

export default PCBuilder;
