import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Keep icon mapping (adjust icons as needed for your specific categories)
const categoryIcons = {
  Accessories: 'headset', // Changed example icon
  'Built PC': 'desktop-classic',
  Components: 'memory', // Corrected spelling if needed
  Furniture: 'table',     // Changed example icon
  Peripherals: 'mouse', // Changed example icon
  Default: 'tag-outline', // Changed default icon
};

const CategoryList = ({ categories, onSelectCategory }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Title with slightly different styling */}
      <Text style={styles.title}>Shop by Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} // Added style for content padding
      >
        {categories.map((categoryName) => {
          // Ensure categoryName is a string before accessing categoryIcons
          const nameStr = String(categoryName);
          const iconName = categoryIcons[nameStr] || categoryIcons.Default;

          return (
            <TouchableOpacity
              key={nameStr} // Use the string name as key
              style={styles.categoryItem} // Use updated item style
              onPress={() => onSelectCategory(nameStr)}
              activeOpacity={0.7} // Slightly less opacity change on press
            >
              {/* Updated Icon Wrapper */}
              <View style={styles.iconWrapper}>
                <Icon name={iconName} size={26} color="#E50914" /> {/* Icon color matches theme */}
              </View>
              {/* Updated Text Style */}
              <Text style={styles.categoryText} numberOfLines={1}>
                {nameStr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
  container: {
    marginTop: 25, // More space above
    marginBottom: 15,
    // Removed paddingLeft, handle spacing with scrollContent
  },
  title: {
    fontSize: 20, // Slightly smaller title, more modern feel
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 15, // More space below title
    color: '#000', // Darker title color
    paddingHorizontal: 16, // Add padding to the title itself
  },
  scrollContent: {
    paddingHorizontal: 16, // Add horizontal padding to the scroll container
    paddingVertical: 5, // Add some vertical padding for shadow/visuals
  },
  categoryItem: {
    alignItems: 'center',
    // Removed justify content, align items handles it
    marginRight: 14, // Adjust spacing between items
    width: 75, // Slightly narrower items
  },
  iconWrapper: {
    backgroundColor: '#FFF0F1', // Lighter, softer background tint (adjust as needed)
    borderRadius: 28, // Make it circular (half of width/height)
    width: 56, // Fixed width for circle
    height: 56, // Fixed height for circle
    marginBottom: 8, // Increase space between icon and text
    justifyContent: 'center',
    alignItems: 'center',
    // Removed border for a cleaner look
    // Optional: Add subtle shadow for depth
    shadowColor: "#E50914",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.00,
    elevation: 3, // Elevation for Android shadow
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular', // Regular weight for less emphasis than title
    color: '#444', // Slightly lighter text color
    textAlign: 'center',
  },
});

export default CategoryList;