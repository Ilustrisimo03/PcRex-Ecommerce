// Account.js
import React, { useState /*, useContext */ } from 'react'; // <-- Add useContext if you plan to use Auth Context
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../context/AuthContext'; // Example: Import AuthContext if needed for logout/user data

// Placeholder profile picture URL
const DEFAULT_PROFILE_PIC = 'https://via.placeholder.com/150/0000FF/808080?text=User'; // Example placeholder
// Fallback local image path (ensure this path is correct)
const FALLBACK_IMAGE = require('../assets/PRLOGO-mobileapp.png');

const Account = () => {
    const navigation = useNavigation(); // Hook for navigation actions
    // const { user, logout } = useContext(AuthContext); // Example: Get user and logout function from context

    // --- State ---
    // In a real app, user data should come from context or be fetched
    const [userData, setUserData] = useState({
        // Use user context data if available, otherwise use placeholders
        // name: user?.name || 'Alex Johnson',
        // email: user?.email || 'alex.j@example.com',
        // joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'March 15, 2023',
        // profilePic: user?.profilePic || DEFAULT_PROFILE_PIC,
        // --- Using placeholders for now ---
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        joinDate: 'March 15, 2023',
        profilePic: DEFAULT_PROFILE_PIC,
    });

    // --- Logout Handler ---
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    onPress: () => {
                        console.log('User logging out...');
                        // --- Real Logout Logic ---
                        // Call logout function from context
                        // await logout(); // Assuming logout handles token clearing and state reset

                        // Fallback if not using context's logout function:
                        // 1. Clear Authentication Token (AsyncStorage, SecureStore)
                        // 2. Clear any local user state if not managed by context
                        // 3. Reset Navigation Stack (navigate to Auth flow)
                        // navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Example reset

                        // Show confirmation only after successful logout attempt in real app
                        // Alert.alert('Logged Out', 'You have been successfully logged out.');

                        // For demonstration, show alert and maybe navigate (if login screen exists)
                        Alert.alert('Logged Out (Simulated)', 'Implement actual logout logic.');
                         // Example navigation to Login screen after logout
                         // navigation.navigate('Login'); // Or reset navigation stack as above
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    // --- Navigation Function ---
    // This function now directly navigates
    const navigateToScreen = (screenName, params = {}) => {
        // Add specific logic or parameter passing if needed for certain screens
        // if (screenName === 'SomeScreenRequiringParams') {
        //     navigation.navigate(screenName, { userId: user?.id });
        //     return;
        // }
        navigation.navigate(screenName, params); // Navigate to the specified screen
    };

    // --- Helper to Render Option Rows ---
    // Pass the actual screen name string from your navigator setup
    const renderOptionRow = (iconName, text, screenName, isDestructive = false) => (
        <TouchableOpacity
            style={[styles.optionRow, styles.noBottomBorder]} // Remove border here...
            onPress={() => screenName ? navigateToScreen(screenName) : Alert.alert("Not Implemented", "This feature is coming soon.")}
            // Disable if no screenName is provided (optional)
             disabled={!screenName}
        >
             <View style={styles.optionInnerContainer}> {/* ...and add border to this inner container */}
                 <View style={styles.optionLeft}>
                    <Icon
                        name={iconName}
                        size={24}
                        color={isDestructive ? '#d9534f' : '#555'}
                        style={styles.optionIcon}
                    />
                    <Text style={[styles.optionText, !screenName && styles.disabledText, isDestructive && styles.destructiveText]}>
                        {text}
                    </Text>
                </View>
                {!isDestructive && screenName && ( // Only show chevron if it's navigable and not destructive
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
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: userData.profilePic }}
                        style={styles.profileImage}
                        defaultSource={FALLBACK_IMAGE} // Use defined constant
                        onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)} // Log image errors
                    />
                    <Text style={styles.userName}>{userData.name}</Text>
                    <Text style={styles.userEmail}>{userData.email}</Text>
                    <Text style={styles.joinDate}>Joined: {userData.joinDate}</Text>
                </View>

                {/* Account Management Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("Account Management")}
                    {/* Ensure these screen names match your navigator config */}
                    {renderOptionRow("account-edit-outline", "Edit Profile", "EditProfile")}
                    {renderOptionRow("map-marker-outline", "Saved Addresses", null)} {/* Pass null for unimplemented */}
                    {renderOptionRow("credit-card-outline", "Payment Methods", null)}
                    {renderOptionRow("bell-outline", "Notifications", null)}
                    {renderOptionRow("shield-lock-outline", "Security", null)}
                </View>

                {/* Orders & History Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("My Activity")}
                    {renderOptionRow("clipboard-list-outline", "Order History", "OrderHistory")}
                    {renderOptionRow("heart-outline", "Wishlist", null)}
                    {renderOptionRow("star-outline", "My Reviews", null)}
                </View>

                {/* Help & Support Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("Help & Support")}
                    {renderOptionRow("help-circle-outline", "Help Center / FAQ", null)}
                    {renderOptionRow("email-outline", "Contact Us", null)}
                </View>

                {/* Legal Section */}
                <View style={styles.sectionContainer}>
                    {renderSectionTitle("Legal")}
                    {renderOptionRow("file-document-outline", "Terms of Service", null)}
                    {renderOptionRow("shield-account-outline", "Privacy Policy", null)}
                </View>

                {/* Logout Button (as a distinct button) */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={20} color="#d9534f" style={styles.logoutIcon} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    scrollViewContent: {
        paddingBottom: 40,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 15,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        marginBottom: 15,
        borderWidth: 3,
        borderColor: '#E50914',
        backgroundColor: '#e0e0e0',
    },
    userName: {
        fontSize: 22,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        marginBottom: 8,
    },
    joinDate: {
        fontSize: 13,
        fontFamily: 'Poppins-Light',
        color: '#888',
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
        marginBottom: 12,
         // Removed padding top, handled by title padding if needed
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderRadius: 8, // Add slight rounding to sections
        marginHorizontal: 10, // Add horizontal margin to sections
        overflow: 'hidden', // Ensure border radius clips content
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 15, // Add space above title
        marginBottom: 5, // Reduce space below title
        paddingHorizontal: 16,
    },
    optionRow: {
        // Remove border properties from here
        backgroundColor: '#ffffff', // Ensure background for touchable area
    },
    optionInnerContainer: { // New container for content and border
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1, // Apply border here
        borderBottomColor: '#f0f0f0',
        marginLeft: 16, // Indent border line to align with text potentially
        borderBottomLeftRadius: 0, // Ensure border line is straight
    },
    noBottomBorder: { // Style to remove border from the last item in a section (Apply manually or conditionally)
        // borderBottomWidth: 0, // This is now applied to optionInnerContainer conditionally or on last element
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Allow left side to take available space
        marginRight: 10, // Space before chevron
    },
    optionIcon: {
        marginRight: 15,
        width: 24,
        textAlign: 'center',
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#333',
    },
     disabledText: {
        color: '#aaa', // Grey out text for disabled options
    },
    destructiveText: {
        color: '#d9534f',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginTop: 20,
        marginHorizontal: 16, // Consistent with section horizontal margin + row padding
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0d1d0',
        shadowColor: "#d9534f",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutButtonText: {
        color: '#d9534f',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
});

export default Account;