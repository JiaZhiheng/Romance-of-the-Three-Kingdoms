import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';

/**
 * 从文件/目录名中提取排序序号和显示名称
 * 例如: "01-桃园三结义" => { order: "01", name: "桃园三结义" }
 */
function extractOrderAndName(item) {
  const match = item.match(/^(\d+)-(.+)/);
  if (match) {
    return { order: match[1].padStart(2, '0'), name: match[2] };
  }
  return { order: null, name: item };
}

/**
 * 自动生成侧边栏配置
 * @param {string} directoryPath - 文件系统中的目录路径
 * @param {string} basePath - URL 基础路径
 */
function generateSidebar(directoryPath, basePath = '/') {
  const items = fs.readdirSync(directoryPath);

  const sortedItems = items
    .filter((item) => !item.startsWith('.')) // 过滤隐藏文件
    .sort((a, b) => {
      const aInfo = extractOrderAndName(a);
      const bInfo = extractOrderAndName(b);

      if (aInfo.order === null && bInfo.order === null) {
        return aInfo.name.localeCompare(bInfo.name);
      }
      if (aInfo.order === null) return 1;
      if (bInfo.order === null) return -1;
      return aInfo.order.localeCompare(bInfo.order);
    });

  const sidebar = [];

  for (const item of sortedItems) {
    const itemPath = path.join(directoryPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const { name } = extractOrderAndName(item);
      const nestedSidebar = generateSidebar(itemPath, `${basePath}${item}/`);
      if (nestedSidebar.length > 0) {
        sidebar.push({
          text: name,
          collapsed: true,
          items: nestedSidebar
        });
      }
    } else if (stat.isFile() && item.endsWith('.md')) {
      const { name } = extractOrderAndName(item);
      const title = name.replace(/\.md$/, '');
      // 使用 posix 风格路径，避免 Windows 下反斜杠问题
      const link = `${basePath}${item}`.replace(/\.md$/, '');
      sidebar.push({
        text: title,
        link: link.startsWith('/') ? link : `/${link}`
      });
    }
  }

  return sidebar;
}

export default defineConfig({
  // 部署到 GitHub Pages 时需要设置 base
  // 如果部署到 https://<user>.github.io/<repo>/，请设置为 '/<repo>/'
  // 如果部署到 https://<user>.github.io/，设置为 '/'
  base: '/Romance-of-the-Three-Kingdoms/',
  title: '三国演义',
  description: '94版三国演义剧本',
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '剧本', link: '/guide/三国演义/01-群雄逐鹿/01-桃园三结义' }
    ],
    sidebar: {
      '/guide/三国演义/': generateSidebar(
        './docs/guide/三国演义/',
        '/guide/三国演义/'
      )
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }]
  }
});
