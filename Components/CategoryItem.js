import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CategoryItem = ({ name, icon }) => {
  return (
    <TouchableOpacity style={styles.categoryItem}>
      <Icon name={icon} size={24} color="#E50914" />
      <Text style={styles.categoryText}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E50914',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginRight: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  categoryText: {
    color: '#E50914',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default CategoryItem;
