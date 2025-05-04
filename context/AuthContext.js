// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile, // Added for updating Firebase Auth profile (optional but good practice)
} from "firebase/auth";
import {
    getDatabase,
    ref,
    onValue,
    set,
    update,
    remove, // Import remove for deleting
    push,   // Import push to generate unique IDs for new addresses
    serverTimestamp, // Useful for createdAt/updatedAt
    off      // For detaching listeners
} from "firebase/database";
import { auth, database } from '../config/firebaseConfig'; // Adjust path as needed

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // Data from Realtime DB /users/{uid}
    const [isLoading, setIsLoading] = useState(true);

    // Listener for Firebase Auth state changes
    useEffect(() => {
        let profileListenerUnsubscribe = null;
        let userProfileRef = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            console.log("Auth State Changed:", user ? `User logged in: ${user.uid}` : "User logged out");
            setCurrentUser(user); // Update Firebase Auth user object

            // --- Clean up previous profile listener ---
            if (profileListenerUnsubscribe && userProfileRef) {
                console.log("Detaching previous profile listener for ref:", userProfileRef.toString());
                off(userProfileRef, 'value', profileListenerUnsubscribe);
                profileListenerUnsubscribe = null;
                userProfileRef = null;
            }
             setUserProfile(null); // Reset local profile state

            // --- If user is logged IN, fetch profile from Realtime DB ---
            if (user) {
                setIsLoading(true); // Start loading profile data
                userProfileRef = ref(database, `users/${user.uid}`);
                console.log("Attaching profile listener for user:", user.uid, " ref:", userProfileRef.toString());

                profileListenerUnsubscribe = onValue(userProfileRef, (snapshot) => {
                    if (snapshot.exists()) {
                        console.log("User profile data received:", snapshot.val());
                        setUserProfile(snapshot.val());
                    } else {
                        console.log("User profile node does not exist for UID:", user.uid);
                        // Optional: Create a basic profile if it doesn't exist? Or handle in signup.
                        setUserProfile(null); // Or an empty object {}
                    }
                    setIsLoading(false); // Stop loading profile data
                }, (error) => {
                    console.error("Firebase Realtime DB - Error fetching user profile:", error);
                    Alert.alert("Error", "Could not fetch your profile data.");
                    setUserProfile(null);
                    setIsLoading(false); // Stop loading on error
                });
            } else {
                // --- User is logged OUT ---
                setUserProfile(null); // Clear profile
                setIsLoading(false); // Stop loading
            }
        });

        // Cleanup function for the main auth listener and any active profile listener
        return () => {
            console.log("Cleaning up AuthProvider listeners...");
            unsubscribeAuth(); // Detach auth listener
            if (profileListenerUnsubscribe && userProfileRef) {
                 console.log("Detaching profile listener during component unmount for ref:", userProfileRef.toString());
                off(userProfileRef, 'value', profileListenerUnsubscribe); // Detach profile listener
            }
        };
    }, []); // Empty dependency array means this runs once on mount

    // --- Authentication Functions ---
    // Placeholder implementations - Replace with your actual logic
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            console.log("Attempting login for:", email);
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle setting user and fetching profile
            console.log("Login successful for:", email);
            return true;
        } catch (error) {
            console.error("Login Error:", error.message, error.code);
            Alert.alert("Login Failed", error.message);
            setIsLoading(false); // Ensure loading is stopped on error
            return false;
        }
        // setIsLoading(false) // Handled by onAuthStateChanged listener completion
    };

    const signup = async (email, password, name) => {
        setIsLoading(true);
        try {
            console.log("Attempting signup for:", email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Signup successful, User UID:", user.uid);

            // 1. Update Firebase Auth profile (optional but good)
            await updateProfile(user, { displayName: name });

            // 2. Create user profile node in Realtime Database
            await createUserProfile(user.uid, {
                name: name,
                email: user.email, // Store email in DB profile as well
                createdAt: serverTimestamp(), // Use server time
                profilePic: '', // Initialize profile picture URL (optional)
                // Add other initial fields as needed
            });

            // onAuthStateChanged will handle setting user and fetching profile
            console.log("User profile created in DB for:", user.uid);
            return true;
        } catch (error) {
            console.error("Signup Error:", error.message, error.code);
            Alert.alert("Signup Failed", error.message);
            setIsLoading(false); // Ensure loading is stopped on error
            return false;
        }
        // setIsLoading(false) // Handled by onAuthStateChanged listener completion
    };

    const logout = async () => {
        try {
            console.log("Attempting logout...");
            await signOut(auth);
            // onAuthStateChanged will handle setting user to null and clearing profile
            console.log("Logout successful.");
        } catch (error) {
            console.error("Logout Error:", error);
            Alert.alert("Logout Failed", "An error occurred while logging out.");
        }
    };

    // --- Profile Functions ---
    // Placeholder implementation - Replace with your actual logic
    const createUserProfile = async (uid, initialData) => {
        if (!uid) {
            console.error("createUserProfile Error: No UID provided.");
            return false;
        }
        try {
            const userProfileRef = ref(database, `users/${uid}`);
            await set(userProfileRef, {
                ...initialData,
                uid: uid // Store uid in the profile data too
            });
            console.log("User profile node created/set in DB for UID:", uid);
            return true;
        } catch (error) {
            console.error("Error creating user profile in DB:", error);
            Alert.alert("Profile Error", "Could not initialize user profile.");
            return false;
        }
    };

    // Placeholder implementation - Replace with your actual logic
    const updateUserProfile = async (updatedData) => {
         if (!currentUser) {
            Alert.alert("Error", "You must be logged in to update your profile.");
            return false;
        }
        setIsLoading(true); // Optional: show loading during update
        try {
            const userProfileRef = ref(database, `users/${currentUser.uid}`);
            await update(userProfileRef, {
                ...updatedData,
                updatedAt: serverTimestamp() // Add an updated timestamp
            });

            // Optionally update Firebase Auth profile if name/photoURL changed
             if (updatedData.name && updatedData.name !== currentUser.displayName) {
                 await updateProfile(auth.currentUser, { displayName: updatedData.name });
             }
             if (updatedData.profilePic && updatedData.profilePic !== currentUser.photoURL) {
                 await updateProfile(auth.currentUser, { photoURL: updatedData.profilePic });
             }

            console.log("User profile updated successfully in DB for UID:", currentUser.uid);
            // The onValue listener should automatically update the local userProfile state
             setIsLoading(false);
            return true;
        } catch (error) {
            console.error("Error updating user profile in DB:", error);
            Alert.alert("Update Failed", "Could not update your profile.");
            setIsLoading(false);
            return false;
        }
    };


    // --- Address Functions ---

    // Fetch addresses (listens for real-time updates)
    const fetchAddresses = (callback) => {
        if (!currentUser) {
             console.log("fetchAddresses called but no user logged in.");
             callback([]); // Return empty array immediately
             return () => {}; // Return dummy unsubscribe if not logged in
        }

        const addressesRef = ref(database, `users/${currentUser.uid}/addresses`);
        console.log("Attaching address listener for user:", currentUser.uid);

        const listener = onValue(addressesRef, (snapshot) => {
            const addressesData = snapshot.val() || {};
            console.log("Received addresses data:", addressesData);
            // Convert object to array with keys as IDs
            const addressesArray = Object.keys(addressesData).map(key => ({
                id: key,
                ...addressesData[key]
            }));
            callback(addressesArray); // Pass the array to the callback
        }, (error) => {
            console.error("Firebase Realtime DB - Error fetching addresses:", error);
            Alert.alert("Error", "Could not fetch saved addresses.");
            callback([]); // Return empty array on error
        });

        // Return the unsubscribe function for cleanup
        return () => {
            console.log("Detaching address listener for user:", currentUser.uid);
            off(addressesRef, 'value', listener);
        };
    };


    // Add a new address
    const addAddress = async (addressData) => {
        if (!currentUser) {
            Alert.alert("Error", "You must be logged in to add an address.");
            return false;
        }
        try {
            // Get a reference to the user's addresses node
            const userAddressesRef = ref(database, `users/${currentUser.uid}/addresses`);
            // Generate a unique key for the new address using push()
            const newAddressRef = push(userAddressesRef);
            // Set the data at the new unique key location
            await set(newAddressRef, {
                ...addressData,
                createdAt: serverTimestamp() // Add created timestamp
            });
            console.log("Address added successfully with ID:", newAddressRef.key);
            return true; // Indicate success
        } catch (error) {
            console.error("Firebase Realtime DB - Error adding address:", error);
            Alert.alert("Error", "Could not save the new address. Please try again.");
            return false; // Indicate failure
        }
    };

    // Update an existing address
    const updateAddress = async (addressId, addressData) => {
        if (!currentUser) {
            Alert.alert("Error", "You must be logged in to update an address.");
            return false;
        }
        if (!addressId) {
             Alert.alert("Error", "Address ID is missing. Cannot update.");
             console.error("updateAddress Error: addressId is missing");
             return false;
        }
        try {
            const addressRef = ref(database, `users/${currentUser.uid}/addresses/${addressId}`);
            await update(addressRef, {
                ...addressData,
                updatedAt: serverTimestamp() // Add updated timestamp
            }); // Use update to modify specific fields or add new ones
            console.log("Address updated successfully:", addressId);
            return true; // Indicate success
        } catch (error) {
            console.error("Firebase Realtime DB - Error updating address:", error);
            Alert.alert("Error", "Could not update the address. Please try again.");
            return false; // Indicate failure
        }
    };

    // Delete an address
    const deleteAddress = async (addressId) => {
        if (!currentUser) {
            Alert.alert("Error", "You must be logged in to delete an address.");
            return false;
        }
         if (!addressId) {
             Alert.alert("Error", "Address ID is missing. Cannot delete.");
             console.error("deleteAddress Error: addressId is missing");
             return false;
        }
        try {
            const addressRef = ref(database, `users/${currentUser.uid}/addresses/${addressId}`);
            await remove(addressRef); // Use remove to delete the node
            console.log("Address deleted successfully:", addressId);
            return true; // Indicate success
        } catch (error) {
            console.error("Firebase Realtime DB - Error deleting address:", error);
            Alert.alert("Error", "Could not delete the address. Please try again.");
            return false; // Indicate failure
        }
    };

    // Optional: Function to set an address as default (requires more complex logic)
    // const setDefaultAddress = async (newDefaultAddressId) => {
    //     if (!currentUser) return false;
    //     // Logic:
    //     // 1. Get all addresses.
    //     // 2. Find the current default (if any).
    //     // 3. Create an update object:
    //     //    - Set `isDefault: false` for the old default (if exists).
    //     //    - Set `isDefault: true` for the `newDefaultAddressId`.
    //     // 4. Use `update()` on the main addresses ref (`users/uid/addresses`) with the combined update object.
    //     // This ensures atomicity.
    //     console.log("Setting default address - Not fully implemented");
    //     return false; // Placeholder
    // };


    // --- Context Provider Value ---
    const value = {
        currentUser,        // Firebase Auth user object (or null)
        userProfile,        // User data from Realtime DB (or null)
        isLoading,          // Loading state for auth/profile fetching
        login,              // Function to sign in
        signup,             // Function to register
        logout,             // Function to sign out
        updateUserProfile,  // Function to update DB profile
        createUserProfile,  // Function to create initial DB profile (used by signup)
        // Address functions
        fetchAddresses,     // Function to get/listen to addresses
        addAddress,         // Function to add a new address
        updateAddress,      // Function to update an existing address
        deleteAddress,      // Function to delete an address
        // setDefaultAddress, // Optional function
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};