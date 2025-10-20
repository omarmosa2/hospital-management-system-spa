import React, { useState } from 'react';

export function Calendar({
    mode = 'single',
    selected,
    onSelect,
    disabled,
    className = '',
    ...props
}) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const today = new Date();
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (disabled && disabled(date)) return;
        onSelect?.(date);
    };

    const isSelected = (day) => {
        if (!selected) return false;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return selected.toDateString() === date.toDateString();
    };

    const isToday = (day) => {
        return today.getDate() === day &&
               today.getMonth() === currentDate.getMonth() &&
               today.getFullYear() === currentDate.getFullYear();
    };

    const renderDays = () => {
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isDisabled = disabled && disabled(date);

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`
                        h-9 w-9 rounded-md text-sm font-medium transition-colors
                        hover:bg-gray-100 focus:bg-gray-100 focus:outline-none
                        disabled:pointer-events-none disabled:opacity-50
                        ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isToday(day) && !isSelected(day) ? 'bg-gray-100 text-gray-900' : ''}
                        ${!isSelected(day) && !isToday(day) ? 'text-gray-900' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className={`p-3 bg-white border rounded-md ${className}`} {...props}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-gray-100 rounded-md"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h3 className="text-sm font-medium">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>

                <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded-md"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="h-9 w-9 text-center text-xs font-medium text-gray-500 flex items-center justify-center">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </div>
    );
}