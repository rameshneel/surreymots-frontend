import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   base: "/booking/",// Change this from "/booking/" to "./"
//   // server: {
//   //   proxy: {
//   //     "/": {
//   //       target: "http://localhost:4000",
//   //       changeOrigin: true,
//   //       rewrite: (path) => path.replace(/^\/api/, ""),
//   //     },
//   //   },
//   // },
// });
export default defineConfig({
  plugins: [react()],
  base: "/booking/",
});
