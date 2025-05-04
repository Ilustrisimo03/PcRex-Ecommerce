// Screens/Account.js
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, Image,
    SafeAreaView, ScrollView, Platform, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Correct path

// Fallback local image path (ensure this path is correct relative to this file)
const FALLBACK_IMAGE = require('../assets/PRLOGO-mobileapp.png');

const Account = () => {
    const navigation = useNavigation();
    // Get state and functions from AuthContext
    const { currentUser, userProfile, isLoading, logout } = useAuth();

    // --- Logout Handler ---
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    onPress: async () => {
                        console.log('User initiating logout via Account screen...');
                        try {
                            await logout(); // Call logout from context from AuthContext
                            console.log('Logout call finished successfully.');

                            // ***** CHANGE HERE: Explicitly navigate and reset stack *****
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'SignIn_SignUp' }], // Target screen name
                            });
                            console.log('Navigation reset to SignIn_SignUp screen.');
                            // ************************************************************

                        } catch (error) {
                             // Error should be handled in context, but log just in case
                            console.error("Logout failed from Account screen:", error);
                            // Optionally show an alert here if the context doesn't already
                             Alert.alert("Logout Error", "Could not log out. Please try again.");
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    // --- Navigation Function ---
    const navigateToScreen = (screenName, params = {}) => {
        if (!currentUser) {
            Alert.alert(
                "Login Required",
                "Please log in or sign up to access this feature.",
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Login / Sign Up', onPress: () => navigation.navigate('SignIn_SignUp') } // Navigate to login
                ]
            );
            return;
        }
        // Navigate only if logged in
        console.log(`Navigating to ${screenName} with params:`, params);
        navigation.navigate(screenName, params);
    };

    // --- Helper to Render Option Rows ---
    const renderOptionRow = (iconName, text, screenName, isDestructive = false, params = {}) => (
        <TouchableOpacity
            style={styles.optionRow} // Main touchable area takes full width
            // Use handleLogout directly for the logout button
            onPress={() => isDestructive ? handleLogout() : (screenName ? navigateToScreen(screenName, params) : Alert.alert("Not Implemented", "This feature is coming soon."))}
            // Disable if no screenName AND it's not the logout button
            disabled={!screenName && !isDestructive}
        >
            <View style={styles.optionInnerContainer}> {/* Inner container for content + border */}
                <View style={styles.optionLeft}>
                   <Icon
                       name={iconName}
                       size={24}
                       color={isDestructive ? '#d9534f' : '#555'}
                       style={styles.optionIcon}
                   />
                   <Text style={[
                       styles.optionText,
                       (!screenName && !isDestructive) && styles.disabledText, // Style text if not navigable/destructive
                       isDestructive && styles.destructiveText
                   ]}>
                       {text}
                   </Text>
               </View>
               {/* Show chevron only if navigable and not destructive */}
               {!isDestructive && screenName && (
                   <Icon name="chevron-right" size={24} color="#ccc" />
               )}
            </View>
        </TouchableOpacity>
    );

    // --- Helper to Render Section Title ---
    const renderSectionTitle = (title) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    // --- Render Logic ---

    // 1. Loading State
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E50914" />
                <Text style={styles.loadingText}>Loading Account...</Text>
            </SafeAreaView>
        );
    }

    // 2. Not Logged In State
    if (!currentUser) {
        // This state might not be reached often if the navigation logic
        // in App.js (or your root navigator) already redirects unauthenticated users.
        // But it's good defensive programming.
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centeredMessage}>
                    <Icon name="account-off-outline" size={60} color="#ccc" />
                    <Text style={styles.messageText}>Please log in to view your account details and manage your activity.</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('SignIn_SignUp')} // Ensure this route name is correct
                    >
                        <Text style={styles.loginButtonText}>Login / Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // 3. Logged In State
    // Format join date safely
    const joinDateFormatted = userProfile?.createdAt
        ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { // Example formatting
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'N/A';

     // Determine profile picture source
     const profileImageSource = userProfile?.profilePic && typeof userProfile.profilePic === 'string' && userProfile.profilePic.startsWith('http')
        ? { uri: userProfile.profilePic }
        : FALLBACK_IMAGE; // Use the required fallback image

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Image
                        source={profileImageSource}
                        style={styles.profileImage}
                        onError={(e) => console.warn("Account Image Load Error:", e.nativeEvent.error, "URI used:", userProfile?.profilePic)} // Log URI on error
                        defaultSource={FALLBACK_IMAGE} // Show fallback while loading/if error (RN >= 0.55)
                    />
                    {/* Display name from userProfile or Auth, fallback gracefully */}
                    <Text style={styles.userName}>{userProfile?.name || currentUser?.displayName || 'Profile Incomplete'}</Text>
                    {/* Display email from currentUser */}
                    <Text style={styles.userEmail}>{currentUser?.email || 'No email available'}</Text>
                     {/* Display join date from userProfile */}
                    <Text style={styles.joinDate}>Member since: {joinDateFormatted}</Text>

                     {/* Prompt to complete profile if essential userProfile data (like name) is missing */}
                    {(!userProfile || !userProfile.name) && currentUser && ( // Check currentUser too
                         <TouchableOpacity onPress={() => navigateToScreen('EditProfile')}>
                            <Text style={styles.completeProfileText}>⚠ Complete Your Profile</Text>
                        </TouchableOpacity>
                     )}
                </View>

                {/* Account Management Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("Account Management")}
                    {renderOptionRow("account-edit-outline", "Edit Profile", "EditProfile")}
                    {/* Make sure 'SavedAddresses' is the correct screen name */}
                    {renderOptionRow("map-marker-outline", "Saved Addresses", "SaveAddresses")}
                    {renderOptionRow("bell-outline", "Notifications", "Order")}
                    
                </View>

                {/* Orders & History Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("My Activity")}
                    {renderOptionRow("clipboard-list-outline", "Order History", "OrderHistory")}
                    {renderOptionRow("heart-outline", "Wishlist", "Wishlist")}
                    
                </View>

                {/* Help & Support Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("Help & Support")}
                    {renderOptionRow("help-circle-outline", "Help Center / FAQ", "Help")}
                    
                </View>

                {/* Legal Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("Legal")}
                    {renderOptionRow("file-document-outline", "Terms of Service", "OrderHistory")}
                    {renderOptionRow("shield-account-outline", "Privacy Policy", "OrderHistory")}
                </View>

                {/* Logout Button using renderOptionRow */}
                <View style={[styles.sectionContainer, styles.lastSectionContainer]}>
                     {/* Pass true for isDestructive to trigger handleLogout */}
                     {renderOptionRow("logout", "Logout", null, true)}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f7f7f7', // Light grey background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#666'
    },
    centeredMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff' // White background for the message card
    },
    messageText: {
        fontSize: 17,
        color: '#555',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        marginBottom: 25,
        marginTop: 15,
        lineHeight: 24
    },
    loginButton: {
        backgroundColor: '#E50914', // Brand color
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-Bold' // Ensure font is linked
    },
    scrollViewContent: {
        paddingBottom: Platform.OS === 'ios' ? 90 : 100, // Adjust based on TabBar height/OS
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 15, // Space before first section
    },
    profileImage: {
         width: 110,
         height: 110,
         borderRadius: 55, // Make it circular
         marginBottom: 15,
         borderWidth: 3,
         borderColor: '#E50914', // Brand color border
         backgroundColor: '#e0e0e0', // Placeholder background
    },
    userName: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold', // Ensure font is linked
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#666',
        marginBottom: 8,
    },
    joinDate: {
        fontSize: 13,
        fontFamily: 'Poppins-Light', // Ensure font is linked
        color: '#888',
    },
    completeProfileText: {
        color: '#E50914', // Brand color for emphasis
        fontFamily: 'Poppins-SemiBold', // Ensure font is linked
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        // textDecorationLine: 'underline' // Optional underline
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
        marginBottom: 12, // Space between sections
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1, // Subtle elevation
        borderRadius: 8, // Rounded corners for sections
        marginHorizontal: 10, // Add horizontal margin
        overflow: 'hidden', // Clip children to rounded corners
    },
     lastSectionContainer: { // Specific style for the logout section container
        marginTop: 20, // Add more space before the logout button section
        marginBottom: 20, // Add some space at the very bottom
     },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold', // Ensure font is linked
        color: '#888', // Muted title color
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 15,
        marginBottom: 5,
        paddingHorizontal: 16, // Indent title
    },
    optionRow: {
         backgroundColor: '#ffffff', // Ensure full row is touchable
         paddingLeft: 16, // Indent content from left edge
    },
    optionInnerContainer: { // Container for content and border
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingRight: 16, // Padding only on the right of content
        borderBottomWidth: StyleSheet.hairlineWidth, // Use hairline for subtle separator
        borderBottomColor: '#f0f0f0',
    },
     // --- Modification for last item border ---
     // To remove the border from the last item (like Logout), we can adjust renderOptionRow
     // OR apply a specific style to the last optionInnerContainer.
     // Let's modify renderOptionRow slightly (or you can add logic based on index if mapping):
     // No direct style change needed here if the Logout section only contains one item.
     // If a section can have multiple items and you want the *very last* one borderless:
     // Pass an `isLastItemInSection` prop to renderOptionRow and conditionally set borderBottomWidth: 0.
     // For simplicity, the single-item Logout section works fine as is.
     // --- End Modification ---
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Take available space
    },
    optionIcon: {
        marginRight: 15,
        width: 24, // Fixed width for alignment
        textAlign: 'center', // Center icon if it varies slightly in size
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular', // Ensure font is linked
        color: '#333', // Standard text color
        flexShrink: 1 // Allow text to shrink if long
    },
    disabledText: {
        color: '#aaa', // Grey out disabled text
    },
    destructiveText: {
        color: '#d9534f', // Red for destructive actions (like logout)
        fontFamily: 'Poppins-Medium', // Slightly bolder for emphasis
    },
});

export default Account;