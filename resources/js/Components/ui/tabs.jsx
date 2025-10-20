import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, className = '', ...props }) {
    const [activeTab, setActiveTab] = useState(defaultValue || value);

    const handleValueChange = (newValue) => {
        setActiveTab(newValue);
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value: activeTab, onValueChange: handleValueChange }}>
            <div className={className} {...props} />
        </TabsContext.Provider>
    );
}

export function TabsList({ className = '', ...props }) {
    return (
        <div
            className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
            {...props}
        />
    );
}

export function TabsTrigger({ value, className = '', ...props }) {
    const { value: activeValue, onValueChange } = useContext(TabsContext);
    const isActive = activeValue === value;

    return (
        <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                isActive
                    ? 'bg-white text-gray-950 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
            } ${className}`}
            onClick={() => onValueChange(value)}
            {...props}
        />
    );
}

export function TabsContent({ value, className = '', ...props }) {
    const { value: activeValue } = useContext(TabsContext);

    if (activeValue !== value) return null;

    return (
        <div
            className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 ${className}`}
            {...props}
        />
    );
}