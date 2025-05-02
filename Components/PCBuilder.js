import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { CartContext } from '../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PCBuildList from '../Components/PCBuildList'; // Assuming this path is correct
import { useNavigation } from '@react-navigation/native';

const PCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState({});
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const { addMultipleToCart } = useContext(CartContext);
  const navigation = useNavigation();

  // --- REUSABLE FUNCTION TO LOAD SAVED BUILD ---
  const loadSavedBuild = async (showFeedback = false) => {
    try {
      const savedBuildString = await AsyncStorage.getItem('savedBuild');
      if (savedBuildString) {
        const loadedBuild = JSON.parse(savedBuildString);
        setSelectedComponents(loadedBuild); // Update the state with the loaded build
        if (showFeedback) {
          Alert.alert("Build Loaded", "Your saved PC build configuration has been loaded successfully.");
        }
        return true; // Indicate success
      } else {
        // Only show feedback if explicitly requested and no build was found
        if (showFeedback) {
          Alert.alert("No Saved Build", "Could not find a previously saved build configuration. Use the save button to save your current selections.");
        }
        // If loading silently (e.g., on mount) and nothing is found, don't show an alert, just clear state potentially
        // else {
        //   setSelectedComponents({}); // Optional: clear state if loading silently and nothing found
        // }
        return false; // Indicate no build found
      }
    } catch (error) {
      console.error("Failed to load saved build", error);
      if (showFeedback) {
        Alert.alert("Error Loading Build", "An error occurred while trying to load your saved build.");
      }
      // Consider clearing state on error during load?
      // setSelectedComponents({});
      return false; // Indicate failure
    }
  };
  // --- END REUSABLE FUNCTION ---

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Font.loadAsync({
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
        });
        setFontsLoaded(true);
        // Load saved build silently on initial mount
        await loadSavedBuild(false);
      } catch (fontError) {
        console.error("Error loading fonts", fontError);
        setFontsLoaded(true); // Allow app to proceed
      }
    };

    loadInitialData();
  }, []);

  const handleSelect = (category, product) => {
    setSelectedComponents(prev => {
      const isCurrentlySelected = prev[category]?.id === product.id;
      const updated = {
        ...prev,
        [category]: isCurrentlySelected ? null : product, // Toggle selection/unselection
      };
      // NOTE: Auto-save is NOT enabled here. Saving only happens via the Save button.
      return updated;
    });
  };

  const saveBuild = async (buildToSave) => {
    const currentBuild = buildToSave || selectedComponents;
    try {
      // Only save if there are actually components selected
      if (Object.values(currentBuild).some(item => item !== null)) {
          await AsyncStorage.setItem('savedBuild', JSON.stringify(currentBuild));
          return true; // Indicate save success
      } else {
          // If trying to save an empty build explicitly via button, maybe clear storage? Or just prevent?
          // For now, let's prevent saving an empty build via the button (handled in handleSaveBuild)
          // but allow clearing via handleUnselectAll/handleAddToCart if needed (though we removed it based on request)
          // Alternative: could clear storage if saveBuild is called with empty object?
          // await AsyncStorage.removeItem('savedBuild'); // Option: clear storage if saving empty
          console.log("Attempted to save an empty build. Save skipped.");
          return false; // Indicate nothing was saved because it was empty
      }
    } catch (error) {
      console.error("Failed to save build", error);
      Alert.alert("Error Saving", "Could not save the build configuration.");
      return false; // Indicate save failure
    }
  };


  const calculateTotal = () => {
    return Object.values(selectedComponents)
                 .filter(item => item !== null && item?.price)
                 .reduce((sum, item) => {
                    const price = parseFloat(item.price);
                    return sum + (isNaN(price) ? 0 : price);
                 }, 0);
    };

    // --- MODIFIED: handleUnselectAll ---
    const handleUnselectAll = () => {
        Alert.alert(
        "Clear Current Selections", // Changed wording slightly
        "Are you sure you want to remove all currently selected components? This will NOT delete your previously saved build.", // Clarify it doesn't delete saved build
        [
            { text: "Cancel", style: "cancel" },
            {
            text: "Yes, Clear Selections",
            onPress: () => {
                setSelectedComponents({}); // Clear only the current state
                // await saveBuild({}); // <<<< REMOVED THIS LINE >>>>
            },
            style: "destructive",
            },
        ]
        );
    };
    // --- END MODIFICATION ---

    const handleSaveBuild = async () => {
        const buildToSave = selectedComponents;
        const savedBuildItems = Object.values(buildToSave).filter(item => item !== null);

        if (savedBuildItems.length > 0) {
          const success = await saveBuild(buildToSave); // Await the save operation
          if (success) {
            Alert.alert(
              "Build Saved",
              "Your current component selections have been saved locally. You can load them later using the load button.", // Added info
              [{ text: "OK" }]
            );
          }
          // Error alert is handled within saveBuild if saving fails
          // If saveBuild returns false because build was empty, maybe show alert? (though button is disabled)
        } else {
          // This case should technically not be reachable if button is disabled when no selection
          Alert.alert("No Components", "Please select at least one component to save the build.", [{ text: "OK" }]);
        }
    };

    const handleLoadBuild = async () => {
        Alert.alert(
            "Load Saved Build",
            "This will replace your current selections with the previously saved build. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Load Build",
                    onPress: () => {
                        // Call the reusable load function and show feedback alerts
                        loadSavedBuild(true);
                    },
                },
            ]
        );
    };

    const renderSummary = () => {
        const selectedCategories = Object.keys(selectedComponents)
                                    .filter(category => selectedComponents[category] !== null);

        if (selectedCategories.length === 0) {
            return <Text style={styles.noSelectionText}>No components selected yet.</Text>;
        }
        selectedCategories.sort();

        return selectedCategories.map(category => {
            const item = selectedComponents[category];
            if (!item || !item.name || item.price === undefined) return null;

            return (
            <View key={category} style={styles.summaryRow}>
                <Text style={styles.categoryLabel}>{category}</Text>
                <Text style={styles.selectedItem} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                ₱{parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
            </View>
            );
        });
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    // --- MODIFIED: handleAddToCart ---
    const handleAddToCart = () => {
        const selectedItems = Object.values(selectedComponents).filter(item => item !== null);
        if (selectedItems.length === 0) {
        Alert.alert("Empty Build", "Please select components before adding to cart.");
        return;
        }

        addMultipleToCart(selectedItems);
        Alert.alert(
        "Added to Cart",
        `${selectedItems.length} component(s) have been added to your cart.`,
        [
            {
            text: "Clear Selections & Continue", // Changed wording
            onPress: () => { // No longer async needed here
                setSelectedComponents({}); // Clear only the current state
                // await saveBuild({}); // <<<< REMOVED THIS LINE >>>>
            }
            },
            {
            text: "Keep Building",
            style: "cancel"
            }
        ]
        );
    };
    // --- END MODIFICATION ---

  // --- Rest of the component (Loading indicator, JSX structure) remains the same ---

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading Builder...</Text>
      </View>
    );
  }

  const hasSelection = Object.values(selectedComponents).some(item => item !== null);

  return (
    <View style={styles.outerContainer}>
       <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={26} color="#333" />
            </TouchableOpacity>
            <Text style={styles.header}>Build Your PC</Text>
            <View style={styles.headerButtons}>
                <TouchableOpacity onPress={handleLoadBuild} style={[styles.iconButton, styles.loadButton]}>
                    <Icon name="folder-open-outline" size={18} color="#fff" />
                </TouchableOpacity>
                {hasSelection && (
                    <TouchableOpacity onPress={handleUnselectAll} style={styles.iconButton}>
                        <Icon name="delete-sweep-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleSaveBuild} style={[styles.iconButton, styles.saveButton, !hasSelection && styles.disabledButton]} disabled={!hasSelection}>
                    <Icon name="content-save-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.categorySelectionTitle}>Select Components</Text>

        <PCBuildList
          selectedComponents={selectedComponents}
          handleSelect={handleSelect}
          toggleCategory={toggleCategory}
          expandedCategories={expandedCategories}
        />

         {hasSelection && (
          <>
            <Text style={styles.summaryTitle}>Build Summary</Text>
            <View style={styles.summaryContainer}>
              {renderSummary()}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>
                  ₱{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Icon name="cart-plus" size={20} color="#fff" style={{ marginRight: 8 }}/>
              <Text style={styles.addToCartButtonText}>Add Selected to Cart</Text>
            </TouchableOpacity>
          </>
        )}

         {!hasSelection && (
             <View style={styles.noSelectionContainer}>
                 <Icon name="information-outline" size={24} color="#888"/>
                <Text style={styles.noSelectionInfoText}>
                    Select components from the categories above or load a previously saved build using the <Icon name="folder-open-outline" size={14} color="#888" /> button.
                </Text>
             </View>
         )}

      </ScrollView>
    </View>
  );
};

// --- Styles remain the same ---
const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: 230,
        backgroundColor: '#f1f1f1',
    },
    
    scrollViewContent: {
        paddingBottom: 30, // Ensure space at the bottom
        paddingHorizontal: 16,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingBottom: 15,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
        marginRight: 5,
    },
    header: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        textAlign: 'center',
        flex: 1,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        marginLeft: 6,
        backgroundColor: '#E50914', // Clear button color
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 36,
        minHeight: 36,
    },
    loadButton: {
        backgroundColor: '#007bff', // Blue for load
        marginLeft: 0,
        marginRight: 6,
    },
    saveButton: {
        backgroundColor: '#28a745', // Green for save
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        opacity: 0.7,
    },
    categorySelectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
        marginTop: 20,
    },
    summaryTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        marginTop: 30,
        marginBottom: 15,
        textAlign: 'center',
    },
    summaryContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#555',
        flex: 0.3,
    },
    selectedItem: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#333',
        flex: 0.45,
        textAlign: 'left',
        paddingHorizontal: 5,
    },
    itemPrice: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        color: '#E50914',
        flex: 0.25,
        textAlign: 'right',
    },
    noSelectionText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingVertical: 20,
    },
    totalRow: {
        marginTop: 15,
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
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
    addToCartButton: {
        backgroundColor: '#E50914',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    addToCartButtonText: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
     noSelectionContainer: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    noSelectionInfoText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
});


export default PCBuilder;