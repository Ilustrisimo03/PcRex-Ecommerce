import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    SafeAreaView, ScrollView, Image, Alert, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext'; // Import the custom hook
// Import image picker and storage functions if/when you implement image upload
// import * as ImagePicker from 'expo-image-picker';
// import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
// import { storage } from '../config/firebaseConfig'; // Assuming storage is exported

// Define the local fallback image path reliably
const FALLBACK_PROFILE_IMAGE = require('../assets/PRLOGO-mobileapp.png'); // Adjust path if needed

const EditProfile = () => {
    const navigation = useNavigation();
    const { currentUser, userProfile, updateUserProfile, isLoading, createUserProfile } = useAuth();

    // --- State for Form Fields - Initialize empty ---
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [profilePic, setProfilePic] = useState(null); // Store the URI string, or null
    const [isSaving, setIsSaving] = useState(false);
    const [isProfileMissing, setIsProfileMissing] = useState(false); // Track if profile node is missing after load
    // Add state for image uploading if needed
    // const [isUploading, setIsUploading] = useState(false);

    // --- Effect to Populate Form AFTER Loading is Complete ---
    useEffect(() => {
        if (!isLoading && currentUser) {
            if (userProfile) {
                // Profile exists, populate form
                console.log("EditProfile: Populating form with userProfile:", userProfile);
                setName(userProfile.name || '');
                setPhone(userProfile.phone || '');
                // Ensure profilePic is a string before setting
                setProfilePic(typeof userProfile.profilePic === 'string' ? userProfile.profilePic : null);
                setIsProfileMissing(false);
            } else {
                // Profile node doesn't exist in DB
                console.warn("EditProfile: User logged in, but no profile data found in DB. Prompting creation.");
                setIsProfileMissing(true);
                setName(''); // Reset fields for creation form
                setPhone('');
                setProfilePic(null); // Use fallback for creation initially
            }
        }
        // Clear form if user logs out while screen is open (though usually they'd navigate away)
        if (!currentUser) {
            setName('');
            setPhone('');
            setProfilePic(null);
            setIsProfileMissing(false);
        }
    }, [isLoading, currentUser, userProfile]); // Re-run when loading state or data changes

    // --- Handlers ---
    const handleSaveChanges = async () => {
        if (!currentUser) {
            Alert.alert("Error", "User authentication error. Please log in again.");
            return;
        }
        // Basic validation
        if (!name.trim()) {
             Alert.alert("Validation Error", "Name cannot be empty.");
             return;
        }

        setIsSaving(true);
        const dataToSave = {
            name: name.trim(),
            phone: phone.trim(),
            // Only include profilePic if it's being explicitly set/updated during this save.
            // If using immediate upload on picture change, this might not be needed here.
            // profilePic: profilePic, // Example: include if changed
        };

        try {
            let success;
            if (isProfileMissing) {
                // Creating profile node for the first time
                console.log("Creating profile node for user:", currentUser.uid);
                // Include essential fields for creation
                const createData = {
                    ...dataToSave,
                    email: currentUser.email, // Must include email
                    profilePic: profilePic || 'https://via.placeholder.com/150/cccccc/808080?text=User', // Default/current pic
                };
                success = await createUserProfile(currentUser.uid, createData);
                if (success) setIsProfileMissing(false); // Profile now exists
            } else {
                // Updating existing profile node
                console.log("Updating profile for user:", currentUser.uid);
                success = await updateUserProfile(dataToSave); // Only send changed fields
            }

            if (success) {
                Alert.alert("Success", `Profile ${isProfileMissing ? 'created' : 'updated'} successfully.`);
                navigation.goBack();
            } else {
                // Error Alert is shown within context functions
                console.log(`Profile ${isProfileMissing ? 'creation' : 'update'} failed (handled in context).`);
            }
        } catch (error) {
            console.error("Save/Create Profile Error (Component Level):", error);
            Alert.alert("Error", "An unexpected error occurred while saving your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- Image Picker & Upload Handler (Placeholder - Requires additional setup) ---
    const handleChangePicture = async () => {
        Alert.alert("Image Upload Not Implemented", "This feature requires setting up image picker and Firebase Storage.");
        return; // Remove this return when implementing

        /* --- Example Implementation (Needs Expo Image Picker & Firebase Storage setup) ---
        // 1. Request Permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You need to allow access to your photos to change your profile picture.");
            return;
        }

        // 2. Launch Image Picker
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio
            quality: 0.6,   // Compress image slightly
        });

        if (pickerResult.canceled) {
            return;
        }

        // 3. Upload to Firebase Storage
        if (pickerResult.assets && pickerResult.assets.length > 0 && currentUser) {
            const imageUri = pickerResult.assets[0].uri;
            setIsUploading(true); // Show upload indicator
            setProfilePic(imageUri); // Optimistic UI update (show local image immediately)

            try {
                // Create blob from URI
                const response = await fetch(imageUri);
                const blob = await response.blob();

                // Define storage path (e.g., profile_pictures/user_id.jpg)
                const fileExtension = imageUri.split('.').pop();
                const fileName = `${currentUser.uid}.${fileExtension}`;
                const imageRef = storageRef(storage, `profile_pictures/${fileName}`);

                // Upload
                const snapshot = await uploadBytes(imageRef, blob);
                console.log('Uploaded a blob or file!', snapshot);

                // 4. Get Download URL
                const downloadURL = await getDownloadURL(snapshot.ref);
                console.log('File available at', downloadURL);

                // 5. Update Profile in Realtime Database
                const success = await updateUserProfile({ profilePic: downloadURL });
                if (success) {
                    setProfilePic(downloadURL); // Ensure state has the final URL
                    Alert.alert("Success", "Profile picture updated!");
                } else {
                    // Revert optimistic UI if DB update fails? Or rely on listener?
                    Alert.alert("Error", "Could not save the new picture to your profile.");
                    // Optionally revert: setProfilePic(userProfile?.profilePic || null);
                }

            } catch (error) {
                console.error("Image Upload Error:", error);
                Alert.alert("Upload Failed", "Could not upload the image. Please try again.");
                setProfilePic(userProfile?.profilePic || null); // Revert on error
            } finally {
                setIsUploading(false);
            }
        }
        */
    };

    // --- Render Logic ---

    // 1. Show loading indicator
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </SafeAreaView>
        );
    }

    // 2. Handle user not logged in
    if (!currentUser) {
         return (
            <SafeAreaView style={styles.loadingContainer}>
                 <Icon name="account-lock-outline" size={50} color="#aaa" />
                <Text style={styles.errorText}>Authentication required. Please log in.</Text>
                 <TouchableOpacity onPress={() => navigation.navigate('SignIn_SignUp')} style={styles.actionButton}>
                     <Text style={styles.actionButtonText}>Go to Login</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // 3. User logged in, render form
    const buttonText = isProfileMissing ? "Create Profile" : "Save Changes";
    const screenTitle = isProfileMissing ? 'Create Your Profile' : 'Edit Your Profile';
    // Determine image source for display
    const displayImageSource = profilePic ? { uri: profilePic } : FALLBACK_PROFILE_IMAGE;

    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Header */}
             <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={26} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>{screenTitle}</Text>
                <View style={{ width: 30 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
                {/* Profile Picture Section */}
                <View style={styles.profilePicContainer}>
                     {/* Optional: Show activity indicator while uploading image */}
                     {/* {isUploading && <ActivityIndicator size="large" color="#E50914" style={styles.uploadIndicator} />} */}
                    <Image
                        source={displayImageSource}
                        style={styles.profileImage}
                        onError={(e) => {
                            console.warn("EditProfile Image Load Error:", e.nativeEvent.error, "URI:", profilePic);
                            setProfilePic(null); // Reset state to force fallback on error
                        }}
                    />
                    <TouchableOpacity style={styles.changePicButton} onPress={handleChangePicture} disabled={isSaving /*|| isUploading*/}>
                         <Icon name="camera-outline" size={20} color="#fff" />
                        <Text style={styles.changePicButtonText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {isProfileMissing && (
                     <Text style={styles.infoText}>
                         Welcome! Please provide your details below to complete your profile setup.
                     </Text>
                 )}

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
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={currentUser?.email || ''}
                            editable={false} // Email is usually not editable
                            selectTextOnFocus={false} // Prevent selection
                        />
                         <Text style={styles.readOnlyHint}>Email is linked to your login account.</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="e.g., +1 555-123-4567 (Optional)"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            textContentType="telephoneNumber" // Helps with autofill
                        />
                    </View>
                </View>

                 {/* Save/Create Button */}
                 <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.disabledButton]}
                    onPress={handleSaveChanges}
                    disabled={isSaving /*|| isUploading*/}
                 >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.saveButtonText}>{buttonText}</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa', },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', padding: 20 },
    loadingText: { marginTop: 10, fontFamily: 'Poppins-Regular', color: '#555', fontSize: 16},
    errorText: { fontFamily: 'Poppins-Medium', color: '#dc3545', marginBottom: 15, fontSize: 16, textAlign: 'center'},
    infoText: { fontFamily: 'Poppins-Regular', color: '#333', marginBottom: 20, fontSize: 15, textAlign: 'center', paddingHorizontal: 10, lineHeight: 22},
    actionButton: { paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#E50914', borderRadius: 8, marginTop: 15 },
    actionButtonText: { fontFamily: 'Poppins-Bold', color: '#fff', fontSize: 16},
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 15 : 10, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd', },
    backButton: { padding: 5 },
    title: { textAlign: 'center', fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#333', flex: 1, marginHorizontal: 10, },
    scrollViewContent: { paddingBottom: 40, paddingHorizontal: 16, },
    profilePicContainer: { alignItems: 'center', marginVertical: 25, position: 'relative', },
    profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', borderWidth: 3, borderColor: '#fff', },
    changePicButton: { position: 'absolute', bottom: 0, right: Platform.OS === 'ios' ? '30%' : '32%', backgroundColor: 'rgba(0, 0, 0, 0.65)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, flexDirection: 'row', alignItems: 'center', },
    changePicButtonText: { color: '#fff', fontSize: 12, marginLeft: 5, fontFamily: 'Poppins-Medium' },
    // uploadIndicator: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 60, },
    formSection: { marginTop: 10, },
    inputGroup: { marginBottom: 20, },
    label: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#495057', marginBottom: 8, },
    input: { backgroundColor: '#fff', height: 50, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, fontFamily: 'Poppins-Regular', borderWidth: 1, borderColor: '#ced4da', color: '#333', },
    readOnlyInput: { backgroundColor: '#e9ecef', color: '#6c757d', },
    readOnlyHint: { fontSize: 11, color: '#6c757d', marginTop: 4, fontFamily: 'Poppins-Light' }, // Changed font weight
    saveButton: { backgroundColor: '#E50914', paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20, height: 50, },
    saveButtonText: { fontSize: 16, color: '#ffffff', fontFamily: 'Poppins-Bold', },
    disabledButton: { backgroundColor: '#f56c71', opacity: 0.9 }, // Adjusted disabled color
});

export default EditProfile;