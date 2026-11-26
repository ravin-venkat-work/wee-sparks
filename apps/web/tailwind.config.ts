import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      minWidth: {
        touch: "64px",
      },
      minHeight: {
        touch: "64px",
      },
      colors: {
        spark: {
          sky: "#E0F2FE",
          sun: "#FDE047",
          meadow: "#86EFAC",
          berry: "#F472B6",
          navy: "#1E293B",
        },
      },
    },
  },
  plugins: [],
};

export default config;
