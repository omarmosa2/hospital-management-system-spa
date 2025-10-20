import React, { useState, createContext, useContext } from 'react';

const SelectContext = createContext();

export function Select({ value, onValueChange, children, ...props }) {
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);

    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative" {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ className = '', children, ...props }) {
    const { open, setOpen, value } = useContext(SelectContext);

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
            <svg
                className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
        </button>
    );
}

export function SelectValue({ placeholder = 'Select...', ...props }) {
    const { value } = useContext(SelectContext);

    return (
        <span className={value ? '' : 'text-gray-500'} {...props}>
            {value || placeholder}
        </span>
    );
}

export function SelectContent({ className = '', children, ...props }) {
    const { open } = useContext(SelectContext);

    if (!open) return null;

    return (
        <div
            className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md animate-in fade-in-80 top-full mt-1 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function SelectItem({ value, children, ...props }) {
    const { onValueChange } = useContext(SelectContext);

    return (
        <div
            className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
            onClick={() => onValueChange(value)}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            </span>
            {children}
        </div>
    );
}