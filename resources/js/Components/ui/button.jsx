import React from 'react';

export function Button({ className = '', variant = 'default', size = 'default', ...props }) {
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
        outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:ring-blue-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-600',
        ghost: 'hover:bg-gray-100 text-gray-900 focus:ring-gray-600',
        link: 'text-blue-600 underline-offset-4 hover:underline focus:ring-blue-600',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        />
    );
}