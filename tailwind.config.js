/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,license.ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                syne: ['Syne', 'sans-serif'],
                dmsans: ['DM Sans', 'sans-serif'],
                dmmono: ['DM Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}