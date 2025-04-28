import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { CartContext } from '../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PCBuildList from '../Components/PCBuildList';
import { useNavigation } from '@react-navigation/native';

const categories = ['Components', 'Peripherals', 'Accessories', 'Furniture', 'Built PC'];

const PCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState({});
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const { addMultipleToCart } = useContext(CartContext);
  const navigation = useNavigation();

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
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
      saveBuild(updated);
      return updated;
    });
  };

  const handleUnselectAll = () => {
    setSelectedComponents({});
    saveBuild({});
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
      saveBuild(selectedComponents);
    } else {
      Alert.alert("No Components", "You haven't selected any components.");
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
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
    < >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E50914" />
        </TouchableOpacity>

        <Text style={styles.header}>Build PC</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleUnselectAll} style={styles.iconButton}>
            <Text style={styles.iconText}>Unselect All</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSaveBuild} style={styles.saveButton}>
            <Icon name="content-save" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.CategoryTitle}>Choose a Category</Text>

        <PCBuildList
          selectedComponents={selectedComponents}
          handleSelect={handleSelect}
          toggleCategory={toggleCategory}
          expandedCategories={expandedCategories}
        />

        {Object.keys(selectedComponents).length > 0 && (
          <>
            <Text style={styles.summaryTitle}>Build Summary</Text>
            <View style={styles.summaryContainer}>
              {renderSummary()}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
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
          </>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
    paddingTop: 100,
    paddingBottom: 100,
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#E50914',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginRight: 5,
  },
  iconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  CategoryTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  categoryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#555',
  },
  selectedItem: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#333',
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#E50914',
  },
  buildButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
});

export default PCBuilder;
