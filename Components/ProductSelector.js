import React from 'react'
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native'

const ProductSelector = ({ category, products, onSelect, isSelected }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>{category}</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelectedProduct = isSelected?.id === item.id;
          return (
            <View style={styles.productRow}>
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>₱{parseFloat(item.price).toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.selectButton,
                  isSelectedProduct ? styles.selectedButton : {},
                ]}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.selectButtonText}>
                  {isSelectedProduct ? 'Unselect' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 5,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    color: '#333',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 6,
    resizeMode: 'cover',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  price: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#E50914',
  },
  selectButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#E50914',
    borderRadius: 4,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  selectedButton: {
    backgroundColor: '#555', // Change the button color when selected
  },
})

export default ProductSelector;
