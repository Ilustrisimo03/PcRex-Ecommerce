// Screens/AddEditAddress.js
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput,
    TouchableOpacity, Alert, ActivityIndicator, Platform, Switch,
    KeyboardAvoidingView // Import KeyboardAvoidingView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed

const AddEditAddress = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { addAddress, updateAddress, currentUser } = useAuth();

    // Determine if editing based on route params
    const existingAddress = route.params?.address;
    const isEditing = !!existingAddress;
    console.log("Editing Address:", isEditing ? existingAddress.id : 'No (Adding New)');

    // Form State Initialized from existingAddress or defaults
    const [addressLine1, setAddressLine1] = useState(existingAddress?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(existingAddress?.addressLine2 || '');
    const [city, setCity] = useState(existingAddress?.city || '');
    const [stateProvince, setStateProvince] = useState(existingAddress?.state || ''); // Use 'state' from DB data
    const [postalCode, setPostalCode] = useState(existingAddress?.postalCode || '');
    const [country, setCountry] = useState(existingAddress?.country || 'USA'); // Default country?
    const [addressType, setAddressType] = useState(existingAddress?.type || ''); // e.g., Home, Work
    // const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false); // Default switch state

    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({}); // State for validation errors

    // Set header title dynamically
    useEffect(() => {
        navigation.setOptions({
            title: isEditing ? 'Edit Address' : 'Add New Address',
        });
    }, [navigation, isEditing]);

    const validateForm = () => {
        const newErrors = {};
        if (!addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
        if (!city.trim()) newErrors.city = "City is required.";
        if (!stateProvince.trim()) newErrors.stateProvince = "State/Province is required.";
        if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required.";
        if (!country.trim()) newErrors.country = "Country is required.";
        // Add more specific validation if needed (e.g., postal code format)

        setErrors(newErrors);
        // Return true if valid (no errors), false otherwise
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveAddress = async () => {
        // Clear previous errors and validate
        setErrors({});
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please fill in all required fields.");
            return;
        }

        if (!currentUser) {
            Alert.alert("Error", "You must be logged in to save an address.");
            // Optionally navigate to login screen
            // navigation.navigate('SignIn_SignUp');
            return;
        }

        setIsSaving(true);

        // Prepare data object matching Firebase structure
        const addressData = {
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim(), // Include even if empty
            city: city.trim(),
            state: stateProvince.trim(), // Use 'state' key for DB
            postalCode: postalCode.trim(),
            country: country.trim(),
            type: addressType.trim(), // Include even if empty
            // isDefault: isDefault, // Include if using the switch
        };

        let success = false;
        try {
            if (isEditing && existingAddress?.id) {
                console.log("Updating address:", existingAddress.id, addressData);
                success = await updateAddress(existingAddress.id, addressData);
            } else {
                console.log("Adding new address:", addressData);
                success = await addAddress(addressData);
            }

            if (success) {
                Alert.alert("Success", `Address ${isEditing ? 'updated' : 'saved'} successfully!`);
                // Optional: Pass back data if needed, e.g., the new/updated address ID
                navigation.goBack();
            } else {
                // Error should have been shown by the context function's Alert
                console.log("Save address failed (handled in context).");
            }
        } catch (error) {
             // Fallback error handling (should be caught in context ideally)
            console.error("Save Address Error (Component Catch):", error);
            Alert.alert("Error", "An unexpected error occurred while saving the address.");
        } finally {
            setIsSaving(false); // Ensure loading state is turned off
        }
    };

    // Helper to render input fields with error display
    const renderTextInput = (label, value, setter, placeholder, key, options = {}) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}{options.required ? '*' : ''}</Text>
            <TextInput
                style={[styles.input, errors[key] && styles.inputError]} // Highlight input on error
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor="#999"
                autoCapitalize={options.autoCapitalize || 'none'}
                keyboardType={options.keyboardType || 'default'}
                onBlur={() => validateForm()} // Optionally re-validate on blur
                {...options.extraProps} // Pass any other TextInput props
            />
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
        </View>
    );


    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Use KeyboardAvoidingView to prevent keyboard overlap */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust offset if needed
            >
                {/* Header (Consider moving to react-navigation header options for consistency) */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={26} color="#333" />
                    </TouchableOpacity>
                    {/* Title is now set via navigation.setOptions */}
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Address' : 'Add New Address'}</Text>
                    <View style={{ width: 30 }} /> {/* Spacer to balance header */}
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside inputs
                >
                    {/* Form Inputs using the helper */}
                    {renderTextInput("Address Line 1", addressLine1, setAddressLine1, "Street address, P.O. box, etc.", "addressLine1", { required: true })}
                    {renderTextInput("Address Line 2 (Optional)", addressLine2, setAddressLine2, "Apartment, suite, unit, etc.", "addressLine2")}
                    {renderTextInput("City", city, setCity, "e.g., Anytown", "city", { required: true })}
                    {renderTextInput("State / Province", stateProvince, setStateProvince, "e.g., CA", "stateProvince", { required: true, autoCapitalize: 'characters' })}
                    {renderTextInput("Postal Code", postalCode, setPostalCode, "e.g., 90210", "postalCode", { required: true, keyboardType: Platform.OS === 'ios' ? 'number-pad' : 'numeric' })}
                    {renderTextInput("Country", country, setCountry, "e.g., USA", "country", { required: true })}
                    {renderTextInput("Address Type (Optional)", addressType, setAddressType, "e.g., Home, Work, Other", "addressType")}


                    {/* Optional: Default Address Switch - Uncomment if needed */}
                    {/*
                    <View style={styles.switchContainer}>
                        <Text style={styles.labelSwitch}>Set as Default Address</Text>
                        <Switch
                            trackColor={{ false: "#ccc", true: "#f5c6cb" }} // Adjusted colors
                            thumbColor={isDefault ? "#E50914" : "#f4f3f4"}
                            ios_backgroundColor="#eaeaeb"
                            onValueChange={setIsDefault}
                            value={isDefault}
                            disabled={isSaving} // Disable switch while saving
                        />
                    </View>
                    */}

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSaveAddress}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.saveButtonText}>{isEditing ? 'Update Address' : 'Save Address'}</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light background color
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
        paddingBottom: 10,
        backgroundColor: '#fff', // White header background
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ddd', // Subtle border
    },
    backButton: {
        padding: 5, // Easier tap target
        marginRight: 10,
    },
     headerTitle: { // Style for the manually added title if not using nav options
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333',
        textAlign: 'center',
        flex: 1, // Allow title to take space and center
    },
    scrollContainer: {
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    inputGroup: {
        marginBottom: 18, // Slightly more space between fields
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium', // Ensure font is linked
        color: '#495057', // Dark grey label
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        height: 50, // Standard input height
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        borderWidth: 1,
        borderColor: '#ced4da', // Standard input border color
        color: '#333', // Input text color
    },
    inputError: {
        borderColor: '#dc3545', // Red border for errors
        borderWidth: 1.5, // Make border slightly thicker on error
    },
    errorText: {
        color: '#dc3545', // Red error message text
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        marginTop: 5, // Space between input and error message
        marginLeft: 2, // Slight indent
    },
    // Styles for the optional Switch
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#eee',
        paddingHorizontal: 5, // Padding inside the bordered container
    },
    labelSwitch: { // Specific label style for switch row if needed
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#333',
        flex: 1, // Allow label to take space
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#E50914', // Brand color
        paddingVertical: 14, // Slightly adjust padding
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15, // Space above button
        height: 50, // Consistent height
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    saveButtonText: {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Poppins-Bold', // Ensure font is linked
    },
    disabledButton: {
        backgroundColor: '#e50914', // Keep color but reduce opacity
        opacity: 0.7,
    },
});

export default AddEditAddress;