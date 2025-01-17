import {resolve} from "node:path";
import {defineConfig} from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [dtsPlugin({include: ["src"], rollupTypes: true})],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Badge SDK",
      fileName: "index",
    },
  },
});
