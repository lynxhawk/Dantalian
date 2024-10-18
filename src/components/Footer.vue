<template>
  <v-app>
    <v-footer class="d-flex flex-column footer" app>
      <div class="bg-gradient d-flex align-center text-center px-4 text-white">
        <strong>Dantalian</strong>
        <v-spacer></v-spacer>
        <v-btn
          v-for="icon in icons"
          :key="icon"
          :icon="icon"
          class="mx-4"
          size="small"
          variant="plain"
        ></v-btn>
      </div>
      <div class="px-4 py-2 text-center align-center w-100 text-white bg-gradient1">
        {{ new Date().getFullYear() }} — <strong>LynxHawk</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

// 使用 ref 定义数据
const icons = ref([
  'mdi-facebook',
  'mdi-twitter',
  'mdi-linkedin',
  'mdi-instagram',
]);
</script>

<style scoped>
.footer {
  width: 100%;
}

.bg-gradient {
  background: linear-gradient(to right, #6fa8d6, #1e88e5); /* 渐变色效果，左到右 */
  height: 50px; /* 页脚高度 */
  display: flex;
  align-items: center;
  width: 100%;
}

.bg-gradient1 {
  background: linear-gradient(to right, #8ac1ee, #0e599b); /* 渐变色效果，左到右 */
  height: 50px; /* 页脚高度 */
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
}
</style>
