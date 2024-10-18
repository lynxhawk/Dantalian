import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // 添加 Vuetify 插件
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve('C:/MyWork/Certi/key.pem')), // 读取私钥
      cert: fs.readFileSync(path.resolve('C:/MyWork/Certi/cert.pem')), // 读取证书
    },
    host: 'localhost',  // 设置主机
    port: 8081,         // 设置端口为 8081
  },
});
