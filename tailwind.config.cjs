// tailwind.config.cjs
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,vue,svelte}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // example accent; adjust if you want the teal-indigo from earlier
                accent: '#0ea5a4',
            },
            borderRadius: {
                '2xl': '1rem',
            },
        },
    },
    plugins: [],
};
