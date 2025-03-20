import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>PC Rex Ecommerce</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'red',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: 'white',
  },
});

export default Header;
