import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';

// 定义一个函数，从项目名中提取排序序号和名称
function extractOrderAndName(item) {
  // 使用正则表达式匹配项目名，提取序号和名称
  const match = item.match(/^(\d+)?[-_]?(.*)/);
  // 如果有序号，将其转换为整数，否则序号为 -1
  const order = match[1] !== undefined ? match[1].padStart(2, '0') : -1;
  const name = match[2]; // 名称为正则表达式匹配的第二部分
  return { order, name };
}

// 定义一个生成侧边栏的函数，传入目录路径和基本路径（默认为根路径）
function generateSidebar(directoryPath, basePath = '/') {
  const sidebar = []; // 初始化空的侧边栏数组
  const items = fs.readdirSync(directoryPath); // 同步读取目录下的所有项目（文件和子目录）

  // 对项目进行排序，根据提取的序号进行排序
  const sortedItems = items.sort((a, b) => {
    const aInfo = extractOrderAndName(a);
    const bInfo = extractOrderAndName(b);

    // 如果两个项目都没有序号，按名称进行字母排序
    if (aInfo.order === -1 && bInfo.order === -1) {
      return aInfo.name.localeCompare(bInfo.name);
    }

    // 如果一个项目没有序号，将其排在有序号的项目后面
    if (aInfo.order === -1) return 1;
    if (bInfo.order === -1) return -1;

    // 如果两个项目都有序号，按序号进行排序
    return aInfo.order - bInfo.order;
  });

  // 遍历排序后的项目
  sortedItems.forEach((item) => {
    const itemPath = path.join(directoryPath, item); // 拼接项目的完整路径
    const stat = fs.statSync(itemPath); // 同步获取项目的文件状态

    // 判断项目是否为目录
    if (stat.isDirectory()) {
      const { order, name } = extractOrderAndName(item); // 提取目录名，去除序号
      // 递归调用generateSidebar函数处理子目录
      const nestedSidebar = generateSidebar(itemPath, basePath + order + '-' + name + '/');
      // 如果子目录有内容，将其添加到侧边栏数组中
      if (nestedSidebar.length > 0) {
        sidebar.push({
          text: name, // 目录名作为侧边栏文本
          collapsed: true, // 为每个文件夹添加 collapsed 属性并设置为 true，显示切换按钮来隐藏/显示每个部分
          items: nestedSidebar // 嵌套的侧边栏作为子项
        });
      }
    } else if (stat.isFile() && item.endsWith('.md')) {
      // 判断项目是否为Markdown文件
      const { name } = extractOrderAndName(item); // 提取文件名，去除序号
      const title = name.replace(/\.md$/, ''); // 从文件名中去掉.md后缀，作为侧边栏文本
      const link = path.join(basePath, item).replace(/\.md$/, '.html'); // 生成该Markdown文件的链接
      sidebar.push({
        text: title, // 文件名作为侧边栏文本
        link: link.startsWith('/') ? link : `/${link}` // 确保链接以/开头
      });
    }
  });
  // 返回生成的侧边栏数组
  return sidebar;
}

export default defineConfig({
  title: '三国演义',
  description: '94版三国演义剧本',
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '剧本', link: '/.vitepress/guide/三国演义/01-群雄逐鹿/01-桃园三结义' }
    ],
    sidebar: {
      '/.vitepress/guide/三国演义/': generateSidebar(
        './docs/.vitepress/guide/三国演义/',
        '/.vitepress/guide/三国演义/'
      )
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }]
  }
});
