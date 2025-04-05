class WordGame {
    constructor(router) {
        this.router = router;
        this.initializeElements();
        this.initializeEventListeners();
        this.loadVocabularyData();
        
        // 监听窗口大小变化，调整列数
        window.addEventListener('resize', () => {
            if (this.gameScreen.classList.contains('active')) {
                this.adjustGameBoard();
            }
        });

        // 预加载音频并启用自动播放
        document.body.addEventListener('click', () => {
            // 静音播放以解除浏览器限制
            this.successSound.volume = 0;
            this.completeSound.volume = 0;
            this.successSound.play().then(() => {
                this.successSound.pause();
                this.successSound.currentTime = 0;
            }).catch(() => {});
            this.completeSound.play().then(() => {
                this.completeSound.pause();
                this.completeSound.currentTime = 0;
            }).catch(() => {});
        }, { once: true });
    }

    initializeElements() {
        this.difficultyScreen = document.getElementById('difficultyScreen');
        this.lessonScreen = document.getElementById('lessonScreen');
        this.gameScreen = document.getElementById('gameScreen');
        
        this.difficultyCards = document.querySelectorAll('.difficulty-card');
        this.lessonButtons = document.getElementById('lessonButtons');
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreDisplay = document.getElementById('score');
        this.completeMessage = document.getElementById('completeMessage');
        
        this.selectedDifficulty = null;
        this.selectedLesson = null;
        this.cards = [];
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.isProcessingMatch = false;
        
        this.successSound = document.getElementById('successSound');
        this.completeSound = document.getElementById('completeSound');
    }

    initializeEventListeners() {
        this.difficultyCards.forEach(card => {
            card.addEventListener('click', () => {
                const difficulty = card.dataset.difficulty;
                this.selectedDifficulty = difficulty;
                this.router.navigate(this.getDifficultyRoute());
            });
        });

        document.getElementById('backToLessons').addEventListener('click', () => {
            console.log("点击了返回按钮");
            this.difficultyScreen.classList.remove('active');
            this.lessonScreen.classList.add('active');
            this.gameScreen.classList.remove('active');
            this.completeMessage.style.display = 'none';
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartLevel();
        });

        document.getElementById('chooseLessonButton').addEventListener('click', () => {
            this.difficultyScreen.classList.remove('active');
            this.lessonScreen.classList.add('active');
            this.gameScreen.classList.remove('active');
            this.completeMessage.style.display = 'none';
        });
    }

    getDifficultyRoute() {
        return CONFIG.ROUTES.DIFFICULTIES[this.selectedDifficulty];
    }

    initializeLessonSelection(difficulty) {
        this.selectedDifficulty = difficulty;
        this.lessonButtons.innerHTML = '';
        
        if (!this.vocabularyData) {
            console.error("词汇数据尚未加载完成");
            this.createMockData();
        }
        
        if (!this.vocabularyData[difficulty]) {
            console.error(`未找到难度 "${difficulty}" 的数据`);
            this.vocabularyData[difficulty] = {};
            
            for (let i = 1; i <= 16; i++) {
                this.vocabularyData[difficulty][i] = [
                    { english: "Example 1", chinese: "示例 1" },
                    { english: "Example 2", chinese: "示例 2" },
                    { english: "Example 3", chinese: "示例 3" }
                ];
            }
        }
        
        console.log(`为难度 "${difficulty}" 创建课程按钮`);
        
        for (let i = 1; i <= 16; i++) {
            const button = document.createElement('button');
            button.className = 'lesson-btn';
            button.textContent = `第${i}课`;
            button.addEventListener('click', () => this.startGame(i));
            this.lessonButtons.appendChild(button);
        }
    }

    async startGame(lesson) {
        this.selectedLesson = lesson;
        
        if (!this.vocabularyData || !this.vocabularyData[this.selectedDifficulty]) {
            alert('词汇数据未加载，请稍后再试！');
            return;
        }
        
        const vocabulary = this.vocabularyData[this.selectedDifficulty][lesson];
        this.totalPairs = Math.min(20, Math.max(10, vocabulary.length));
        
        const selectedVocabulary = vocabulary.slice(0, this.totalPairs);
        this.createCards(selectedVocabulary);
        
        this.difficultyScreen.classList.remove('active');
        this.lessonScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        this.completeMessage.style.display = 'none';
        
        this.adjustGameBoard();
        this.renderGameBoard();
        this.matchedPairs = 0;
        this.updateScore();
    }

    adjustGameBoard() {
        let columns;
        
        // 强制设置为6列（PC端）
        if (window.innerWidth > 1024) {
            columns = 6; // PC端改为6列
        } else if (window.innerWidth > 768) {
            columns = 5; // 平板显示5列 
        } else {
            columns = 4; // 手机显示4列
        }
        
        console.log(`屏幕宽度: ${window.innerWidth}, 设置列数: ${columns}`);
        this.gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }

    createCards(vocabulary) {
        const cards = [];
        vocabulary.forEach(word => {
            cards.push(
                { type: 'english', content: word.english, pair: word.chinese },
                { type: 'chinese', content: word.chinese, pair: word.english }
            );
        });
        this.cards = this.shuffleArray(cards);
    }

    renderGameBoard() {
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.textContent = card.content;
            
            // 先清除任何可能的样式
            cardElement.style.fontSize = '';
            
            // 根据平台和文本长度设置字体大小
            const isLongText = card.content.length > 8;
            const isPc = window.innerWidth > 768;
            
            if (isPc) {
                // PC端
                if (isLongText) {
                    cardElement.style.fontSize = '20px';
                } else {
                    cardElement.style.fontSize = '20px';
                }
            } else {
                // 移动端 - 增大字体
                if (isLongText) {
                    cardElement.style.fontSize = '15px'; // 长文本增大到15px（原14px）
                } else {
                    cardElement.style.fontSize = '16px'; // 普通文本增大到18px（原16px）
                }
            }
            
            cardElement.addEventListener('click', () => this.handleCardClick(index));
            this.gameBoard.appendChild(cardElement);
        });
        
        this.adjustGameBoard();
    }

    handleCardClick(index) {
        if (this.isProcessingMatch) return;
        
        const cardElement = this.gameBoard.children[index];
        const card = this.cards[index];
        
        if (cardElement.classList.contains('matched') || 
            cardElement.classList.contains('selected') ||
            this.selectedCards.length >= 2) {
            return;
        }
        
        cardElement.classList.add('selected');
        this.selectedCards.push({ element: cardElement, card });
        
        if (this.selectedCards.length === 2) {
            this.checkMatch();
        }
    }

    async checkMatch() {
        this.isProcessingMatch = true;
        const [first, second] = this.selectedCards;
        
        if (first.card.pair === second.card.content) {
            this.matchedPairs++;
            
            try {
                await this.playAudio(this.successSound);
            } catch (error) {
                console.error('播放成功音效失败:', error);
            }
            
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => this.gameComplete(), 500);
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            first.element.classList.remove('selected');
            second.element.classList.remove('selected');
        }
        
        this.selectedCards = [];
        this.isProcessingMatch = false;
        this.updateScore();
    }

    async gameComplete() {
        console.log("游戏完成，播放鼓励音效");
        
        try {
            // 使用新的播放方法
            await this.playAudio(this.completeSound);
        } catch (error) {
            console.error('播放完成音效失败:', error);
        }
        
        // 显示完成消息
        this.completeMessage.style.display = 'block';
    }

    playAudio(audioElement) {
        return new Promise((resolve) => {
            // 设置音量
            audioElement.volume = 1.0;
            
            // 在用户交互后播放
            const playAttempt = () => {
                audioElement.currentTime = 0;
                
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('音频播放成功');
                            resolve();
                        })
                        .catch(error => {
                            console.error('音频播放失败:', error);
                            resolve(); // 继续即使失败
                        });
                } else {
                    // 旧浏览器不返回Promise
                    resolve();
                }
            };
            
            // 尝试播放
            playAttempt();
        });
    }

    updateScore() {
        this.scoreDisplay.textContent = `已匹配: ${this.matchedPairs} / ${this.totalPairs}`;
    }

    restartLevel() {
        this.completeMessage.style.display = 'none';
        this.matchedPairs = 0;
        this.cards = this.shuffleArray([...this.cards]);
        this.renderGameBoard();
        this.updateScore();
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    async loadVocabularyData() {
        try {
            const response = await fetch(CONFIG.DATA_PATH);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.vocabularyData = await response.json();
            
            // 检查URL hash
            const hash = window.location.hash;
            if (CONFIG.ROUTES.HASH_TO_DIFFICULTY[hash]) {
                this.selectedDifficulty = CONFIG.ROUTES.HASH_TO_DIFFICULTY[hash];
            }
        } catch (error) {
            console.error('Failed to load vocabulary data:', error);
            this.createMockData();
        }
    }

    createMockData() {
        this.vocabularyData = {
            '睿学': {
                1: [{ english: "Example 1", chinese: "示例 1" }, { english: "Example 2", chinese: "示例 2" }, { english: "Example 3", chinese: "示例 3" }],
                2: [{ english: "Example 4", chinese: "示例 4" }, { english: "Example 5", chinese: "示例 5" }, { english: "Example 6", chinese: "示例 6" }],
                3: [{ english: "Example 7", chinese: "示例 7" }, { english: "Example 8", chinese: "示例 8" }, { english: "Example 9", chinese: "示例 9" }],
                4: [{ english: "Example 10", chinese: "示例 10" }, { english: "Example 11", chinese: "示例 11" }, { english: "Example 12", chinese: "示例 12" }],
                5: [{ english: "Example 13", chinese: "示例 13" }, { english: "Example 14", chinese: "示例 14" }, { english: "Example 15", chinese: "示例 15" }],
                6: [{ english: "Example 16", chinese: "示例 16" }, { english: "Example 17", chinese: "示例 17" }, { english: "Example 18", chinese: "示例 18" }],
                7: [{ english: "Example 19", chinese: "示例 19" }, { english: "Example 20", chinese: "示例 20" }, { english: "Example 21", chinese: "示例 21" }],
                8: [{ english: "Example 22", chinese: "示例 22" }, { english: "Example 23", chinese: "示例 23" }, { english: "Example 24", chinese: "示例 24" }],
                9: [{ english: "Example 25", chinese: "示例 25" }, { english: "Example 26", chinese: "示例 26" }, { english: "Example 27", chinese: "示例 27" }],
                10: [{ english: "Example 28", chinese: "示例 28" }, { english: "Example 29", chinese: "示例 29" }, { english: "Example 30", chinese: "示例 30" }],
                11: [{ english: "Example 31", chinese: "示例 31" }, { english: "Example 32", chinese: "示例 32" }, { english: "Example 33", chinese: "示例 33" }],
                12: [{ english: "Example 34", chinese: "示例 34" }, { english: "Example 35", chinese: "示例 35" }, { english: "Example 36", chinese: "示例 36" }],
                13: [{ english: "Example 37", chinese: "示例 37" }, { english: "Example 38", chinese: "示例 38" }, { english: "Example 39", chinese: "示例 39" }],
                14: [{ english: "Example 40", chinese: "示例 40" }, { english: "Example 41", chinese: "示例 41" }, { english: "Example 42", chinese: "示例 42" }],
                15: [{ english: "Example 43", chinese: "示例 43" }, { english: "Example 44", chinese: "示例 44" }, { english: "Example 45", chinese: "示例 45" }],
                16: [{ english: "Example 46", chinese: "示例 46" }, { english: "Example 47", chinese: "示例 47" }, { english: "Example 48", chinese: "示例 48" }]
            },
            '精学': {
                1: [{ english: "Example 1", chinese: "示例 1" }, { english: "Example 2", chinese: "示例 2" }, { english: "Example 3", chinese: "示例 3" }],
                2: [{ english: "Example 4", chinese: "示例 4" }, { english: "Example 5", chinese: "示例 5" }, { english: "Example 6", chinese: "示例 6" }],
                3: [{ english: "Example 7", chinese: "示例 7" }, { english: "Example 8", chinese: "示例 8" }, { english: "Example 9", chinese: "示例 9" }],
                4: [{ english: "Example 10", chinese: "示例 10" }, { english: "Example 11", chinese: "示例 11" }, { english: "Example 12", chinese: "示例 12" }],
                5: [{ english: "Example 13", chinese: "示例 13" }, { english: "Example 14", chinese: "示例 14" }, { english: "Example 15", chinese: "示例 15" }],
                6: [{ english: "Example 16", chinese: "示例 16" }, { english: "Example 17", chinese: "示例 17" }, { english: "Example 18", chinese: "示例 18" }],
                7: [{ english: "Example 19", chinese: "示例 19" }, { english: "Example 20", chinese: "示例 20" }, { english: "Example 21", chinese: "示例 21" }],
                8: [{ english: "Example 22", chinese: "示例 22" }, { english: "Example 23", chinese: "示例 23" }, { english: "Example 24", chinese: "示例 24" }],
                9: [{ english: "Example 25", chinese: "示例 25" }, { english: "Example 26", chinese: "示例 26" }, { english: "Example 27", chinese: "示例 27" }],
                10: [{ english: "Example 28", chinese: "示例 28" }, { english: "Example 29", chinese: "示例 29" }, { english: "Example 30", chinese: "示例 30" }],
                11: [{ english: "Example 31", chinese: "示例 31" }, { english: "Example 32", chinese: "示例 32" }, { english: "Example 33", chinese: "示例 33" }],
                12: [{ english: "Example 34", chinese: "示例 34" }, { english: "Example 35", chinese: "示例 35" }, { english: "Example 36", chinese: "示例 36" }],
                13: [{ english: "Example 37", chinese: "示例 37" }, { english: "Example 38", chinese: "示例 38" }, { english: "Example 39", chinese: "示例 39" }],
                14: [{ english: "Example 40", chinese: "示例 40" }, { english: "Example 41", chinese: "示例 41" }, { english: "Example 42", chinese: "示例 42" }],
                15: [{ english: "Example 43", chinese: "示例 43" }, { english: "Example 44", chinese: "示例 44" }, { english: "Example 45", chinese: "示例 45" }],
                16: [{ english: "Example 46", chinese: "示例 46" }, { english: "Example 47", chinese: "示例 47" }, { english: "Example 48", chinese: "示例 48" }]
            },
            '好学': {
                1: [{ english: "Example 1", chinese: "示例 1" }, { english: "Example 2", chinese: "示例 2" }, { english: "Example 3", chinese: "示例 3" }],
                2: [{ english: "Example 4", chinese: "示例 4" }, { english: "Example 5", chinese: "示例 5" }, { english: "Example 6", chinese: "示例 6" }],
                3: [{ english: "Example 7", chinese: "示例 7" }, { english: "Example 8", chinese: "示例 8" }, { english: "Example 9", chinese: "示例 9" }],
                4: [{ english: "Example 10", chinese: "示例 10" }, { english: "Example 11", chinese: "示例 11" }, { english: "Example 12", chinese: "示例 12" }],
                5: [{ english: "Example 13", chinese: "示例 13" }, { english: "Example 14", chinese: "示例 14" }, { english: "Example 15", chinese: "示例 15" }],
                6: [{ english: "Example 16", chinese: "示例 16" }, { english: "Example 17", chinese: "示例 17" }, { english: "Example 18", chinese: "示例 18" }],
                7: [{ english: "Example 19", chinese: "示例 19" }, { english: "Example 20", chinese: "示例 20" }, { english: "Example 21", chinese: "示例 21" }],
                8: [{ english: "Example 22", chinese: "示例 22" }, { english: "Example 23", chinese: "示例 23" }, { english: "Example 24", chinese: "示例 24" }],
                9: [{ english: "Example 25", chinese: "示例 25" }, { english: "Example 26", chinese: "示例 26" }, { english: "Example 27", chinese: "示例 27" }],
                10: [{ english: "Example 28", chinese: "示例 28" }, { english: "Example 29", chinese: "示例 29" }, { english: "Example 30", chinese: "示例 30" }],
                11: [{ english: "Example 31", chinese: "示例 31" }, { english: "Example 32", chinese: "示例 32" }, { english: "Example 33", chinese: "示例 33" }],
                12: [{ english: "Example 34", chinese: "示例 34" }, { english: "Example 35", chinese: "示例 35" }, { english: "Example 36", chinese: "示例 36" }],
                13: [{ english: "Example 37", chinese: "示例 37" }, { english: "Example 38", chinese: "示例 38" }, { english: "Example 39", chinese: "示例 39" }],
                14: [{ english: "Example 40", chinese: "示例 40" }, { english: "Example 41", chinese: "示例 41" }, { english: "Example 42", chinese: "示例 42" }],
                15: [{ english: "Example 43", chinese: "示例 43" }, { english: "Example 44", chinese: "示例 44" }, { english: "Example 45", chinese: "示例 45" }],
                16: [{ english: "Example 46", chinese: "示例 46" }, { english: "Example 47", chinese: "示例 47" }, { english: "Example 48", chinese: "示例 48" }]
            }
        };
    }
} 