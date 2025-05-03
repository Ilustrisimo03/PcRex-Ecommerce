// EditProfile.js
import React, { useState, useEffect /*, useContext */ } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, ScrollView, Image, Alert, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { AuthContext } from '../context/AuthContext'; // Example: If using context

// Placeholder - replace with actual data source (Context, API)
const initialUserData = {
    id: 'user123',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+1 555-123-4567',
    profilePic: 'https://via.placeholder.com/150/771796', // Placeholder image
};

const EditProfile = () => {
    const navigation = useNavigation();
    // const { user, updateUser } = useContext(AuthContext); // Example context usage

    // --- State ---
    const [name, setName] = useState(initialUserData.name);
    const [email, setEmail] = useState(initialUserData.email); // Often non-editable or requires verification
    const [phone, setPhone] = useState(initialUserData.phone);
    const [profilePic, setProfilePic] = useState(initialUserData.profilePic);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- Effects ---
    // In real app, load user data here if not already available from context/route params
    // useEffect(() => {
    //   if (user) { // Assuming user object from context
    //     setName(user.name || '');
    //     setEmail(user.email || '');
    //     setPhone(user.phone || '');
    //     setProfilePic(user.profilePic || 'DEFAULT_PLACEHOLDER_URL');
    //   } else {
    //     // Fetch user data if not in context
    //     fetchUserData();
    //   }
    // }, [user]); // Re-run if user object changes

    // const fetchUserData = async () => { // Example fetch
    //    setIsLoading(true);
    //    try {
    //      // const data = await yourApi.getUserProfile();
    //      // setName(data.name); setEmail(data.email); setPhone(data.phone); setProfilePic(data.profilePic);
    //    } catch (error) { Alert.alert("Error", "Could not load profile."); }
    //    finally { setIsLoading(false); }
    // }

    // --- Handlers ---
    const handleSaveChanges = async () => {
        setIsSaving(true);
        console.log('Saving Profile:', { name, phone /* email is usually not changed here */ });
        // --- Simulate API Call ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            // In real app:
            // const success = await updateUser({ name, phone }); // Example context function call
            // if (success) {
            //    Alert.alert("Success", "Profile updated successfully.");
            //    navigation.goBack();
            // } else {
            //    Alert.alert("Error", "Could not update profile.");
            // }
            Alert.alert("Saved (Simulated)", "Profile changes have been saved.");
            navigation.goBack(); // Go back after simulated save

        } catch (error) {
            console.error("Save Profile Error:", error);
            Alert.alert("Error", "An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePicture = () => {
        // --- TODO: Implement Image Picker Logic ---
        // 1. Use library like react-native-image-picker or expo-image-picker
        // 2. Allow user to select from gallery or take a photo
        // 3. Upload the image to your server/storage
        // 4. Get the new image URL
        // 5. Update the 'profilePic' state
        // 6. Include the new URL in the 'handleSaveChanges' payload if needed
        Alert.alert("Change Picture", "Image picker functionality not implemented yet.");
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
            </SafeAreaView>
        );
    }

    // --- Render Logic ---
    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Standard Header */}
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <View style={{ width: 30 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Profile Picture Section */}
                <View style={styles.profilePicContainer}>
                    <Image source={{ uri: profilePic }} style={styles.profileImage} />
                    <TouchableOpacity style={styles.changePicButton} onPress={handleChangePicture}>
                         <Icon name="camera-outline" size={20} color="#fff" />
                        <Text style={styles.changePicButtonText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields Section */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]} // Style differently if read-only
                            value={email}
                            editable={false} // Usually email is not editable directly
                            selectTextOnFocus={false}
                            placeholder="your.email@example.com"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                        />
                         <Text style={styles.readOnlyHint}>Email cannot be changed here.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter your phone number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                 {/* Save Button */}
                 <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.disabledButton]}
                    onPress={handleSaveChanges}
                    disabled={isSaving}
                 >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa', }, // Light background
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 15 : 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', },
    backButton: { padding: 5 },
    title: { textAlign: 'center', fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#333', flex: 1, marginHorizontal: 10, },
    scrollViewContent: { paddingBottom: 40, paddingHorizontal: 16, },
    profilePicContainer: { alignItems: 'center', marginVertical: 25, position: 'relative', },
    profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', borderWidth: 3, borderColor: '#fff', },
    changePicButton: { position: 'absolute', bottom: 0, right: '32%', // Adjust positioning as needed
                       backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, flexDirection: 'row', alignItems: 'center', },
    changePicButtonText: { color: '#fff', fontSize: 12, marginLeft: 5, fontFamily: 'Poppins-Medium' },
    formSection: { marginTop: 10, },
    inputGroup: { marginBottom: 20, },
    label: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#495057', marginBottom: 8, },
    input: { backgroundColor: '#fff', height: 50, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, fontFamily: 'Poppins-Regular', borderWidth: 1, borderColor: '#ced4da', color: '#333', },
    readOnlyInput: { backgroundColor: '#e9ecef', color: '#6c757d', },
    readOnlyHint: { fontSize: 11, color: '#6c757d', marginTop: 4, fontFamily: 'Poppins-Regular' },
    saveButton: { backgroundColor: '#E50914', paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20, height: 50, },
    saveButtonText: { fontSize: 16, color: '#ffffff', fontFamily: 'Poppins-Bold', },
    disabledButton: { backgroundColor: '#fd9fa3', opacity: 0.8 },
});

export default EditProfile;