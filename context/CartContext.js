// context/CartContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo, // Added useMemo for context value
  useContext, // Added useContext for hook
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Import Alert for user feedback

// --- Storage Key ---
const CART_STORAGE_KEY = '@MyApp:cartItems_v2'; // Increment version if structure changes

export const CartContext = createContext(undefined); // Use undefined for initial value check

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for persistence

  // --- Load Cart from Storage ---
  useEffect(() => {
      const loadCartFromStorage = async () => {
          console.log("CartContext: Attempting to load cart from storage...");
          setIsLoading(true); // Start loading
          try {
              const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
              if (storedCart !== null) {
                  const parsedCart = JSON.parse(storedCart);
                  // Basic validation: ensure it's an array
                  if (Array.isArray(parsedCart)) {
                      // Further validation: Check if items have required fields (id, price, name, quantity)
                      const validItems = parsedCart.filter(item =>
                          item && typeof item.id !== 'undefined' && typeof item.price !== 'undefined' && typeof item.name !== 'undefined' && typeof item.quantity === 'number' && item.quantity > 0
                      );
                      if (validItems.length !== parsedCart.length) {
                           console.warn("CartContext: Some invalid items found in storage, filtering them out.");
                      }
                      setCartItems(validItems);
                      console.log("CartContext: Cart loaded from storage.", validItems.length, "valid items");
                  } else {
                      console.warn("CartContext: Invalid data format found in storage (not an array), resetting cart.");
                      await AsyncStorage.removeItem(CART_STORAGE_KEY); // Clear invalid data
                      setCartItems([]);
                  }
              } else {
                  console.log("CartContext: No cart found in storage, initializing empty.");
                  setCartItems([]);
              }
          } catch (error) {
              console.error("CartContext: Failed to load cart items from storage.", error);
              Alert.alert("Cart Error", "Could not load your saved cart. Starting with an empty cart.");
              // Decide how to handle load errors, maybe clear storage?
              try {
                  await AsyncStorage.removeItem(CART_STORAGE_KEY);
              } catch (removeError) {
                   console.error("CartContext: Failed to clear storage after load error.", removeError);
              }
              setCartItems([]); // Fallback to empty cart on error
          } finally {
              setIsLoading(false); // Loading finished
          }
      };

      loadCartFromStorage();
  }, []); // Run only on mount

  // --- Save Cart to Storage ---
  useEffect(() => {
      // Only save if NOT loading and cartItems is actually an array
      if (!isLoading && Array.isArray(cartItems)) {
           const saveCart = async () => {
              try {
                  await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
                  // console.log("CartContext: Cart saved to storage."); // Can be verbose, log less often if needed
              } catch (error) {
                  console.error("CartContext: Failed to save cart items to storage.", error);
                  Alert.alert("Save Error", "Could not save cart changes. Please try again."); // User feedback
              }
           };
           saveCart();
      }
  }, [cartItems, isLoading]); // Run whenever cartItems or isLoading changes

  // --- Cart Modification Functions (Memoized with useCallback) ---

  const addToCart = useCallback((item, quantityToAdd = 1) => {
      if (!item || typeof item.id === 'undefined' || typeof item.name === 'undefined' || typeof item.price === 'undefined') {
          console.error("CartContext: Attempted to add invalid item to cart:", item);
          Alert.alert("Error", "Could not add item to cart (invalid item data).");
          return;
      }
      if (typeof quantityToAdd !== 'number' || quantityToAdd < 1) {
          console.warn("CartContext: Invalid quantityToAdd provided, defaulting to 1.");
          quantityToAdd = 1;
      }

      setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex((cartItem) => cartItem.id === item.id);

          if (existingItemIndex > -1) {
              // Increase quantity if item exists
              const updatedCart = [...prevItems];
              const currentItem = updatedCart[existingItemIndex];
              const newQuantity = currentItem.quantity + quantityToAdd;
              // Optional: Check against stock if available (item.stock)
              // newQuantity = Math.min(newQuantity, item.stock || Infinity);
              updatedCart[existingItemIndex] = { ...currentItem, quantity: newQuantity };
              console.log(`CartContext: Increased quantity for ${item.name} (ID: ${item.id}) to ${newQuantity}`);
              return updatedCart;
          } else {
              // Add new item
              // Ensure base quantity is set correctly
              const newItem = {
                  ...item, // Spread item properties (id, name, price, images, etc.)
                  quantity: quantityToAdd
               };
              console.log(`CartContext: Added ${newItem.name} (ID: ${newItem.id}) to cart with quantity ${quantityToAdd}`);
              return [...prevItems, newItem];
          }
      });
  }, []); // No dependencies needed if only using setCartItems setter form

  const addMultipleToCart = useCallback((items) => {
      if (!Array.isArray(items) || items.length === 0) {
          console.warn("CartContext: addMultipleToCart called with invalid input.");
          return;
      }

      setCartItems((prevItems) => {
          let updatedCart = [...prevItems]; // Start with current cart
          let itemsAddedCount = 0;
          let itemsUpdatedCount = 0;

          items.forEach((itemToAdd) => {
              // Validate each item before processing
              if (!itemToAdd || typeof itemToAdd.id === 'undefined' || typeof itemToAdd.name === 'undefined' || typeof itemToAdd.price === 'undefined') {
                  console.warn("CartContext: Skipping invalid item in addMultipleToCart:", itemToAdd);
                  return; // Skip this invalid item
              }
              const quantity = (typeof itemToAdd.quantity === 'number' && itemToAdd.quantity >= 1) ? itemToAdd.quantity : 1; // Default quantity if not provided or invalid
              const existingItemIndex = updatedCart.findIndex((cartItem) => cartItem.id === itemToAdd.id);

              if (existingItemIndex > -1) {
                  // Update quantity of existing item
                  const currentItem = updatedCart[existingItemIndex];
                  const newQuantity = currentItem.quantity + quantity;
                  // Optional stock check: newQuantity = Math.min(newQuantity, itemToAdd.stock || Infinity);
                  updatedCart[existingItemIndex] = { ...currentItem, quantity: newQuantity };
                  itemsUpdatedCount++;
              } else {
                  // Add new item to the array
                  const newItem = { ...itemToAdd, quantity: quantity };
                  updatedCart.push(newItem);
                  itemsAddedCount++;
              }
          });
          console.log(`CartContext: Processed addMultipleToCart. Added: ${itemsAddedCount}, Updated: ${itemsUpdatedCount}`);
          return updatedCart; // Return the final updated array
      });
  }, []); // No dependencies needed

  const removeFromCart = useCallback((itemId) => {
      if (typeof itemId === 'undefined') {
           console.error("CartContext: removeFromCart called with undefined ID.");
           return;
      }
      setCartItems((prevItems) => {
          const itemExists = prevItems.some(item => item.id === itemId);
          if (!itemExists) {
               console.warn(`CartContext: Attempted to remove non-existent item with ID ${itemId}`);
               return prevItems; // Return original array if item not found
          }
          const updatedCart = prevItems.filter(item => item.id !== itemId);
          console.log(`CartContext: Removed item with ID ${itemId} from cart.`);
          return updatedCart;
      });
  }, []); // No dependencies needed

  const increaseQuantity = useCallback((itemId) => {
       if (typeof itemId === 'undefined') {
           console.error("CartContext: increaseQuantity called with undefined ID.");
           return;
       }
      setCartItems((prevItems) =>
          prevItems.map((item) => {
              if (item.id === itemId) {
                  const newQuantity = item.quantity + 1;
                  // Optional stock check: newQuantity = Math.min(newQuantity, item.stock || Infinity);
                  console.log(`CartContext: Increased quantity for item ID ${itemId} to ${newQuantity}`);
                  return { ...item, quantity: newQuantity };
              }
              return item;
          })
      );
  }, []); // No dependencies needed

  const decreaseQuantity = useCallback((itemId) => {
      if (typeof itemId === 'undefined') {
          console.error("CartContext: decreaseQuantity called with undefined ID.");
          return;
      }
      setCartItems((prevItems) => {
          const itemIndex = prevItems.findIndex(item => item.id === itemId);
          if (itemIndex === -1) {
               console.warn(`CartContext: Attempted to decrease quantity for non-existent item ID ${itemId}`);
               return prevItems; // Item not found
          }

          const currentItem = prevItems[itemIndex];
          if (currentItem.quantity <= 1) {
              // Remove the item if quantity is 1 or less
              console.log(`CartContext: Quantity for item ID ${itemId} reached zero, removing item.`);
              return prevItems.filter(item => item.id !== itemId);
          } else {
              // Decrease quantity
              const newQuantity = currentItem.quantity - 1;
               console.log(`CartContext: Decreased quantity for item ID ${itemId} to ${newQuantity}`);
              const updatedCart = [...prevItems];
              updatedCart[itemIndex] = { ...currentItem, quantity: newQuantity };
              return updatedCart;
          }
      });
  }, []); // No dependencies needed

  const clearCart = useCallback(async () => {
      try {
          setCartItems([]); // Clear state first
          await AsyncStorage.removeItem(CART_STORAGE_KEY); // Remove from storage
          console.log("CartContext: Cart cleared successfully.");
          // Optional: Alert.alert("Cart Cleared", "Your shopping cart is now empty.");
      } catch (error) {
          console.error("CartContext: Failed to clear cart from storage.", error);
          Alert.alert("Error", "Could not clear the cart storage. Please try again.");
          // State is already cleared, but storage removal failed
      }
  }, []); // No dependencies

  // --- Context Value (Memoized) ---
  const contextValue = useMemo(() => ({
      cartItems,
      isLoading, // Expose loading state
      addToCart,
      addMultipleToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      // Derived values can also be added here if needed frequently by consumers
      // e.g., cartTotal: cartItems.reduce(...)
  }), [
      cartItems,
      isLoading,
      addToCart,
      addMultipleToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart
  ]);

  return (
      <CartContext.Provider value={contextValue}>
          {/* Only render children when loading is complete to ensure cart is ready */}
          {!isLoading ? children : null /* Or show a global loading indicator here */}
      </CartContext.Provider>
  );
};

// Custom hook to use the Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
      throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};