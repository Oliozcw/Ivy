class Router {
    constructor() {
        this.routes = {
            '': this.showDifficultySelection,
            '#rui': () => this.showLessonSelection('睿学'),
            '#jing': () => this.showLessonSelection('精学'),
            '#hao': () => this.showLessonSelection('好学')
        };

        // 页面完全加载后才处理路由
        if (document.readyState === 'complete') {
            this.handleRoute();
        } else {
            window.addEventListener('load', () => this.handleRoute());
        }
        
        // 监听 hash 变化
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    handleRoute() {
        const hash = window.location.hash;
        console.log("处理路由:", hash);
        const route = this.routes[hash] || this.routes[''];
        route.call(this);
    }

    showDifficultySelection() {
        document.getElementById('difficultyScreen').classList.add('active');
        document.getElementById('lessonScreen').classList.remove('active');
        document.getElementById('gameScreen').classList.remove('active');
    }

    showLessonSelection(difficulty) {
        document.getElementById('difficultyScreen').classList.remove('active');
        document.getElementById('lessonScreen').classList.add('active');
        document.getElementById('gameScreen').classList.remove('active');
        
        // 确保game对象已初始化
        if (window.game) {
            window.game.initializeLessonSelection(difficulty);
        } else {
            console.error("game对象尚未初始化");
            setTimeout(() => {
                if (window.game) {
                    window.game.initializeLessonSelection(difficulty);
                }
            }, 500);
        }
    }

    navigate(path) {
        window.location.hash = path;
    }
} 