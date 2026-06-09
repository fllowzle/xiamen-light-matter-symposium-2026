# EPIC2026 Conference Website

基于 EPIC2026 学术会议网站的静态 HTML 模板，图片替换即生效，文本通过 `content.txt → build.py` 管道管理。

## 目录结构

```
epic2026-template/
├── build.py                 # ★ 构建脚本（核心——txt → JS）
├── 更新所有页面.bat          #    双击执行 build.py
├── index.html ...            #    静态 HTML 页面（11 个）
├── css/                      #    样式文件
│   ├── ML_index.css          #      主样式（banner、inbanner、布局）
│   ├── commonStyle.css       #      通用样式
│   ├── page.css              #      分页样式
│   └── bugfixed.css          #      修复补丁
├── js/                       #    JavaScript
│   ├── ml_script.js          #      轮播 + WOW 动画初始化
│   └── ML_swiper.min.js      #      Swiper v4 轮播库
├── ML_font-awesome/          #    图标字体
├── upload/                   #    上传资源
│   ├── img/                  #      原始图片（备份）
│   └── file/                 #      可下载文件（PDF、DOCX）
├── web-picture/              # ★ 图片管理（替换即生效，无需构建）
│   ├── index/
│   │   ├── banner/           #        轮播图 1.jpg ~ 6.jpg
│   │   └── content/          #        内容配图 1.jpg
│   ├── introduction/         #        顶部横幅 1.jpg
│   ├── ...                   #        每个页面一个子目录
│   └── contact/              #        顶部横幅 1.jpg
└── web-text/                 # ★ 文本管理（编辑 txt → 运行 build.py）
    ├── index/
    │   ├── content.txt       #        主页文本
    │   └── content_data.js   #        build.py 自动生成（勿手动编辑）
    ├── introduction/
    │   ├── content.txt
    │   └── content_data.js
    ├── ...                   #        每个页面一个子目录
    ├── speakers/
    │   ├── speakers.csv      #        演讲者数据（Excel 编辑）
    │   └── speakers_data.js  #        generate_speakers_js.py 自动生成
    └── contact/
        ├── content.txt
        └── content_data.js
```

## 使用方式

### 修改文本（9 个页面）

编辑 `web-text/<页面>/content.txt`（纯 HTML，无需手写 `style` 属性），然后运行构建：

```
双击 更新所有页面.bat

或命令行:
python3 build.py              # 构建全部 9 个页面
python3 build.py contact      # 只构建单个页面
```

`build.py` 会自动为 `<p>` 标签补全标准样式（line-height、font-size、text-align），已有 `style="..."` 的标签不受影响。刷新浏览器即可看到更新。

### 修改图片

直接替换 `web-picture/` 下各子目录中的图片文件，保持**序号和扩展名**不变，刷新即生效，无需运行构建。

```
web-picture/index/banner/1.jpg  ← 替换为你的轮播图（1920×980）
web-picture/index/content/1.jpg ← 替换为你的配图（401×482）
web-picture/sponsors/2.jpg      ← 赞助商信息图
...
```

轮播图增删：在 `web-picture/index/banner/` 目录中按连续编号添加/删除文件即可，JS 自动探测。

### 修改演讲者列表

1. 用 Excel 打开 `web-text/speakers/speakers.csv`
2. 编辑 Name / Affiliation 列（可增删行）
3. 另存为 CSV UTF-8，覆盖原文件
4. 运行 `python web-text/speakers/generate_speakers_js.py`
5. 刷新 speakers.html

### Registration 页面

注册页面包含复杂的表单和支付信息，目前直接写在 `registration.html` 中，未接入 build.py 管道。`web-text/registration/content.txt` 仅供参考。

## 自适应说明

- **轮播图 (ml_banner)**: Swiper v4 容器 `max-width: 1300px`（桌面），`width: 100%`（移动），图片 `width: 100%` 等比缩放
- **内页横幅 (inbanner)**: `100vw` 全宽容器 + `img { width: 100% }`，覆盖三个 CSS 断点
- **内容文本**: `font-size: 16px`，`line-height: 2em`，移动端字号适当缩小

## 构建原理

```
content.txt（纯 HTML）
    ↓  build.py 读取
    ↓  为裸 <p> 注入 style="line-height: 2em; text-align: justify; font-size: 16px;"
    ↓  已有 style 属性的 <p> 保持不变
    ↓  转义为单引号 JS 字符串
    ↓
content_data.js（var CONTENT_DATA = '...'）
    ↓  HTML 页面 <script src="..."> 加载
    ↓  document.getElementById('dynamicContent').innerHTML = CONTENT_DATA
    ↓
页面渲染
```

- 只有 `<p>` 标签被自动注入样式，`<span>`、`<a>`、`<ul>` 等其他标签不受影响
- 如需自定义段落样式（如居中、不同字号），在 content.txt 中给 `<p>` 手动添加 `style="..."` 即可
