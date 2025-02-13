import wasm from "vite-plugin-wasm";

export default {
  plugins: [wasm()],

  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        extra: "src/main.js",
      },
    },
  },
};
