import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import ProductCard from '../Components/ProductCard';

const ProductList = ({ products }) => {
  // Function to render products in 2-column layout
  const renderProductRows = () => {
    let rows = [];
    for (let i = 0; i < products.length; i += 2) {
      // Grab two products at a time
      const rowItems = products.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.row}>
          {rowItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </View>
      );
    }
    return rows;
  };

  return (  
    <ScrollView 
    contentContainerStyle={styles.container}  
    showsVerticalScrollIndicator={false}  // Hide the vertical scroll bar
    showsHorizontalScrollIndicator={false} // Hide horizontal scroll bar (optional)
    >
      <Text style={styles.title}>Featured Products</Text>
      {/* Render the products in rows */}
      {renderProductRows()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,  // Space between rows
  },
});

export default ProductList;
