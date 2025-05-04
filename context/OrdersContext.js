// context/OrdersContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
    // State to hold orders placed during this app session
    const [orders, setOrders] = useState([]);

    // Function to add a newly placed order to the state
    const addOrder = useCallback((newOrder) => {
        console.log("OrdersContext: Adding new order (session):", newOrder.id);
        // Prepend the new order to the list (most recent first)
        setOrders(prevOrders => [newOrder, ...prevOrders]);
    }, []);

    // Optional: Function to clear session orders (e.g., for logout or testing)
    const clearSessionOrders = useCallback(() => {
        console.log("OrdersContext: Clearing all session orders.");
        setOrders([]);
    }, []);

    // Value provided by the context
    const value = {
        orders,          // The array of session orders
        addOrder,        // Function to add an order
        clearSessionOrders, // Function to clear orders
    };

    return (
        <OrdersContext.Provider value={value}>
            {children}
        </OrdersContext.Provider>
    );
};

// Custom hook for easy access to the OrdersContext
export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
};