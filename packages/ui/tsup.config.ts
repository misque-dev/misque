import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/lib/utils.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  minify: false,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
