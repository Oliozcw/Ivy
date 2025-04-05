我需要开发一个静态网页，实现一个单词消消乐的游戏，具体要求如下：

1、交互要求
# 用户进去网页后，可以选择不同的游戏难度，分为睿学、精学、好学，选项使用卡片展示，每个卡片颜色不一样；选择难度后，进入游戏进度选择界面，对应Lesson 1到 Lesson 16，选择进度后，进去游戏界面，三个页面需要独立
# 游戏界面风格需要卡通可爱，卡片和界面的布局需要合理，整个屏幕需要能够容纳10到20个单词对，需要自动适配pc、平板、手机屏幕大小，游戏中不能出现需要滑动屏幕选择卡片的情况
# 游戏界面右上角，需要提供重新选择进度的按钮，进度选择界面不需要提供难度选择的按钮
# 游戏中，中英文卡片正确匹配后，两个卡片需要消失
# 完成游戏后需要有鼓励的音效提示，，弹出完成提示后，停留在游戏页面

2、数据要求
# 游戏中展示的单词需要从excel中读取，三种难度分别对应"睿学vocabulary.xlsx"、"精学vocabulary.xlsx"、"好学vocabulary.xlsx"三个表格，表格第一列为游戏进度，如Lesson 1，第二列为英文单词，第三列为中文单词
# 鉴于浏览器无法直接读取Excel文件，需要提供一个excel解析脚本，项目构建的时候将excel中数据解析到json文件中，然后前端代码运行时从该json文件中获取

3、编码要求
# 编码需要使用简单的js实现，避免过多的类库依赖
# 除了通过主页进入，需要提供三个路由，可以直接进入睿学、精学、好学三个难度的进度选择页面

单词消消乐/
├── index.html
├── styles.css
├── router.js
├── game.js
├── data/
│   ├── excel/
│   │   ├── 睿学vocabulary.xlsx
│   │   ├── 精学vocabulary.xlsx
│   │   └── 好学vocabulary.xlsx
│   └── json/
│       └── vocabulary.json (由excel-to-json.js生成)
├── scripts/
│   └── excel-to-json.js
└── assets/
    └── sounds/ (可选，虽然代码中使用了base64编码的音效)



使用说明：
准备好三个Excel文件，放在data/excel/目录下
运行npm install安装xlsx依赖
运行node scripts/excel-to-json.js生成词汇JSON文件
使用Web服务器(如Live Server)运行index.html
注意事项：
Excel文件需要包含三列：lesson, english, chinese
代码会自动处理大小写和课程编号格式（如"Lesson 1"或"1"）
如果某个课程没有数据，会使用第一课的数据作为替代
如果Excel文件不存在，会生成示例数据
这样的代码结构更加清晰，便于维护，同时保留了所有功能。



