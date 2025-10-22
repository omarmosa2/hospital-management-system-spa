import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Tajawal', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#00A9A5',
                secondary: '#007C7A',
                background: '#F8FAFC',
                darkText: '#1E293B',
                success: '#10B981',
                danger: '#EF4444',
            },
            screens: {
                'xs': '475px',
            },
        },
    },

    plugins: [forms],
    darkMode: 'class',
};
