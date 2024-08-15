/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
export default {
	content: [
		"./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
		"./node_modules/preline/preline.js",
	],
	darkMode: "class",
	theme: {
		colors: {
			// Color Pallettes made with Tailwind Shades VSCode Extension //

			primary: {
				100: "#cff7f0",
				200: "#9eefe1",
				300: "#6ee8d1",
				400: "#3de0c2",
				500: "#0dd8b3",
				600: "#0aad8f",
				700: "#08826b",
				800: "#055648",
				900: "#032b24"
			},

			secondary: {
				100: "#dfe9fd",
				200: "#bfd2fb",
				300: "#9fbcfa",
				400: "#7fa5f8",
				500: "#5f8ff6",
				600: "#4c72c5",
				700: "#395694",
				800: "#263962",
				900: "#131d31"
			}, 

			accent: {
				100: "#fef5d0",
				200: "#fdeba1",
				300: "#fce073",
				400: "#fbd644",
				500: "#facc15",
				600: "#c8a311",
				700: "#967a0d",
				800: "#645208",
				900: "#322904"
			},

			// old-primary: {
			// 	100: "#ffedd5",
			// 	200: "#fed7aa",
			// 	300: "#fb713b",
			// 	400: "#fa5a15",
			// 	500: "#e14d0b",
			// 	600: "#ea580c",
			// },
			// old-accent: {
			// 	50: "#fefce8",
			// 	100: "#fef9c3",
			// 	400: "#facc15",
			// 	500: "#eab308",
			// },

			transparent: "transparent",
			current: "currentColor",
			black: "#000000",
			white: "#ffffff",
			gray: colors.gray,
			indigo: colors.indigo,
			neutral: colors.neutral, // Used mainly for text color & background
			yellow: {
				50: "#fefce8",
				100: "#fef9c3",
				400: "#facc15",
				500: "#eab308",
			}, // Accent colors, used mainly for star color, heading and buttons
			orange: {
				100: "#ffedd5",
				200: "#fed7aa",
				300: "#fb713b",
				400: "#fa5a15",
				500: "#e14d0b",
				600: "#ea580c",
			}, // Primary colors, used mainly for links, buttons and svg icons
			red: colors.red, // Used for bookmark icon
			zinc: colors.zinc, // Used mainly for box-shadow
		},
		extend: {
			keyframes: {
				fadeIn: {
					"0%": { opacity: 0 },
					"100%": { opacity: 1 },
				},
				getAgressivelyLarge: {
					"0%": { scale: "1", transform: "translateX(0)" },
					"100%": { scale: "3", transform: "translateX(2%)" },
				},
				flipIn: {
					"0%": { transform: "translateY(20%) rotateX(-45deg) rotateY(5deg)" },
					"100%": { transform: "translateY(0) rotateX(0) rotateY(0)" },
				},
				shootIn: {
					"0%": { transform: "translateX(100rem)" },
					"50%": { transform: "translateX(10rem)" },
					"100%": { transform: "translateX(0)" },
				},
			},
			animation: {
				fadeIn: "fadeIn 1.5s ease-in-out forwards",
				getAgressivelyLarge: "getAgressivelyLarge 100s ease-in-out forwards",
				flipIn: "flipIn 0.5s ease-in-out forwards",
				shootIn: "shootIn 0.3s ease-in-out forwards"
			},
			boxShadow: {
				insetAll: "inset 4px 4px 8px rgba(250,250,250,0.4), inset -4px -4px 8px rgba(250,250,250,0.4)",
				insetBottom: "inset 0px -4px 8px rgba(250,250,250,0.4)",
			},
		},
	},
	plugins: [
	],
};
