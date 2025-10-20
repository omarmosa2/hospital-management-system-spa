import React from 'react';

export function Checkbox({ className = '', checked, onCheckedChange, ...props }) {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className={`h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
}