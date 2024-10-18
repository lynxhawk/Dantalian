<template>
    <div id="scan">
      <div id="reader" style="width:350px;"></div>
      <v-text-field
        style="width: 300px; height: 60px; margin-top: 20px; margin-bottom: 10px;"
        v-model="isbn" color="light-blue-darken-3"
        placeholder="ISBN show here..."
        clearable>
      </v-text-field>
      <v-btn
        color="light-blue-darken-3"
        size="x-large"
        width="300px"
        @click="processISBN"
        style="margin-bottom: 50px;"
      >
        Search&Save
      </v-btn>
  
      <!-- 显示书籍信息的 v-card -->
      <v-card
        v-if="bookInfo"
        class="mx-auto"
        width="350"
        :elevation="14"
      >
        <template v-slot:title>
          <span class="font-weight-black book-title">{{ bookInfo.title || "书籍信息" }}</span>
        </template>
        <v-card-text class="bg-surface-light pt-4">
          <p><strong>作者：</strong>{{ bookInfo.authors ? bookInfo.authors.join(', ') : '未知' }}</p>
          <p><strong>出版社：</strong>{{ bookInfo.publisher || '未知' }}</p>
          <p><strong>出版日期：</strong>{{ bookInfo.publishedDate || '未知' }}</p>
          <p><strong>描述：</strong>{{ bookInfo.description || '暂无描述' }}</p>
          <p><strong>页数：</strong>{{ bookInfo.pageCount || '未知' }}</p>
          <p><strong>分类：</strong>{{ bookInfo.categories ? bookInfo.categories.join(', ') : '未知' }}</p>
          <p><strong>语言：</strong>{{ bookInfo.language || '未知' }}</p>
          <p v-if="bookInfo.imageLinks && bookInfo.imageLinks.thumbnail">
  <strong>图片地址：</strong>{{ bookInfo.imageLinks.thumbnail }}
</p>

          <v-img
            v-if="bookInfo.imageLinks"
            :src="bookInfo.imageLinks.thumbnail"
            :alt="bookInfo.title + ' 封面'"
            width="150"
          ></v-img>
        </v-card-text>
      </v-card>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as XLSX from 'xlsx'; // 引入 SheetJS 库

// 定义响应式数据
const isbn = ref('');
let html5QrcodeScanner = null;
const bookInfo = ref(null); // 存储书籍信息

const onScanSuccess = (decodedText, decodedResult) => {
  isbn.value = decodedText;
  console.log(`扫描成功: ${decodedText}`, decodedResult);
};

const onScanError = (errorMessage) => {
  console.error(`扫描失败: ${errorMessage}`);
};

onMounted(() => {
  html5QrcodeScanner = new Html5QrcodeScanner(
    'reader',
    { fps: 20, qrbox: { width: 250, height: 250 } },
    /* verbose= */ false
  );
  html5QrcodeScanner.render(onScanSuccess, onScanError);
});

onUnmounted(() => {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear().catch((error) => {
      console.error('Failed to clear html5QrcodeScanner. ', error);
    });
  }
});

// const processISBN = async () => {
//   if (!isbn.value) {
//     alert('请先扫描有效的 ISBN！');
//     return;
//   }

//   const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.value}`;
//   try {
//     const response = await fetch(apiUrl);
//     if (!response.ok) {
//       throw new Error('查询书籍信息失败');
//     }

//     const data = await response.json();
//     if (data.totalItems > 0) {
//       bookInfo.value = data.items[0].volumeInfo; // 更新书籍信息
//       console.log('书籍信息：', bookInfo.value);
//       saveToExcel(bookInfo.value);
//     } else {
//       alert('未找到该 ISBN 对应的书籍信息');
//       bookInfo.value = null; // 清空之前的数据
//     }
//   } catch (error) {
//     console.error('Error fetching book data:', error);
//     bookInfo.value = null; // 清空之前的数据
//   }
// };

const processISBN = async () => {
  if (!isbn.value) {
    alert('请先扫描有效的 ISBN！');
    return;
  }

  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn.value}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('查询书籍信息失败');
    }

    const data = await response.json();
    if (data.totalItems > 0) {
      bookInfo.value = data.items[0].volumeInfo; // 更新书籍信息
      console.log('书籍信息：', bookInfo.value);

      // 发送 POST 请求到 /add-book 接口
      await fetch('http://localhost:3000/add-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookInfo.value.title,
          authors: bookInfo.value.authors,
          publisher: bookInfo.value.publisher,
          publishedDate: bookInfo.value.publishedDate,
          description: bookInfo.value.description,
          pageCount: bookInfo.value.pageCount,
          categories: bookInfo.value.categories,
          language: bookInfo.value.language,
          thumbnail: bookInfo.value.imageLinks ? bookInfo.value.imageLinks.thumbnail : null,
        }),
      });

      console.log('书籍信息已成功添加到 Excel 文件中');
    } else {
      alert('未找到该 ISBN 对应的书籍信息');
      bookInfo.value = null; // 清空之前的数据
    }
  } catch (error) {
    console.error('Error fetching book data:', error);
    bookInfo.value = null; // 清空之前的数据
  }
};

// const saveToExcel = (book) => {
//   console.log('正在保存书籍信息到 Excel...', book);

//   // 定义要保存到 Excel 的数据，以对象数组的形式，表头自动生成为字段名
//   const data = [
//     {
//       Title: book.title || '未知',
//       Authors: book.authors ? book.authors.join(', ') : '未知',
//       Publisher: book.publisher || '未知',
//       'Published Date': book.publishedDate || '未知',
//       Description: book.description || '暂无描述',
//       'Page Count': book.pageCount || '未知',
//       Categories: book.categories ? book.categories.join(', ') : '未知',
//       Language: book.language || '未知',
//       Thumbnail: book.imageLinks && book.imageLinks.thumbnail ? book.imageLinks.thumbnail : '无',
//     }
//   ];

//   // 创建一个工作表
//   const worksheet = XLSX.utils.json_to_sheet(data);

//   // 创建一个工作簿
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'BookInfo');

//   // 导出 Excel 文件
//   const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//   const blob = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
//   // 创建下载链接
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'BookInfo.xlsx';
//   document.body.appendChild(a);
//   a.click();

//   // 移除链接
//   document.body.removeChild(a);
//   window.URL.revokeObjectURL(url);
// };

</script>
  
<style scoped>
  /* 在这里添加你的组件样式 */
#scan {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  margin-bottom: 50px;
}
  
#book-info {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: auto;
}

.book-title {
  max-width: 100%; /* 限制文本最大宽度为容器宽度 */
  white-space: normal; /* 允许文本在空格处换行 */
  overflow-wrap: break-word; /* 自动换行以适应容器宽度 */
}
</style>
  