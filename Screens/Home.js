import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Button, Animated, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';


const categories = ['Mice', 'Keyboards', 'PC Cases', 'Graphics Cards', 'Processors', 'Motherboards', 'Power Supplies', 'Chairs'];



const { width } = Dimensions.get('window');

// Sidebar Component
const Sidebar = ({ isVisible, toggleSidebar }) => {
  const sidebarWidth = isVisible ? 200 : 0;  // Sidebar width toggles between 0 and 250
  const sidebarOpacity = isVisible ? 1 : 0; // Sidebar opacity toggles between 1 (visible) and 0 (hidden)
  const sidebarPosition = isVisible ? 'absolute' : 'absolute'; // Sidebar stays positioned as absolute but can be hidden off-screen
  const navigation = useNavigation();
  const [hoveredItem, setHoveredItem] = useState('');

  const handlePress = (screen) => {
    setHoveredItem(screen); // Set the hovered item when pressed
    navigation.navigate(screen); // Navigate to the corresponding screen
  };

  return (
    <Animated.View 
      style={[styles.sidebar, { 
        width: sidebarWidth,
        opacity: sidebarOpacity, // Opacity control
        transform: [{ translateX: isVisible ? 0 : -250 }] // Move the sidebar off-screen when hidden
      }]}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.closeButton}>
        <Icon name="close" size={30} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => handlePress('Home')}
        style={[styles.sidebarButton, hoveredItem === 'Home' && styles.hovered]}>
        <Text style={[styles.sidebarItem, hoveredItem === 'Home' && styles.hoveredText]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => handlePress('Products')}
        style={[styles.sidebarButton, hoveredItem === 'Products' && styles.hovered]}>
        <Text style={[styles.sidebarItem, hoveredItem === 'Products' && styles.hoveredText]}>
          Products
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => handlePress('Cart')}
        style={[styles.sidebarButton, hoveredItem === 'Cart' && styles.hovered]}>
        <Text style={[styles.sidebarItem, hoveredItem === 'Cart' && styles.hoveredText]}>
          My Cart
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => handlePress('Build a PC')}
        style={[styles.sidebarButton, hoveredItem === 'Build a PC' && styles.hovered]}>
        <Text style={[styles.sidebarItem, hoveredItem === 'Build a PC' && styles.hoveredText]}>
          Build a PC
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => handlePress('Account')}
        style={[styles.sidebarButton, hoveredItem === 'Account' && styles.hovered]}>
        <Text style={[styles.sidebarItem, hoveredItem === 'Account' && styles.hoveredText]}>
          Account
        </Text>
      </TouchableOpacity>                      
    </Animated.View>
  );
};

const Home = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);  // Sidebar is hidden initially

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible); // Toggle sidebar visibility
  };

  const [fontsLoaded, setFontsLoaded] = useState(false);
  
    // Load custom font
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
  
    if (!fontsLoaded) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Sidebar isVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />

      {/* Main Scrollable Content */}
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.burgerIcon}>
            <Icon name="menu" size={30} color="#000" />
          </TouchableOpacity>

          <TextInput placeholder="Search..." style={styles.searchBar} />

          <TouchableOpacity style={styles.notificationIcon}>
            <Icon name="bell-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroText}>Your Ultimate PC Experience</Text>
          <Text style={styles.heroDescription}>Find the perfect computer or build your own with our custom PC service.</Text>
          
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product List */}

        <ScrollView vertical showsVerticalScrollIndicator={false}>
          <ProductList products={products} />
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingText: {
    color: '#E50914',
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  heroSection: {
    backgroundColor: '#E50914',
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    marginBottom: 5,
  },
  heroDescription: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  notificationIcon: {
    marginLeft: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    backgroundColor: '#E50914',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#E50914',  // Darker, modern background
    zIndex: 10,
    paddingTop: 50,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,  // Add space at the bottom for a better overall look
    width: '100%',  // Set the sidebar width
    
  },
  sidebarButton: {
    marginVertical: 10,  // Space between items
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 12,  // Rounded corners for buttons
    backgroundColor: '#333',  // Dark background for items
    marginBottom: 0,  // Space between buttons
    transition: 'background-color 0.3s',  // Smooth transition for hover effect (works on web)
  },
  sidebarItem: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#fff',  // Default text color is white
    textAlign: 'left',
    
  },
  
  closeButton: {
    marginBottom: 20,
  },
 
 
});

export default Home;
