import wasm from "vite-plugin-wasm";

export default {
  plugins: [wasm()],

  build: {
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
};
