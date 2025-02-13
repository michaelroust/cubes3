import wasm from "vite-plugin-wasm";

export default {
  plugins: [wasm()],

  optimizeDeps: {
    // include: [], // Ensure these modules are pre-bundled
    // exclude: ["three", "stats.js", "@dimforge/rapier3d"]
  },
  build: {
    rollupOptions: {
      input: {
        // You can specify multiple entry points if needed
        main: '/index.html',  // Default entry point (can be customized)
        other: '/main.js',  // Example of another entry point
      },
      output: {
        // Customize output file names and formats
        dir: 'dist', // Output directory
        entryFileNames: 'assets/[name].[hash].js',  // Customize entry file names with hash
        chunkFileNames: 'assets/[name].[hash].js',  // Customize chunk file names
        assetFileNames: 'assets/[name].[hash][extname]',  // Customize asset file names
        format: 'es', // Output format: 'es' for ES modules
      },
      external: [
        // Specify any external dependencies that shouldn't be bundled
        // 'three',
        // '@dimforge/rapier3d',
      ],
    },
  },
};
