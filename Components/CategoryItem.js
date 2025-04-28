import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const CategoryItem = ({ name, icon }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('CategoryList', { category: name });
  };

  return (
    <TouchableOpacity style={styles.categoryItem} onPress={handlePress}>
      <LinearGradient
        colors={['#E50914', '#C70039']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconBackground}
      >
        <Icon name={icon} size={24} color="#fff" />
      </LinearGradient>
      <Text style={styles.categoryText}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    backgroundColor: '#fff', // white background
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0', // soft gray border
    
  },
  iconBackground: {
    padding: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    color: '#1a1a1a', // dark text for white bg
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
});

export default CategoryItem;
