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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  categoryText: {
    color: '#333',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});

export default CategoryItem;
