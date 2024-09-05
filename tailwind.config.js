/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
      ],
    theme: {
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
          },
        fontFamily: {
            'sans': ['New Zen', 'sans-serif'],
            'serif': ['Merriweather', 'serif'],
        },
        extend: {
            colors: {
                'crown-chakra': '#AA7FEA',
                'third-eye-chakra': '#9400D3',
                'throat-chakra': '#6666B5',
                'heart-chakra': '#77DD77',
                'solar-plexus-chakra': '#FFD700',
                'sacral-chakra': '#FF4500',
                'root-chakra': '#8B0000',
            },
        },
    },
    plugins: [],
  }