<script setup>
import { ref } from 'vue';

const todo_list = ref([
    { id: 1, text: "吃饭", done: false },
    { id: 2, text: "写代码", done: false },
    { id: 3, text: "看手机", done: false } // 示例：初始状态已完成
]);

const todoText = ref("");

function add() {
  if(todoText.value.length === 0) return;
  todo_list.value.push({id:todo_list.length+1, text:todoText.value, done:false});
  todoText.value="";
}

function del(index) {
  todo_list.value.splice(index, 1);
}

function finish(index) {
  todo_list.value[index].done = !todo_list.value[index].done;
}

</script>


<template>
  <div class="todo-app">
    <div class="title">Todp App</div>

    <div class="todo-form">
      <input type="text" class="todo-input" @keyup.enter="add" v-model="todoText" placeholder="输入..."></input>
      <div class="todo-button" @click="add()">Add Todo</div>
    </div>

    <div class="todo-list-container">
      <div v-for="(item, index) in todo_list" class="item">
        <div>
          <span class="todo-index" style="color: black; font-weight: bold;">{{ index + 1 }}</span>
          <input type="checkbox" @change="finish(index)"></input>
          <span :class="['name', {'done':item.done} ]">{{ item.text }}</span>
        </div>
        <div class="del" @click="del(index)">del</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 整体容器 - 使用 max-width 限制宽度，margin: auto 实现水平居中 */
.todo-app {
  max-width: 500px;
  height: 400px;
  margin: 50px auto; /* 上下50px，左右自动（居中） */
  padding: 30px;
  background-color: #f5f5f5;
  border-radius: 10px; /* 圆角 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 阴影：水平偏移 垂直偏移 模糊半径 颜色 */
}

/* 标题样式 */
.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  text-align: center; /* 文本居中 */
  margin-bottom: 30px;
}

/* 表单容器 - 使用 flexbox 实现横向布局 */
.todo-form {
  display: flex; /* 启用弹性布局 */
  gap: 10px; /* 子元素之间的间距 */
  margin-bottom: 20px;
}

/* 输入框 - 使用 flex: 1 占据剩余空间 */
.todo-input {
  flex: 1; /* 占据所有剩余空间 */
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 5px;
  outline: none; /* 去除默认聚焦边框 */
  background-color: rgb(236, 231, 231);
  color: #333;
}

.todo-input:focus {
  border-color: #4CAF50; /* 聚焦时改变边框颜色 */
}

/* 添加按钮 */
.todo-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border-radius: 5px;
  cursor: pointer; /* 鼠标变成手型 */
  font-weight: bold;
  white-space: nowrap; /* 文本不换行 */
}

.todo-button:hover {
  background-color: #45a049; /* 悬停时颜色变深 */
}

/* 待办事项列表容器 - 添加滚动功能 */
.todo-list-container {
  max-height: 250px; /* 限制最大高度 */
  overflow-y: auto; /* 垂直方向滚动 */
  padding-right: 5px; /* 给滚动条留点空间 */
}

/* 自定义滚动条样式 */
.todo-list-container::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}

.todo-list-container::-webkit-scrollbar-track {
  background: #f1f1f1; /* 滚动条轨道颜色 */
  border-radius: 4px;
}

.todo-list-container::-webkit-scrollbar-thumb {
  background: #c1c1c1; /* 滚动条滑块颜色 */
  border-radius: 4px;
}

.todo-list-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8; /* 滚动条滑块悬停颜色 */
}

/* 待办项容器 - 使用 flexbox 实现左右布局 */
.item {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid #e0e0e0;
}

.done {
  text-decoration: line-through;
}

.item:hover {
  background-color: #fafafa; /* 悬停时背景色变化 */
}

/* 左侧内容（复选框+文本） */
.item > div:first-child {
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 10px;
}

.item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  appearance: none; /* 移除默认样式 */
  -webkit-appearance: none;
  
  /* 未选中状态的样式 */
  border: 2px solid #ddd;
  border-radius: 3px;
  background-color: white; /* 背景色改这里 */
  position: relative;
  transition: all 0.2s; /* 过渡动画 */
}

/* 悬停效果 */
.item input[type="checkbox"]:hover {
  border-color: #4CAF50;
  background-color: #f0f8f0; /* 悬停时的背景色 */
}

/* 选中状态 */
.item input[type="checkbox"]:checked {
  background-color: #4CAF50; /* 选中后的背景色 */
  border-color: #4CAF50;
}

/* 选中后的勾号（用伪元素画） */
.item input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg); /* 旋转成勾号 */
}


/* 待办项名称 */
.name {
  font-size: 16px;
  color: #333;
}

/* 删除按钮 */
.del {
  padding: 5px 15px;
  background-color: #f44336;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.del:hover {
  background-color: #da190b; /* 悬停时颜色变深 */
}

</style>