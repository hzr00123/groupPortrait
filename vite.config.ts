import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { resolve } from "path";
import vueJsx from '@vitejs/plugin-vue-jsx';

const VITE_BASE_URL: string = loadEnv('development', process.cwd()).VITE_BASE_URL;
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'development' ? '/' : './',
    resolve: {
      //设置别名
      alias: {
        "@": resolve(__dirname, "src"),
        "@imgPath": resolve(__dirname, "./src/assets/images"),
        "@iconPath": resolve(__dirname, "./src/assets/icons"),
      },
    },
    plugins: [
      vue(),
      vueJsx({}),
      // AutoImport({
      //   resolvers: [ElementPlusResolver()],
      // }),
      // Components({
      //   resolvers: [ElementPlusResolver({ importStyle: mode === "development" ? false : 'sass' })],
      // }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
        // 指定symbolId格式
        symbolId: 'icon-[dir]-[name]',
      })
    ],
    build: {
      minify: "terser",
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js', // 引入文件名的名称
          entryFileNames: 'assets/js/[name]-[hash].js', // 包的入口文件名称
          assetFileNames: "assets/[ext]/[name]-[hash][extname]", // 资源文件像 字体，图片等
          experimentalMinChunkSize: 1000,
          manualChunks(id) { //静态资源拆分打包
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          // modifyVars: {
          //   hack: `true; @import (reference) "${resolve("@/assets/style/variables.less")}";`,
          // },
          // math: "strict",
          javascriptEnabled: true,
          // charset: false,
          // additionalData: `@import "${resolve(__dirname, "src/assets/style/variable.less")}";`,
        },
        scss: {
          // additionalData: '@ues "@/assets/styles/element-variables.scss";',
        }
      },
    },
    server: {
      port: 8080, //启动端口
      open: true, //当该值为字符串时，它将被用作 URL 的路径名。
      host: "0.0.0.0",
      hmr: true,
      // hmr: {
      //   //禁用或配置 HMR 连接（用于 HMR websocket 必须使用不同的 http 服务器地址的情况）。
      //   host: "127.0.0.1",
      //   port: 8080,
      // },
      // 设置 https 代理
      proxy: {
        "/api": {
          target: VITE_BASE_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
        // 代理 websockets 或 socket.io 写法：ws://localhost:5173/socket.io -> ws://localhost:5174/socket.io
        "/socket.io": {
          target: "ws://localhost:5174",
          ws: true,
        },
      },
    },
  }
});
