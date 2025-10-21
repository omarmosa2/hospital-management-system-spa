import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Get CSRF token from the meta tag
let token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    // Also set it as a common header for all requests
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Set up axios interceptors to automatically include CSRF token
window.axios.interceptors.request.use(function (config) {
    // Always try to get the latest CSRF token
    const currentToken = document.head.querySelector('meta[name="csrf-token"]');
    if (currentToken && currentToken.content) {
        config.headers['X-CSRF-TOKEN'] = currentToken.content;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
