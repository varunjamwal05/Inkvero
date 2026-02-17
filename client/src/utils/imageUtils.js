export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already absolute URL

    const baseUrl = import.meta.env.VITE_API_URL || 'https://inkvero-2.onrender.com/api/v1';
    // Remove /api/v1 to get the root URL
    const rootUrl = baseUrl.replace('/api/v1', '');

    // Ensure path starts with / if not present
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${rootUrl}${cleanPath}`;
};
