// Screens/SavedAddresses.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,
    Alert, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';

const SavedAddresses = () => {
    const navigation = useNavigation();
    const { currentUser, fetchAddresses, deleteAddress } = useAuth(); // Get necessary functions/data
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch addresses when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (!currentUser) {
                setIsLoading(false);
                Alert.alert("Login Required", "Please log in to view saved addresses.");
                navigation.goBack(); // Or navigate to login
                return;
            }

            setIsLoading(true);
            console.log("Fetching addresses...");
            // Call fetchAddresses from context, providing a callback to update state
            const unsubscribe = fetchAddresses((fetchedAddresses) => {
                setAddresses(fetchedAddresses);
                setIsLoading(false);
                console.log("Addresses updated:", fetchedAddresses.length);
            });

            // Cleanup function to unsubscribe when the screen loses focus or unmounts
            return () => {
                console.log("Unsubscribing from address listener.");
                unsubscribe();
            };
        }, [currentUser, fetchAddresses, navigation]) // Dependencies
    );

    const handleAddAddress = () => {
        navigation.navigate('AddEditAddress'); // Navigate to Add/Edit screen without params for adding
    };

    const handleEditAddress = (address) => {
        navigation.navigate('AddEditAddress', { address: address }); // Pass address data for editing
    };

    const handleDeleteAddress = (addressId) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deleteAddress(addressId);
                        if (!success) {
                            // Error alert is likely shown in context, but good practice
                            Alert.alert("Error", "Could not delete address.");
                        }
                        // The list will update automatically due to the listener
                    },
                },
            ]
        );
    };

    const renderAddressItem = ({ item }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressDetails}>
                {item.type && <Text style={styles.addressType}>{item.type}</Text>}
                <Text style={styles.addressText}>{item.addressLine1}</Text>
                {item.addressLine2 && <Text style={styles.addressText}>{item.addressLine2}</Text>}
                <Text style={styles.addressText}>{`${item.city}, ${item.state} ${item.postalCode}`}</Text>
                <Text style={styles.addressText}>{item.country}</Text>
                {/* Add Default badge if applicable */}
                {/* {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>} */}
            </View>
            <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => handleEditAddress(item)} style={styles.iconButton}>
                    <Icon name="pencil-outline" size={22} color="#444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} style={styles.iconButton}>
                    <Icon name="trash-can-outline" size={22} color="#d9534f" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderListEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="map-marker-off-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>You haven't saved any addresses yet.</Text>
            <Text style={styles.emptySubText}>Add an address to speed up checkout!</Text>
        </View>
    );

    // --- Render Logic ---
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Saved Addresses</Text>
                {/* Add New Address Button in Header */}
                <TouchableOpacity onPress={handleAddAddress} style={styles.addButtonHeader}>
                    <Icon name="plus-circle-outline" size={28} color="#E50914" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E50914" />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderListEmpty}
                />
            )}

            {/* Floating Add Button (Alternative to header button) */}
            {/* <TouchableOpacity style={styles.fab} onPress={handleAddAddress}>
                <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity> */}
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f7f7f7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 15 : 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd', },
    backButton: { padding: 5 },
    title: { fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#333', textAlign: 'center', flex: 1, marginLeft: 10, },
    addButtonHeader: { padding: 5 }, // Adjust padding as needed
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { paddingVertical: 15, paddingHorizontal: 10 },
    addressCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
    addressDetails: { flex: 1, marginRight: 10, },
    addressType: { fontFamily: 'Poppins-SemiBold', color: '#E50914', marginBottom: 5, fontSize: 13, textTransform: 'uppercase' },
    addressText: { fontFamily: 'Poppins-Regular', color: '#555', fontSize: 15, lineHeight: 22 },
    addressActions: { flexDirection: 'column', justifyContent: 'space-between', },
    iconButton: { paddingVertical: 8, paddingHorizontal: 5, }, // Make touch target larger
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, paddingHorizontal: 30, },
    emptyText: { marginTop: 15, fontSize: 18, fontFamily: 'Poppins-Medium', color: '#888', textAlign: 'center' },
    emptySubText: { marginTop: 5, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#aaa', textAlign: 'center' },
    // fab: { position: 'absolute', right: 20, bottom: 90, // Adjust bottom based on tab bar
    //        backgroundColor: '#E50914', width: 56, height: 56, borderRadius: 28,
    //        justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000',
    //        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, },
});

export default SavedAddresses;