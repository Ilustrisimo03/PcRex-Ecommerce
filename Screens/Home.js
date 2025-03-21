import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Animated, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import products from '../Screens/Products.json';
import ProductList from '../Components/ProductList';
import CategoryItem from '../Components/CategoryItem';
import categories from '../Screens/categories.json';




const { width } = Dimensions.get('window');

// Sidebar Component
const Sidebar = ({ isVisible, toggleSidebar, currentScreen }) => {
  const [activeItem, setActiveItem] = useState(currentScreen); // Track active screen
  const sidebarWidth = isVisible ? 200 : 0;  // Sidebar width toggles between 0 and 250
  const sidebarOpacity = isVisible ? 1 : 0; // Sidebar opacity toggles between 1 (visible) and 0 (hidden)
  
  const navigation = useNavigation();
  const [hoveredItem, setHoveredItem] = useState('');

  const handlePress = (screen) => {
    setHoveredItem(screen); // Set the hovered item when pressed
    setActiveItem(screen); // Set the active screen when clicked
    navigation.navigate(screen); // Navigate to the corresponding screen
  };

  return (
    <Animated.View style={[styles.sidebar, { 
      width: sidebarWidth, 
      opacity: sidebarOpacity,
      transform: [{ translateX: isVisible ? 0 : -260 }]
  }]}>

    {/* Back Button */}
    <TouchableOpacity 
        onPress={toggleSidebar} 
        style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#fff" />
    </TouchableOpacity>
    
    {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image 
          source={require('../assets/PCREX1.png')}  // Add your PC Rex logo here
          style={styles.logoImage} 
        />
      </View>
  
    {/* Sidebar Items */}
    
    {/* Home (Active by Default) */}

    {/* Home */}
    <TouchableOpacity onPress={() => handlePress('Home')} 
        style={[styles.sidebarButton, activeItem === 'Home' && styles.hovered]}>
        <Icon name="home" size={20} color={activeItem === 'Home' ? '#fff' : '#E50914'} style={styles.icon} />
        <Text style={[styles.sidebarItem, activeItem === 'Home' && styles.hoveredText]}>Home</Text>
    </TouchableOpacity>
    {/* Products */}
    <TouchableOpacity onPress={() => handlePress('Products')} 
        style={[styles.sidebarButton, activeItem === 'Products' && styles.hovered]}>
        <Icon name="shopping" size={20} color={activeItem === 'Products' ? '#fff' : '#E50914'} style={styles.icon} />
        <Text style={[styles.sidebarItem, activeItem === 'Products' && styles.hoveredText]}>Products</Text>
    </TouchableOpacity>
    {/* Cart */}
    <TouchableOpacity onPress={() => handlePress('Cart')} 
      style={[styles.sidebarButton, hoveredItem === 'Profile' && styles.hovered]}>
      <Icon name="cart" size={20} color={activeItem === 'Cart' ? '#fff' : '#E50914'}  style={styles.icon} />
      <Text style={[styles.sidebarItem, hoveredItem === 'Cart' && styles.hoveredText]}>My Cart</Text>
    </TouchableOpacity>
    {/* Account */}
    <TouchableOpacity onPress={() => handlePress('Account')} 
      style={[styles.sidebarButton, hoveredItem === 'Profile' && styles.hovered]}>
      <Icon name="account" size={20} color={activeItem === 'Account' ? '#fff' : '#E50914'}  style={styles.icon} />
      <Text style={[styles.sidebarItem, hoveredItem === 'Account' && styles.hoveredText]}>Profile</Text>
    </TouchableOpacity>
    {/* divider */}
    <View style={styles.divider} />
    {/* Settings */}
    <TouchableOpacity onPress={() => handlePress('Settings')} 
      style={[styles.sidebarButton, hoveredItem === 'Settings' && styles.hovered]}>
      <Icon name="cog-outline" size={20} color={activeItem === 'Settings' ? '#fff' : '#E50914'} style={styles.icon} />
      <Text style={[styles.sidebarItem, hoveredItem === 'Settings' && styles.hoveredText]}>Settings</Text>
    </TouchableOpacity>
    {/* Logout */}
    <TouchableOpacity onPress={() => handlePress('Logout')} 
      style={[styles.sidebarButton, hoveredItem === 'Logout' && styles.hovered]}>
      <Icon name="logout" size={20} color={activeItem === 'Logout' ? '#fff' : '#E50914'} style={styles.icon} />
      <Text style={[styles.sidebarItem, hoveredItem === 'Logout' && styles.hoveredText]}>Logout</Text>
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
          <Text style={styles.loadingText}>Loading</Text>
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
   
  
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <CategoryItem key={index} name={category.name} icon={category.icon} />
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
    paddingTop: 0, // Tanggalin ang padding sa taas para dikit sa taas
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
    marginTop: 0,
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

  
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'white', 
    zIndex: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: 260,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#E50914',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  logoSection: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 107, 107, 0.5)',
  },

  logoImage: {
    width: 85,       
    height: 85,       
  },

  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
   },
  backButton: {
    position: 'absolute',
    top: '50%',                    // Gitnang posisyon
    transform: [{ translateY: -20 }], // Eksaktong gitna
    right: -20,                    // Lumabas nang kaunti para madaling pindutin
    backgroundColor: '#E50914',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
 },
  sidebarItem: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#E50914',
  },

   hovered: {
    backgroundColor: '#E50914',
    borderRadius: 20,
  },

  hoveredText: {
    color: '#fff',
    },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 107, 107, 0.5)',
    marginVertical: 10,
    },

  icon: {
    marginRight: 12
    }
    
 
});

export default Home;
