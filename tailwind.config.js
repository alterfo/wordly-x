/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: ["./src/**/*.mjs", "./src/index.html"],
  purge: [
    './src/index.html',
    './src/**/*.mjs',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

