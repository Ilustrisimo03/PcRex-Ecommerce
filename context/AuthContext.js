// src/context/AuthContext.js
import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    useMemo,
} from 'react';
import { Alert } from 'react-native';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
import {
    getDatabase,
    ref,
    onValue,
    set,
    update,
    remove,
    push,
    serverTimestamp,
    off,
    query,
    orderByChild,
    equalTo,
    orderByKey, // Keep if using Option A structure with default ordering
} from 'firebase/database';
import { auth, database } from '../config/firebaseConfig'; // Adjust path as needed

export const AuthContext = createContext(undefined); // Use undefined for initial value check

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Tracks initial auth check and profile load

    // --- Auth State Listener ---
    useEffect(() => {
        let profileListenerUnsubscribe = null;
        let userProfileRef = null;

        console.log('AuthProvider: Setting up auth state listener.');
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            console.log("AuthProvider: Auth State Changed:", user ? `User logged in: ${user.uid}` : "User logged out");
            setCurrentUser(user);

            // Clean up previous profile listener if user changes/logs out
            if (profileListenerUnsubscribe && userProfileRef) {
                console.log("AuthProvider: Detaching previous profile listener for ref:", userProfileRef.toString());
                off(userProfileRef, 'value', profileListenerUnsubscribe);
                profileListenerUnsubscribe = null;
                userProfileRef = null; // Important to reset ref
            }
            setUserProfile(null); // Reset profile state immediately on auth change

            if (user) {
                // User logged in: Set up profile listener
                if (!userProfile) setIsLoading(true); // Show loading only if profile isn't already somehow set
                userProfileRef = ref(database, `users/${user.uid}`);
                console.log("AuthProvider: Attaching profile listener for user:", user.uid, "at", userProfileRef.toString());

                profileListenerUnsubscribe = onValue(userProfileRef, (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile(snapshot.val());
                        console.log("AuthProvider: User profile data received for", user.uid);
                    } else {
                        console.warn("AuthProvider: User profile node does not exist for UID:", user.uid);
                        // Potentially create a default profile here if needed, or just leave it null
                        setUserProfile(null); // Handle case where profile node is missing
                    }
                    setIsLoading(false); // Profile loaded (or confirmed non-existent)
                }, (error) => {
                    console.error("AuthProvider: Firebase Realtime DB - Error fetching user profile:", error);
                    Alert.alert("Profile Error", "Could not fetch your profile data. Please try restarting the app.");
                    setUserProfile(null);
                    setIsLoading(false); // Stop loading on error
                });
            } else {
                // User logged out
                setUserProfile(null); // Ensure profile is null
                setIsLoading(false); // No user, so stop loading
            }
        });

        // Cleanup on component unmount
        return () => {
            console.log("AuthProvider: Cleaning up listeners...");
            unsubscribeAuth();
            if (profileListenerUnsubscribe && userProfileRef) {
                console.log("AuthProvider: Detaching profile listener during component unmount from ref:", userProfileRef.toString());
                off(userProfileRef, 'value', profileListenerUnsubscribe);
            }
        };
    }, []); // Run only once on mount

    // --- Authentication Functions ---
    const login = useCallback(async (email, password) => {
        // Loading state is handled by the auth listener reacting to the user change
        try {
            console.log("AuthProvider: Attempting login for:", email);
            await signInWithEmailAndPassword(auth, email, password);
            // Auth listener will handle setting currentUser, profile, and isLoading=false
            console.log("AuthProvider: Login successful request for:", email);
            return true;
        } catch (error) {
            console.error("AuthProvider: Login Error:", error.code, error.message);
            const message = error.message.includes('auth/invalid-credential')
                ? "Invalid email or password. Please check your credentials."
                : error.message;
            Alert.alert("Login Failed", message);
            return false;
        }
    }, []);

    // createUserProfile is defined below and wrapped in useCallback, so it's stable.
    // No need to include it in the dependency array here.
    const signup = useCallback(async (email, password, name) => {
        try {
            console.log("AuthProvider: Attempting signup for:", email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("AuthProvider: Signup successful, User UID:", user.uid);

            // Update Firebase Auth profile
            await updateProfile(user, { displayName: name });
            console.log("AuthProvider: Firebase Auth profile updated with name.");

            // Create initial profile in Realtime Database
            const profileCreated = await createUserProfile(user.uid, {
                uid: user.uid, // Store uid in profile too
                name: name,
                email: user.email,
                profilePic: '', // Default empty profile pic URL
                createdAt: serverTimestamp(),
                // Add any other default fields needed
            });

            if (profileCreated) {
                 console.log("AuthProvider: User profile node created in DB for:", user.uid);
                 // Auth listener will pick up the user and then the profile listener will fetch it.
                 return true;
            } else {
                 // Handle profile creation failure (rare, but possible)
                 Alert.alert("Signup Issue", "Account created, but profile setup failed. Please try logging in.");
                 return false; // Indicate partial success/failure
            }

        } catch (error) {
            console.error("AuthProvider: Signup Error:", error.code, error.message);
            Alert.alert("Signup Failed", error.message);
            return false;
        }
    }, []); // Empty dependency array is correct here due to createUserProfile being stable

    const logout = useCallback(async () => {
        try {
            console.log("AuthProvider: Attempting logout...");
            await signOut(auth);
            console.log("AuthProvider: Logout successful.");
            // Auth listener handles state cleanup (currentUser, userProfile, isLoading)
        } catch (error) {
            console.error("AuthProvider: Logout Error:", error);
            Alert.alert("Logout Failed", "An error occurred during logout.");
        }
    }, []);

    // --- Profile Functions ---
    const createUserProfile = useCallback(async (uid, initialData) => {
        if (!uid) {
            console.error("AuthProvider: createUserProfile Error - No UID provided.");
            return false;
        }
        try {
            const userProfileRef = ref(database, `users/${uid}`);
            await set(userProfileRef, initialData);
            console.log("AuthProvider: User profile node created/set in DB for UID:", uid);
            return true;
        } catch (error) {
            console.error("AuthProvider: Error creating user profile in DB:", error);
            Alert.alert("Profile Setup Error", "Could not initialize user profile data.");
            return false;
        }
    }, []); // No dependencies, uses only arguments

    const updateUserProfile = useCallback(async (updatedData) => {
        if (!currentUser) {
            Alert.alert("Not Logged In", "You must be logged in to update your profile.");
            return false;
        }
        // Consider adding a specific loading state for profile updates if needed
        // setIsLoadingUpdate(true);
        try {
            const userProfileRef = ref(database, `users/${currentUser.uid}`);
            const dataToUpdate = {
                ...updatedData, // Ensure only allowed fields are passed
                updatedAt: serverTimestamp(), // Add/update timestamp
            };
            // Remove uid and email from update if they exist, shouldn't be changed here
            delete dataToUpdate.uid;
            delete dataToUpdate.email;
            delete dataToUpdate.createdAt;

            await update(userProfileRef, dataToUpdate);

            // Update Firebase Auth profile if relevant fields changed
            const authUpdates = {};
            if (updatedData.name && updatedData.name !== currentUser.displayName) {
                authUpdates.displayName = updatedData.name;
            }
            if (updatedData.profilePic && updatedData.profilePic !== currentUser.photoURL) {
                authUpdates.photoURL = updatedData.profilePic; // Assuming profilePic is a URL string
            }

            if (Object.keys(authUpdates).length > 0) {
                 await updateProfile(auth.currentUser, authUpdates);
                 console.log("AuthProvider: Firebase Auth profile updated:", Object.keys(authUpdates).join(', '));
            }

            console.log("AuthProvider: User profile updated successfully in DB for UID:", currentUser.uid);
            // The onValue listener for userProfile should update the local state automatically
            // setIsLoadingUpdate(false);
            return true;
        } catch (error) {
            console.error("AuthProvider: Error updating user profile:", error);
            Alert.alert("Update Failed", "Could not update your profile. Please try again.");
            // setIsLoadingUpdate(false);
            return false;
        }
    }, [currentUser]); // Dependency: currentUser needed for UID and checks

    // --- Address Functions (Using useCallback) ---
    const fetchAddresses = useCallback((callback) => {
        if (!currentUser) {
             console.log("AuthProvider: fetchAddresses called but no user logged in.");
             callback([], "User not logged in.");
             return () => {}; // Return dummy unsubscribe function
        }
        const addressesRef = ref(database, `users/${currentUser.uid}/addresses`);
        console.log("AuthProvider: Attaching address listener for user:", currentUser.uid, "at", addressesRef.toString());

        const listener = onValue(addressesRef, (snapshot) => {
            const addressesData = snapshot.val() || {};
            const addressesArray = Object.entries(addressesData).map(([id, data]) => ({ id, ...data }));
            // Optionally sort addresses here, e.g., by isDefault or createdAt
            callback(addressesArray, null); // Pass data and null error
            console.log(`AuthProvider: Fetched ${addressesArray.length} addresses.`);
        }, (error) => {
            console.error("AuthProvider: Firebase Realtime DB - Error fetching addresses:", error);
            Alert.alert("Address Error", "Could not fetch saved addresses.");
            callback([], error.message); // Pass empty array and error message
        });

        // Return the unsubscribe function for cleanup
        return () => {
            console.log("AuthProvider: Detaching address listener for user:", currentUser.uid, "from", addressesRef.toString());
            off(addressesRef, 'value', listener);
        };
    }, [currentUser]); // Dependency: currentUser

    const addAddress = useCallback(async (addressData) => {
        if (!currentUser) { Alert.alert("Error", "Log in to add an address."); return false; }
        try {
            const addressesRef = ref(database, `users/${currentUser.uid}/addresses`);
            const newAddressRef = push(addressesRef);
            const dataToSet = {
                 ...addressData,
                 createdAt: serverTimestamp(),
                 // Ensure isDefault is handled correctly (e.g., only one default)
            };
            await set(newAddressRef, dataToSet);
            console.log("AuthProvider: Address added successfully with ID:", newAddressRef.key);
            // If setting this new address as default, might need to update other addresses
            return true;
        } catch (error) {
            console.error("AuthProvider: Firebase Realtime DB - Error adding address:", error);
            Alert.alert("Error", "Could not save the new address.");
            return false;
        }
    }, [currentUser]);

    const updateAddress = useCallback(async (addressId, addressData) => {
        if (!currentUser) { Alert.alert("Error", "Log in to update an address."); return false; }
        if (!addressId) { console.error("AuthProvider: updateAddress Error - addressId missing."); Alert.alert("Error", "Address ID missing."); return false; }
        try {
            const addressRef = ref(database, `users/${currentUser.uid}/addresses/${addressId}`);
            const dataToUpdate = {
                ...addressData,
                updatedAt: serverTimestamp()
            };
             // Ensure createdAt isn't overwritten, etc.
            delete dataToUpdate.createdAt;

            await update(addressRef, dataToUpdate);
            console.log("AuthProvider: Address updated successfully:", addressId);
            // Handle isDefault logic if needed (unsetting others if this one becomes default)
            return true;
        } catch (error) {
            console.error("AuthProvider: Firebase Realtime DB - Error updating address:", error);
            Alert.alert("Error", "Could not update the address.");
            return false;
        }
    }, [currentUser]);

    const deleteAddress = useCallback(async (addressId) => {
        if (!currentUser) { Alert.alert("Error", "Log in to delete an address."); return false; }
        if (!addressId) { console.error("AuthProvider: deleteAddress Error - addressId missing."); Alert.alert("Error", "Address ID missing."); return false; }
        try {
            const addressRef = ref(database, `users/${currentUser.uid}/addresses/${addressId}`);
            await remove(addressRef);
            console.log("AuthProvider: Address deleted successfully:", addressId);
            return true;
        } catch (error) {
            console.error("AuthProvider: Firebase Realtime DB - Error deleting address:", error);
            Alert.alert("Error", "Could not delete the address.");
            return false;
        }
    }, [currentUser]);

    // --- Order Functions ---
    // Function to fetch user's orders. Uses `onValue` for real-time updates.
    const fetchOrders = useCallback((callback) => {
        if (!currentUser) {
            console.log("AuthProvider: fetchOrders called but no user logged in.");
            callback([], "User not logged in."); // Return empty array and error message
            return () => {}; // Return dummy unsubscribe function
        }

        // *** Using Option A: Orders stored under a specific user's node ***
        // Path: /userOrders/{userId}/{orderId}
        // Order items naturally by key (timestamp-based push keys or sorted keys)
        // or use orderByChild('orderTimestamp') if you store a server timestamp.
        const listenerRef = ref(database, `userOrders/${currentUser.uid}`);

        // If using serverTimestamp for ordering:
        // const listenerQuery = query(listenerRef, orderByChild('orderTimestamp'), limitToLast(50)); // Example: Get latest 50
        // const listenerRef = listenerQuery; // Use the query instead

        console.log(`AuthProvider: Attaching order listener for user: ${currentUser.uid} at path: ${listenerRef.toString()}`);

        const listener = onValue(listenerRef, (snapshot) => {
            const ordersData = snapshot.val() || {};
            console.log("AuthProvider: Received orders data snapshot.");

            // Convert the orders object (keys are order IDs) into an array
            const ordersArray = Object.entries(ordersData).map(([key, value]) => ({
                id: key, // The orderId
                ...value // The order data itself
            }));

            // Sort orders by date (newest first)
            // Ensure 'orderDate' exists and is a parsable format (ISO string recommended)
            ordersArray.sort((a, b) => {
                // Handle cases where date might be missing or invalid
                const timeA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
                const timeB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
                // Check for invalid dates (NaN)
                if (isNaN(timeA) || isNaN(timeB)) {
                    // Prioritize valid dates, or maintain original order if both invalid
                    if (isNaN(timeA) && !isNaN(timeB)) return 1; // Put B first
                    if (!isNaN(timeA) && isNaN(timeB)) return -1; // Put A first
                    return 0; // Both invalid, keep order
                }
                return timeB - timeA; // Descending order (newest first)
            });

            console.log(`AuthProvider: Processed ${ordersArray.length} orders.`);
            callback(ordersArray, null); // Pass the sorted array and null error

        }, (error) => {
            console.error("AuthProvider: Firebase Realtime DB - Error fetching orders:", error);
            Alert.alert("Order History Error", "Could not fetch your order history.");
            callback([], error.message); // Pass empty array and the error message
        });

        // Return the unsubscribe function for cleanup
        return () => {
            console.log(`AuthProvider: Detaching order listener for user: ${currentUser.uid} from path: ${listenerRef.toString()}`);
            off(listenerRef, 'value', listener); // Ensure using the same ref/query
        };
    }, [currentUser]); // Dependency: currentUser

    // --- Context Provider Value ---
    // Memoize the value object to prevent unnecessary re-renders of consumers
    const value = useMemo(() => ({
        currentUser,
        userProfile,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile,
        // createUserProfile is primarily internal for signup, usually not needed directly by components
        // Address functions
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        // Order functions
        fetchOrders,
    }), [
        currentUser, userProfile, isLoading, // State values
        login, signup, logout, updateUserProfile, // Stable auth/profile functions (due to useCallback)
        fetchAddresses, addAddress, updateAddress, deleteAddress, // Stable address functions (due to useCallback)
        fetchOrders // Stable order function (due to useCallback)
    ]);

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