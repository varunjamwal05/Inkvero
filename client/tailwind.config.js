/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#111111',
                secondary: '#EADBC8',
                accent: '#8B5E34',
                highlight: '#D4AF37',
                card: '#1A1A1A',
                input: '#2A2A2A',
            },
            fontFamily: {
                heading: ['"Playfair Display"', 'serif'],
                body: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'floatSlow': 'floatSlow 35s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                floatSlow: {
                    '0%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-40px) translateX(25px) rotate(3deg)' },
                    '100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
                },
            },
        },
    },
    plugins: [],
}
