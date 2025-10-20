import React, { useState, createContext, useContext } from 'react';

const PopoverContext = createContext();

export function Popover({ children, ...props }) {
    const [open, setOpen] = useState(false);

    return (
        <PopoverContext.Provider value={{ open, setOpen }}>
            <div className="relative" {...props}>
                {children}
            </div>
        </PopoverContext.Provider>
    );
}

export function PopoverTrigger({ className = '', asChild = false, ...props }) {
    const { setOpen } = useContext(PopoverContext);

    const child = React.Children.only(props.children);

    return React.cloneElement(child, {
        onClick: () => setOpen(true),
        className: `${child.props.className || ''} ${className}`,
        ...props,
    });
}

export function PopoverContent({ className = '', align = 'center', side = 'bottom', ...props }) {
    const { open, setOpen } = useContext(PopoverContext);

    if (!open) return null;

    const alignmentClasses = {
        center: 'left-1/2 -translate-x-1/2',
        start: 'left-0',
        end: 'right-0',
    };

    const sideClasses = {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
            />
            {/* Content */}
            <div
                className={`absolute z-50 w-72 rounded-md border bg-white p-4 text-gray-950 shadow-md outline-none animate-in fade-in-0 zoom-in-95 ${sideClasses[side]} ${alignmentClasses[align]} ${className}`}
                {...props}
            />
        </>
    );
}