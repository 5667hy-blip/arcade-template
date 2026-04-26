import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          bg: '#0d0d14',
          card: '#16161f',
          border: '#2a2a3a',
          cyan: '#00f5ff',
          pink: '#ff2d78',
          green: '#39ff14',
          yellow: '#ffdd00',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px #00f5ff, 0 0 20px #00f5ff40',
        'neon-pink': '0 0 10px #ff2d78, 0 0 20px #ff2d7840',
        'neon-green': '0 0 10px #39ff14, 0 0 20px #39ff1440',
      },
    },
  },
  plugins: [],
}
export default config
