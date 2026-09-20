import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style/tailwind.css'
import WLink from './components/WLink/index.vue' // 友链页
import Detail from './components/DetailLayout.vue' // 详情组件（<detail>）

export default {
    ...DefaultTheme,
    Layout,
    enhanceApp({ app }) {
        // 注册全局组件
        app.component('weiz-link', WLink)
        app.component('detail', Detail) // 详情组件：<detail>...</detail>
    }
};
