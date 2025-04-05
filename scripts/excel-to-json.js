const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 定义Excel文件位置和JSON输出位置
const EXCEL_DIR = path.join(__dirname, '../data/excel');
const JSON_DIR = path.join(__dirname, '../data/json');
const OUTPUT_FILE = path.join(JSON_DIR, 'vocabulary.json');

// 确保输出目录存在
if (!fs.existsSync(JSON_DIR)) {
    fs.mkdirSync(JSON_DIR, { recursive: true });
}

// 处理Excel文件
function processExcelFiles() {
    const difficultyLevels = ['睿学', '精学', '好学'];
    const result = {};

    difficultyLevels.forEach(level => {
        const filePath = path.join(EXCEL_DIR, `${level}vocabulary.xlsx`);
        console.log(`处理文件: ${filePath}`);

        try {
            if (!fs.existsSync(filePath)) {
                console.error(`文件不存在: ${filePath}`);
                result[level] = createEmptyData();
                return;
            }

            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            // 按课程分组
            const lessonData = {};
            data.forEach(row => {
                const lesson = String(row.lesson || row.Lesson || row['Lesson'] || '').replace('Lesson ', '').trim();
                const english = row.english || row.English || row['English'] || '';
                const chinese = row.chinese || row.Chinese || row['Chinese'] || '';

                if (!lesson || !english || !chinese) {
                    console.warn(`跳过不完整的行: `, row);
                    return;
                }

                if (!lessonData[lesson]) {
                    lessonData[lesson] = [];
                }

                lessonData[lesson].push({
                    english,
                    chinese
                });
            });

            // 确保所有课程都有数据
            result[level] = ensureAllLessons(lessonData);
        } catch (error) {
            console.error(`处理文件失败: ${filePath}`, error);
            result[level] = createEmptyData();
        }
    });

    // 写入JSON文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log(`数据已保存到: ${OUTPUT_FILE}`);
}

// 创建空数据模板
function createEmptyData() {
    const result = {};
    for (let i = 1; i <= 16; i++) {
        result[i] = [
            { english: "Example 1", chinese: "示例 1" },
            { english: "Example 2", chinese: "示例 2" },
            { english: "Example 3", chinese: "示例 3" }
        ];
    }
    return result;
}

// 确保所有课程 (1-16) 都有数据
function ensureAllLessons(data) {
    const result = {};
    for (let i = 1; i <= 16; i++) {
        result[i] = data[i] || data[String(i)] || [];
        
        // 如果某课程没有数据，使用第一课的数据或空数据
        if (result[i].length === 0) {
            result[i] = data['1'] || data[1] || [
                { english: "Example 1", chinese: "示例 1" },
                { english: "Example 2", chinese: "示例 2" },
                { english: "Example 3", chinese: "示例 3" }
            ];
        }
    }
    return result;
}

// 执行处理
processExcelFiles(); 