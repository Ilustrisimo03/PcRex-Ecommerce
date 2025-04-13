import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Products from '../Screens/Products.json';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // spacing + 2 cards

const Product = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.price}>₱{item.price}</Text>
      <Text style={styles.rating}>Rating: {item.rate}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#E50914" />
        </TouchableOpacity>
        <Text style={styles.title}>All Products</Text>
      </View>

      <FlatList
        data={Products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Product;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    color: '#E50914',
    fontFamily: 'Poppins-Medium',
  },
  rating: {
    fontSize: 11,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  description: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 2,
  },
});
