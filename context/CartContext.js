// context/CartContext.js
import React, { createContext, useState, useEffect } from 'react'; // Added useEffect
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// --- Storage Key ---
const CART_STORAGE_KEY = '@MyApp:cartItems'; // Define a key for storage

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // --- Load Cart from Storage on Initial Mount ---
  useEffect(() => {
    const loadCartFromStorage = async () => {
      try {
        const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (storedCart !== null) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error("CartContext: Failed to load cart items from storage.", error);
      } finally {
        setIsLoading(false); // Set loading to false after attempting to load
      }
    };

    loadCartFromStorage();
  }, []); // Empty dependency array ensures this runs only once

  // --- Save Cart to Storage Whenever Items Change ---
  useEffect(() => {
    const saveCartToStorage = async () => {
      // Only save if loading is complete to prevent overwriting loaded cart with initial empty array
      if (!isLoading) {
        try {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
          console.error("CartContext: Failed to save cart items to storage.", error);
        }
      }
    };

    saveCartToStorage();
  }, [cartItems, isLoading]); // Run whenever cartItems or isLoading changes

  // --- Cart Modification Functions ---

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((cartItem) => cartItem.id === item.id);

      if (existingItemIndex !== -1) {
        // Increase quantity if item exists
        const updatedCart = [...prevItems];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const addMultipleToCart = (items) => {
    // Add multiple items at once (e.g., from PC Builder)
    setCartItems((prevItems) => {
      const updatedCart = [...prevItems];
      items.forEach((itemToAdd) => {
        const existingItemIndex = updatedCart.findIndex((cartItem) => cartItem.id === itemToAdd.id);
        if (existingItemIndex !== -1) {
           // If item exists, increase quantity (assuming quantity 1 for each added item)
           // If itemsToAdd can have their own quantity, use itemToAdd.quantity
          updatedCart[existingItemIndex].quantity += (itemToAdd.quantity || 1);
        } else {
          // Add new item with quantity 1 (or its own quantity if provided)
          updatedCart.push({ ...itemToAdd, quantity: (itemToAdd.quantity || 1) });
        }
      });
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    // Remove the item entirely
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        // Decrease quantity but not below 1
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
      // If you want to remove the item when quantity hits 0 after decrease, add filter:
      // .filter(item => item.quantity > 0)
    );
  };

  // --- !!! ADDED CLEAR CART FUNCTION !!! ---
  const clearCart = async () => {
    try {
      setCartItems([]); // Clear the state
      await AsyncStorage.removeItem(CART_STORAGE_KEY); // Remove from storage
      console.log("CartContext: Cart cleared successfully.");
    } catch (error) {
      console.error("CartContext: Failed to clear cart.", error);
      // Optional: Handle error state or show message to user
    }
  };
  // --- ---

  // Define the value object passed to the Provider
  // Ensure all functions and state needed by consumers are included
  const contextValue = {
    cartItems,
    isLoading, // Expose loading state if needed by consumers
    addToCart,
    addMultipleToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart, // <-- Include clearCart here
  };

  return (
    // Pass the defined value object to the Provider
    <CartContext.Provider value={contextValue}>
      {!isLoading && children} {/* Optionally only render children after loading */}
      {/* Or just render children always: {children} */}
    </CartContext.Provider>
  );
};