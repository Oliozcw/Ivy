// 统一的配置文件
const CONFIG = {
    // 路由配置
    ROUTES: {
        // 难度和对应的路由
        DIFFICULTIES: {
            '睿学': 'rui',
            '精学': 'jing',
            '好学': 'hao'
        },
        
        // 由路由获取难度（反向映射）
        HASH_TO_DIFFICULTY: {
            '#rui': '睿学',
            '#jing': '精学',
            '#hao': '好学'
        }
    },
    
    // 默认数据路径
    DATA_PATH: './data/json/vocabulary.json'
}; 