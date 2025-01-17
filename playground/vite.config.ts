import {resolve} from "node:path";
import {defineConfig} from "vite";

export default defineConfig({
  resolve: {alias: {"@badge-sdk/web": resolve(__dirname, "../src")}},
});
