import React, { useState } from "react";
import {View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProductCard from "../Components/ProductCard";
import products from "./Products.json"; // Import product data

const CategoryList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const selectedCategory = route.params?.category;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState(null);
  const [isGridView, setIsGridView] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceFilter, setPriceFilter] = useState([0, 5000]);

  let filteredProducts = products.filter(
    (product) =>
      product.category.name === selectedCategory &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      product.price >= priceFilter[0] &&
      product.price <= priceFilter[1]
  );

  if (sortOption === "lowToHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "highToLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E50914" />
        </TouchableOpacity>
        <Text style={styles.title}>{selectedCategory} Categories</Text>
      </View>

      <View style={styles.searchContainer}>
                  <Icon name="magnify" size={20} color="#000" style={styles.searchIcon} />
                  <TextInput
                          style={styles.searchInput}
                          placeholder="Search products..."
                          placeholderTextColor="#000"
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                  <Icon name="tune" size={20} color="#000" style={styles.filterIcon} />
                </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSortOption(sortOption === "lowToHigh" ? "highToLow" : "lowToHigh")}
        >
          <Icon name="sort" size={20} color="#E50914" />
          <Text style={styles.filterText}>
            {sortOption === "lowToHigh" ? "Price: High to Low" : "Price: Low to High"}
          </Text>
        </TouchableOpacity>

        {/* value={searchQuery}
        onChangeText={setSearchQuery} */}
      </View>

      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("ProductDetails", { product: item })}
              isGridView={isGridView}
              showWishlist
              showCart
              showStockStatus
            />
          )}
          numColumns={isGridView ? 2 : 1}
          columnWrapperStyle={isGridView ? styles.row : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E50914']}  // Set the color of the spinner
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="alert-circle-outline" size={50} color="#E50914" />
          <Text style={styles.emptyText}>No products found in this category.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    color: "#333",
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E50914', // light gray border (you can change this to match your theme)
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    textAlignVertical: 'center', // vertical center (Android only)
    height: 40,                  // ensure fixed height for vertical alignment
    paddingVertical: 0,  
           // remove extra padding if any
  },
  filterIcon: {
    marginLeft: 8,
  },
  filterRow: {
    paddingRight: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E50914",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  filterText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#E50914",
  },
  row: {
    justifyContent: "space-between",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    fontFamily: "Poppins-Medium",
  },

  
});

export default CategoryList;
