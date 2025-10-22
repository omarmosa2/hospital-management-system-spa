import React from 'react';

export function Button({ className = '', variant = 'default', size = 'default', asChild = false, ...props }) {
    const variants = {
        default: 'bg-primary text-white hover:bg-secondary focus:ring-primary',
        destructive: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
        outline: 'border border-gray-300 bg-white text-darkText hover:bg-gray-50 focus:ring-primary',
        secondary: 'bg-gray-100 text-darkText hover:bg-gray-200 focus:ring-gray-600',
        ghost: 'hover:bg-gray-100 text-darkText focus:ring-gray-600',
        link: 'text-primary underline-offset-4 hover:underline focus:ring-primary',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
    };

    // If asChild is true, render the child element instead of button
    if (asChild && React.isValidElement(props.children)) {
        const child = React.Children.only(props.children);
        return React.cloneElement(child, {
            className: `inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className} ${child.props.className || ''}`,
            ...props,
            children: child.props.children
        });
    }

    return (
        <button
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        />
    );
}