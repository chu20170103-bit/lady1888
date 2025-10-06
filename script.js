// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    initializeEventListeners();
});

// 更新當前日期
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    const dateString = now.toLocaleDateString('zh-TW', options);
    document.getElementById('current-date').textContent = dateString;
}


// 初始化事件監聽器
function initializeEventListeners() {
    // 複製按鈕
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 優先使用按鈕自身的 data-copy 屬性
            let textToCopy = this.getAttribute('data-copy');
            
            // 如果按鈕沒有 data-copy 屬性，則從父元素獲取
            if (!textToCopy) {
                const linkItem = this.closest('.link-item');
                textToCopy = linkItem.getAttribute('data-copy');
            }
            
            if (textToCopy) {
                copyToClipboard(textToCopy);
            }
        });
    });
    
    // 妹妹回價工具按鈕
    const pricingToolBtn = document.getElementById('pricing-tool-open');
    if (pricingToolBtn) {
        pricingToolBtn.addEventListener('click', function() {
            window.open('https://chu20170103-bit.github.io/lady1888/pricing_tool.html', '_blank');
        });
    }
}


// 複製到剪貼簿
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`已複製: ${text}`);
    } catch (err) {
        // 備用方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`已複製: ${text}`);
    }
}

// 顯示通知訊息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}



// 翻譯機功能
class Translator {
    constructor() {
        this.modal = document.getElementById('translator-modal');
        this.openBtn = document.getElementById('translator-open');
        this.closeBtn = document.getElementById('translator-close');
        this.sourceLang = document.getElementById('source-lang');
        this.targetLang = document.getElementById('target-lang');
        this.sourceText = document.getElementById('source-text');
        this.targetText = document.getElementById('target-text');
        this.translateBtn = document.getElementById('translate-btn');
        this.copyBtn = document.getElementById('copy-result');
        this.quickBtns = document.querySelectorAll('.quick-btn');
        
        // 防抖動計時器
        this.debounceTimer = null;
        this.isTranslating = false;
        
        this.init();
    }
    
    init() {
        // 開啟彈窗
        this.openBtn.addEventListener('click', () => {
            this.openModal();
        });
        
        // 關閉彈窗
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // 點擊背景關閉
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 翻譯按鈕
        this.translateBtn.addEventListener('click', () => {
            this.translate();
        });
        
        // 複製結果
        this.copyBtn.addEventListener('click', () => {
            this.copyResult();
        });
        
        // 快速翻譯按鈕
        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const from = btn.dataset.from;
                const to = btn.dataset.to;
                this.setLanguages(from, to);
            });
        });
        
        // 即時翻譯 - 輸入時自動翻譯
        this.sourceText.addEventListener('input', () => {
            this.debounceTranslate();
        });
        
        // 語言改變時也觸發翻譯
        this.sourceLang.addEventListener('change', () => {
            if (this.sourceText.value.trim()) {
                this.debounceTranslate();
            }
        });
        
        this.targetLang.addEventListener('change', () => {
            if (this.sourceText.value.trim()) {
                this.debounceTranslate();
            }
        });
        
        // Enter 鍵翻譯
        this.sourceText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.translate();
            }
        });
    }
    
    openModal() {
        this.modal.style.display = 'block';
        this.sourceText.focus();
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    setLanguages(from, to) {
        this.sourceLang.value = from;
        this.targetLang.value = to;
        // 如果已經有文字，立即翻譯
        if (this.sourceText.value.trim()) {
            this.debounceTranslate();
        }
    }
    
    // 防抖動翻譯 - 避免頻繁調用API
    debounceTranslate() {
        // 清除之前的計時器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // 如果正在翻譯中，不重複執行
        if (this.isTranslating) {
            return;
        }
        
        // 設置新的計時器，500ms後執行翻譯
        this.debounceTimer = setTimeout(() => {
            const text = this.sourceText.value.trim();
            if (text && text.length > 0) {
                this.translate();
            } else {
                this.targetText.value = '';
            }
        }, 500);
    }
    
    async translate() {
        const text = this.sourceText.value.trim();
        if (!text) {
            this.targetText.value = '';
            return;
        }
        
        const sourceLang = this.sourceLang.value;
        const targetLang = this.targetLang.value;
        
        if (sourceLang === targetLang) {
            this.targetText.value = '來源語言和目標語言不能相同';
            return;
        }
        
        // 設置翻譯中狀態
        this.isTranslating = true;
        this.targetText.value = '翻譯中...';
        
        try {
            const result = await this.performTranslation(text, sourceLang, targetLang);
            this.targetText.value = result;
        } catch (error) {
            console.error('翻譯錯誤:', error);
            this.targetText.value = '翻譯失敗，請稍後再試';
        } finally {
            this.isTranslating = false;
        }
    }
    
    async performTranslation(text, from, to) {
        // 使用 Google Translate API (免費版本)
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('翻譯服務暫時無法使用');
        }
        
        const data = await response.json();
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0].map(item => item[0]).join('');
        } else {
            throw new Error('翻譯結果格式錯誤');
        }
    }
    
    copyResult() {
        const text = this.targetText.value;
        if (!text) {
            showToast('沒有可複製的內容');
            return;
        }
        
        copyToClipboard(text);
    }
}

// 文字複製工具功能
class TextCopyTool {
    constructor() {
        this.modal = document.getElementById('text-copy-modal');
        this.openBtn = document.getElementById('text-copy-open');
        this.closeBtn = document.getElementById('text-copy-close');
        this.textInput = document.getElementById('text-input');
        this.addTextBtn = document.getElementById('add-text');
        this.clearInputBtn = document.getElementById('clear-input');
        this.textList = document.getElementById('text-list');
        this.favoriteTextList = document.getElementById('favorite-text-list');
        this.importantTextList = document.getElementById('important-text-list');
        this.clearAllBtn = document.getElementById('clear-all');
        this.exportBtn = document.getElementById('export-texts');
        this.clearFavoritesBtn = document.getElementById('clear-favorites');
        this.clearImportantBtn = document.getElementById('clear-important');
        
        this.texts = JSON.parse(localStorage.getItem('textCopyTool_texts') || '[]');
        this.favoriteTexts = JSON.parse(localStorage.getItem('textCopyTool_favorites') || '[]');
        this.importantTexts = JSON.parse(localStorage.getItem('textCopyTool_important') || '[]');
        
        this.init();
    }
    
    init() {
        // 開啟彈窗
        this.openBtn.addEventListener('click', () => {
            this.openModal();
        });
        
        // 關閉彈窗
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // 點擊背景關閉
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 新增文字
        this.addTextBtn.addEventListener('click', () => {
            this.addText();
        });
        
        // 清空輸入
        this.clearInputBtn.addEventListener('click', () => {
            this.clearInput();
        });
        
        // 清空全部
        this.clearAllBtn.addEventListener('click', () => {
            this.clearAll();
        });
        
        // 匯出文字
        this.exportBtn.addEventListener('click', () => {
            this.exportTexts();
        });
        
        // 清空收藏
        this.clearFavoritesBtn.addEventListener('click', () => {
            this.clearFavorites();
        });
        
        // 清空重要文字
        this.clearImportantBtn.addEventListener('click', () => {
            this.clearImportant();
        });
        
        
        // Enter 鍵新增文字
        this.textInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.addText();
            }
        });
        
        // 載入已保存的文字
        this.loadTexts();
        this.loadFavorites();
        this.loadImportant();
    }
    
    openModal() {
        this.modal.style.display = 'block';
        this.textInput.focus();
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    addText() {
        const text = this.textInput.value.trim();
        if (!text) {
            showToast('請輸入要記錄的文字');
            return;
        }
        
        const textItem = {
            id: Date.now(),
            content: text,
            timestamp: new Date().toLocaleString('zh-TW'),
            createdAt: new Date().toISOString()
        };
        
        this.texts.unshift(textItem); // 新增到最前面
        this.saveTexts();
        this.renderTexts();
        this.clearInput();
        showToast('文字已記錄');
    }
    
    clearInput() {
        this.textInput.value = '';
        this.textInput.focus();
    }
    
    clearAll() {
        if (this.texts.length === 0) {
            showToast('沒有可清空的文字');
            return;
        }
        
        if (confirm('確定要清空所有文字記錄嗎？此操作無法復原。')) {
            this.texts = [];
            this.saveTexts();
            this.renderTexts();
            showToast('已清空所有文字記錄');
        }
    }
    
    clearFavorites() {
        if (this.favoriteTexts.length === 0) {
            showToast('沒有可清空的收藏');
            return;
        }
        
        if (confirm('確定要清空所有收藏文字嗎？此操作無法復原。')) {
            this.favoriteTexts = [];
            this.saveFavorites();
            this.renderFavorites();
            showToast('已清空所有收藏文字');
        }
    }
    
    clearImportant() {
        if (this.importantTexts.length === 0) {
            showToast('沒有可清空的重要文字');
            return;
        }
        
        if (confirm('確定要清空所有重要文字嗎？此操作無法復原。')) {
            this.importantTexts = [];
            this.saveImportant();
            this.renderImportant();
            showToast('已清空所有重要文字');
        }
    }
    
    copyText(textId) {
        const textItem = this.texts.find(item => item.id === textId);
        if (textItem) {
            copyToClipboard(textItem.content);
        }
    }
    
    copyFavoriteText(textId) {
        const textItem = this.favoriteTexts.find(item => item.id === textId);
        if (textItem) {
            copyToClipboard(textItem.content);
        }
    }
    
    addToFavorites(textId) {
        const textItem = this.texts.find(item => item.id === textId);
        if (textItem) {
            // 檢查是否已經收藏
            const existingFavorite = this.favoriteTexts.find(item => item.originalId === textId);
            if (existingFavorite) {
                showToast('此文字已經在收藏中');
                return;
            }
            
            const favoriteItem = {
                id: Date.now(),
                originalId: textId,
                content: textItem.content,
                timestamp: new Date().toLocaleString('zh-TW'),
                createdAt: new Date().toISOString()
            };
            
            this.favoriteTexts.unshift(favoriteItem);
            this.saveFavorites();
            this.renderFavorites();
            showToast('已加入收藏');
        }
    }
    
    removeFromFavorites(textId) {
        if (confirm('確定要從收藏中移除嗎？')) {
            this.favoriteTexts = this.favoriteTexts.filter(item => item.id !== textId);
            this.saveFavorites();
            this.renderFavorites();
            showToast('已從收藏中移除');
        }
    }
    
    copyImportantText(textId) {
        const textItem = this.importantTexts.find(item => item.id === textId);
        if (textItem) {
            copyToClipboard(textItem.content);
        }
    }
    
    addToImportant(textId) {
        const textItem = this.texts.find(item => item.id === textId);
        if (textItem) {
            // 檢查是否已經標記為重要
            const existingImportant = this.importantTexts.find(item => item.originalId === textId);
            if (existingImportant) {
                showToast('此文字已經標記為重要');
                return;
            }
            
            const importantItem = {
                id: Date.now(),
                originalId: textId,
                content: textItem.content,
                timestamp: new Date().toLocaleString('zh-TW'),
                createdAt: new Date().toISOString()
            };
            
            this.importantTexts.unshift(importantItem);
            this.saveImportant();
            this.renderImportant();
            this.renderTexts(); // 重新渲染以更新星星狀態
            showToast('已標記為重要文字');
        }
    }
    
    addFavoriteToImportant(favoriteId) {
        const favoriteItem = this.favoriteTexts.find(item => item.id === favoriteId);
        if (favoriteItem) {
            // 檢查是否已經標記為重要
            const existingImportant = this.importantTexts.find(item => item.originalId === favoriteItem.originalId);
            if (existingImportant) {
                showToast('此文字已經標記為重要');
                return;
            }
            
            const importantItem = {
                id: Date.now(),
                originalId: favoriteItem.originalId,
                content: favoriteItem.content,
                timestamp: new Date().toLocaleString('zh-TW'),
                createdAt: new Date().toISOString()
            };
            
            this.importantTexts.unshift(importantItem);
            this.saveImportant();
            this.renderImportant();
            this.renderFavorites(); // 重新渲染以更新星星狀態
            showToast('已標記為重要文字');
        }
    }
    
    toggleImportant(textId) {
        const existingImportant = this.importantTexts.find(item => item.originalId === textId);
        if (existingImportant) {
            // 如果已經標記，則取消標記
            this.importantTexts = this.importantTexts.filter(item => item.originalId !== textId);
            this.saveImportant();
            this.renderImportant();
            this.renderTexts(); // 重新渲染以更新星星狀態
            showToast('已取消重要標記');
        } else {
            // 如果未標記，則標記為重要
            this.addToImportant(textId);
        }
    }
    
    toggleFavoriteImportant(favoriteId) {
        const favoriteItem = this.favoriteTexts.find(item => item.id === favoriteId);
        if (favoriteItem) {
            const existingImportant = this.importantTexts.find(item => item.originalId === favoriteItem.originalId);
            if (existingImportant) {
                // 如果已經標記，則取消標記
                this.importantTexts = this.importantTexts.filter(item => item.originalId !== favoriteItem.originalId);
                this.saveImportant();
                this.renderImportant();
                this.renderFavorites(); // 重新渲染以更新星星狀態
                showToast('已取消重要標記');
            } else {
                // 如果未標記，則標記為重要
                this.addFavoriteToImportant(favoriteId);
            }
        }
    }
    
    removeFromImportant(textId) {
        if (confirm('確定要從重要文字中移除嗎？')) {
            this.importantTexts = this.importantTexts.filter(item => item.id !== textId);
            this.saveImportant();
            this.renderImportant();
            showToast('已從重要文字中移除');
        }
    }
    
    
    
    deleteText(textId) {
        if (confirm('確定要刪除這條文字記錄嗎？')) {
            this.texts = this.texts.filter(item => item.id !== textId);
            this.saveTexts();
            this.renderTexts();
            showToast('文字已刪除');
        }
    }
    
    exportTexts() {
        if (this.texts.length === 0) {
            showToast('沒有可匯出的文字');
            return;
        }
        
        const exportData = this.texts.map(item => 
            `[${item.timestamp}] ${item.content}`
        ).join('\n\n');
        
        const blob = new Blob([exportData], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `文字記錄_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('文字已匯出');
    }
    
    saveTexts() {
        localStorage.setItem('textCopyTool_texts', JSON.stringify(this.texts));
    }
    
    saveFavorites() {
        localStorage.setItem('textCopyTool_favorites', JSON.stringify(this.favoriteTexts));
    }
    
    saveImportant() {
        localStorage.setItem('textCopyTool_important', JSON.stringify(this.importantTexts));
    }
    
    loadTexts() {
        this.renderTexts();
    }
    
    loadFavorites() {
        this.renderFavorites();
    }
    
    loadImportant() {
        this.renderImportant();
    }
    
    renderTexts() {
        if (this.texts.length === 0) {
            this.textList.innerHTML = '<div class="no-texts">尚未記錄任何文字</div>';
            return;
        }
        
        this.textList.innerHTML = this.texts.map(item => {
            const isMarked = this.importantTexts.some(important => important.originalId === item.id);
            return `
                <div class="text-item">
                    <button class="text-item-star-btn ${isMarked ? 'marked' : ''}" onclick="textCopyTool.toggleImportant(${item.id})" title="${isMarked ? '取消重要標記' : '標記為重要'}">
                        <i class="fas fa-star"></i>
                    </button>
                    <div class="text-content">${this.escapeHtml(item.content)}</div>
                    <div class="text-actions">
                        <button class="text-copy-btn" onclick="textCopyTool.copyText(${item.id})">
                            <i class="fas fa-copy"></i> 複製
                        </button>
                        <button class="text-favorite-btn" onclick="textCopyTool.addToFavorites(${item.id})">
                            <i class="fas fa-heart"></i> 收藏
                        </button>
                        <button class="text-delete-btn" onclick="textCopyTool.deleteText(${item.id})">
                            <i class="fas fa-trash"></i> 刪除
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderFavorites() {
        if (this.favoriteTexts.length === 0) {
            this.favoriteTextList.innerHTML = '<div class="no-texts">尚未收藏任何文字</div>';
            return;
        }
        
        this.favoriteTextList.innerHTML = this.favoriteTexts.map(item => {
            const isMarked = this.importantTexts.some(important => important.originalId === item.originalId);
            return `
                <div class="text-item">
                    <button class="text-item-star-btn ${isMarked ? 'marked' : ''}" onclick="textCopyTool.toggleFavoriteImportant(${item.id})" title="${isMarked ? '取消重要標記' : '標記為重要'}">
                        <i class="fas fa-star"></i>
                    </button>
                    <div class="text-content">${this.escapeHtml(item.content)}</div>
                    <div class="text-actions">
                        <button class="text-copy-btn" onclick="textCopyTool.copyFavoriteText(${item.id})">
                            <i class="fas fa-copy"></i> 複製
                        </button>
                        <button class="text-delete-btn" onclick="textCopyTool.removeFromFavorites(${item.id})">
                            <i class="fas fa-heart-broken"></i> 移除
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderImportant() {
        if (this.importantTexts.length === 0) {
            this.importantTextList.innerHTML = '<div class="no-texts">尚未標記任何重要文字</div>';
            return;
        }
        
        this.importantTextList.innerHTML = this.importantTexts.map(item => `
            <div class="text-item">
                <div class="text-content">${this.escapeHtml(item.content)}</div>
                <div class="text-actions">
                    <button class="text-copy-btn" onclick="textCopyTool.copyImportantText(${item.id})">
                        <i class="fas fa-copy"></i> 複製
                    </button>
                    <button class="text-delete-btn" onclick="textCopyTool.removeFromImportant(${item.id})">
                        <i class="fas fa-star"></i> 移除
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 妹妹姓名生產器功能
class NameGenerator {
    constructor() {
        this.modal = document.getElementById('name-generator-modal');
        this.openBtn = document.getElementById('name-generator-open');
        this.closeBtn = document.getElementById('name-generator-close');
        this.styleBtns = document.querySelectorAll('.style-btn');
        this.typeBtns = document.querySelectorAll('.type-btn');
        this.generateBtn = document.getElementById('generate-names');
        this.copyAllBtn = document.getElementById('copy-all-names');
        this.namesDisplay = document.getElementById('names-display');
        
        this.currentStyle = 'cute';
        this.currentType = 'taiwan';
        
        this.init();
    }
    
    init() {
        // 開啟彈窗
        this.openBtn.addEventListener('click', () => {
            this.openModal();
        });
        
        // 關閉彈窗
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // 點擊背景關閉
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 風格按鈕
        this.styleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setStyle(btn.dataset.style);
            });
        });
        
        // 類型按鈕
        this.typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setType(btn.dataset.type);
            });
        });
        
        // 生成按鈕
        this.generateBtn.addEventListener('click', () => {
            this.generateNames(20);
        });
        
        // 複製全部
        this.copyAllBtn.addEventListener('click', () => {
            this.copyAllNames();
        });
    }
    
    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    setStyle(style) {
        this.currentStyle = style;
        this.styleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });
    }
    
    setType(type) {
        this.currentType = type;
        this.typeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
    }
    
    generateNames(count) {
        const names = [];
        const nameSet = new Set(); // 使用Set來避免重複
        
        while (names.length < count && nameSet.size < 1000) { // 防止無限循環
            const name = this.generateName();
            if (!nameSet.has(name)) {
                nameSet.add(name);
                names.push(name);
            }
        }
        
        this.displayNames(names);
    }
    
    generateName() {
        const { firstNames, lastNames } = this.getNameData();
        
        // 過濾出2-3個字的名字
        const filteredFirstNames = firstNames.filter(name => name.length >= 1 && name.length <= 2);
        const filteredLastNames = lastNames.filter(name => name.length >= 1 && name.length <= 2);
        
        const firstName = filteredFirstNames[Math.floor(Math.random() * filteredFirstNames.length)];
        const lastName = filteredLastNames[Math.floor(Math.random() * filteredLastNames.length)];
        
        return `${lastName}${firstName}`;
    }
    
    getNameData() {
        const data = {
            cute: {
                taiwan: {
                    firstNames: ['雅婷', '欣怡', '美玲', '淑芬', '怡君', '佩君', '淑惠', '美惠', '淑娟', '怡如', '雅惠', '美君', '淑貞', '怡芬', '雅芳', '美芳', '淑芳', '怡雯', '雅雯', '美雯', '淑雯', '怡萱', '雅萱', '美萱', '淑萱', '怡蓉', '雅蓉', '美蓉', '淑蓉', '怡慧', '雅慧', '美慧', '淑慧', '怡靜', '雅靜', '美靜', '淑靜', '怡文', '雅文', '美文', '淑文', '怡安', '雅安', '美安', '淑安', '怡欣', '雅欣', '美欣', '淑欣', '怡玲', '雅玲', '美玲', '淑玲', '怡潔', '雅潔', '美潔', '淑潔', '怡琳', '雅琳', '美琳', '淑琳', '怡璇', '雅璇', '美璇', '淑璇', '怡瑄', '雅瑄', '美瑄', '淑瑄', '怡瑩', '雅瑩', '美瑩', '淑瑩', '怡琪', '雅琪', '美琪', '淑琪', '怡瑤', '雅瑤', '美瑤', '淑瑤', '怡珊', '雅珊', '美珊', '淑珊', '怡涵', '雅涵', '美涵', '淑涵', '怡晴', '雅晴', '美晴', '淑晴'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['美咲', '花音', '月乃', '星奈', '夢美', '心愛', '愛美', '美月', '花美', '月花', '美香', '花子', '月子', '星子', '夢子', '心子', '愛子', '美子', '花音', '月音', '星音', '夢音', '心音', '愛音', '美音', '花菜', '月菜', '星菜', '夢菜', '心菜', '愛菜', '美菜', '花穗', '月穗', '星穗', '夢穗', '心穗', '愛穗', '美穗', '花梨', '月梨', '星梨', '夢梨', '心梨', '愛梨', '美梨', '花鈴', '月鈴', '星鈴', '夢鈴', '心鈴', '愛鈴', '美鈴', '花絵', '月絵', '星絵', '夢絵', '心絵', '愛絵', '美絵', '花奈', '月奈', '星奈', '夢奈', '心奈', '愛奈', '美奈', '花紗', '月紗', '星紗', '夢紗', '心紗', '愛紗', '美紗', '花緒', '月緒', '星緒', '夢緒', '心緒', '愛緒', '美緒', '花凛', '月凛', '星凛', '夢凛', '心凛', '愛凛', '美凛', '花織', '月織', '星織', '夢織', '心織', '愛織', '美織', '花衣', '月衣', '星衣', '夢衣', '心衣', '愛衣', '美衣', '花瑠', '月瑠', '星瑠', '夢瑠', '心瑠', '愛瑠', '美瑠', '花瑳', '月瑳', '星瑳', '夢瑳', '心瑳', '愛瑳', '美瑳'],
                    lastNames: ['田中', '佐藤', '鈴木', '高橋', '渡邊', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川', '前田', '岡田', '長谷川', '藤田', '村上', '近藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '藤原', '岡本', '中川', '中野', '原田', '松田', '竹内', '上田', '小野', '田村']
                },
                korea: {
                    firstNames: ['美娜', '花英', '月姬', '星兒', '夢雅', '心美', '愛琳', '美善', '花妍', '月熙', '美妍', '花美', '月美', '星美', '夢美', '心妍', '愛妍', '美英', '花熙', '月英', '星熙', '夢熙', '心熙', '愛熙', '美熙', '花娜', '月娜', '星娜', '夢娜', '心娜', '愛娜', '美娜', '花善', '月善', '星善', '夢善', '心善', '愛善', '美善', '花雅', '月雅', '星雅', '夢雅', '心雅', '愛雅', '美雅', '花琳', '月琳', '星琳', '夢琳', '心琳', '愛琳', '美琳', '花妍', '月妍', '星妍', '夢妍', '心妍', '愛妍', '美妍', '花美', '月美', '星美', '夢美', '心美', '愛美', '美美', '花英', '月英', '星英', '夢英', '心英', '愛英', '美英', '花熙', '月熙', '星熙', '夢熙', '心熙', '愛熙', '美熙', '花娜', '月娜', '星娜', '夢娜', '心娜', '愛娜', '美娜', '花善', '月善', '星善', '夢善', '心善', '愛善', '美善', '花雅', '月雅', '星雅', '夢雅', '心雅', '愛雅', '美雅', '花琳', '月琳', '星琳', '夢琳', '心琳', '愛琳', '美琳'],
                    lastNames: ['金', '李', '朴', '崔', '鄭', '姜', '趙', '尹', '張', '林', '吳', '韓', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '鍾', '譚', '陸', '汪', '范', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['艾瑪', '米雅', '艾娃', '凱特', '妮可', '艾拉', '米拉', '艾拉', '索菲亞', '卡蜜拉', '維多利亞', '凱特', '妮可', '珍妮佛', '安潔莉娜', '布萊克', '史嘉蕾', '艾瑪', '蘇菲亞', '伊莎貝拉', '艾娃', '米雅', '夏洛特', '艾蜜莉', '奧莉薇亞', '艾蜜莉亞', '哈珀', '伊芙琳', '艾比蓋兒', '伊莉莎白', '米拉', '艾拉', '艾佛瑞', '索菲亞', '卡蜜拉', '維多利亞', '凱特', '妮可', '珍妮佛', '安潔莉娜', '布萊克', '史嘉蕾', '艾瑪', '蘇菲亞', '伊莎貝拉', '艾娃', '米雅', '夏洛特', '艾蜜莉', '奧莉薇亞', '艾蜜莉亞', '哈珀', '伊芙琳', '艾比蓋兒', '伊莉莎白', '米拉', '艾拉', '艾佛瑞', '索菲亞', '卡蜜拉', '維多利亞', '凱特', '妮可', '珍妮佛', '安潔莉娜', '布萊克', '史嘉蕾', '艾瑪', '蘇菲亞', '伊莎貝拉', '艾娃', '米雅', '夏洛特', '艾蜜莉', '奧莉薇亞', '艾蜜莉亞', '哈珀', '伊芙琳', '艾比蓋兒', '伊莉莎白', '米拉', '艾拉', '艾佛瑞', '索菲亞', '卡蜜拉', '維多利亞', '凱特', '妮可', '珍妮佛', '安潔莉娜', '布萊克', '史嘉蕾'],
                    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']
                }
            },
            fashion: {
                taiwan: {
                    firstNames: ['雅蘿', '蘿艾', '琳雅', '蘿雅', '艾芙', '莉安', '詩莉', '詩莉', '琳安', '雅芙', '芙莉', '詩安', '艾婕', '蘿安', '詩薇', '安莉', '蘿安', '琳蘿', '蘿詩', '艾琳', '莉薇', '艾琳', '詩芙', '蘿雅', '薇艾', '莉蘿', '莉詩', '芙詩', '薇婕', '莉琳', '蘿琳', '雅蘿', '艾莉', '蘿艾', '雅婕', '詩雅', '安蘿', '安莉', '安婕', '安薇', '芙安', '芙琳', '芙艾', '莉雅', '艾安', '蘿詩', '婕婕', '婕莉', '艾艾', '艾安', '安薇', '安薇', '雅琳', '安琳', '琳薇', '婕莉', '莉琳', '雅婕', '安雅', '莉蘿', '琳薇', '蘿婕', '艾蘿', '詩婕', '薇琳', '莉薇', '琳芙', '雅蘿', '琳莉', '蘿薇', '安詩', '莉芙', '薇蘿', '安蘿', '琳安', '莉安', '雅詩', '薇安', '琳蘿', '莉婕', '艾詩', '婕芙', '雅雅', '蘿蘿', '艾薇', '薇莉', '莉莉', '雅芙', '琳琳', '薇詩', '琳薇', '琳芙', '蘿蘿', '安琳', '蘿婕', '芙婕', '蘿芙', '安莉', '雅琳', '薇薇', '雅莉', '安薇', '薇莉', '琳詩', '蘿雅', '詩婕', '芙艾', '雅琳', '琳安', '芙雅', '詩薇', '薇芙', '薇婕', '薇薇', '琳詩', '安蘿', '艾薇', '雅詩', '艾安', '芙婕', '薇莉', '薇詩', '雅薇', '薇詩', '芙莉', '婕莉', '薇安', '薇雅', '琳雅', '詩詩', '雅蘿', '芙薇', '詩詩', '詩詩', '莉雅', '安芙', '詩艾', '薇莉', '安安', '琳婕', '艾芙', '雅蘿', '婕蘿', '薇雅', '婕艾', '詩婕', '安蘿', '詩雅', '莉艾', '琳安', '琳詩', '雅詩', '婕詩', '艾安', '莉詩', '琳詩', '艾雅', '詩詩', '安詩', '琳艾', '蘿艾', '琳薇', '琳雅', '蘿詩', '琳蘿', '蘿詩', '婕蘿', '芙薇', '婕詩', '莉艾', '蘿詩', '安蘿', '雅莉', '雅琳', '詩詩', '薇詩', '詩雅', '詩芙', '蘿蘿', '芙薇', '雅安', '詩安', '婕詩', '安芙', '艾安', '琳詩', '安琳', '艾艾', '安婕', '琳蘿', '雅琳', '琳詩', '詩蘿', '薇莉', '雅安', '莉艾', '艾安', '安艾', '薇艾', '薇雅', '雅雅', '雅蘿', '安雅', '莉詩', '薇安', '安蘿', '莉莉', '艾蘿', '婕安', '芙蘿', '薇安', '婕薇', '蘿婕', '薇詩', '莉琳', '雅安', '艾安', '婕蘿', '艾詩', '蘿薇', '雅婕', '薇雅', '芙婕', '薇安', '莉莉', '安詩', '詩芙', '蘿蘿', '婕薇', '雅莉', '薇安', '芙蘿', '芙琳', '莉莉', '婕婕', '婕詩', '莉詩', '芙艾', '琳婕', '安薇', '蘿安', '琳艾', '安芙', '琳莉', '詩安', '芙婕', '蘿詩', '琳蘿', '艾雅', '莉芙', '雅艾', '莉薇', '艾安', '安琳', '安芙', '蘿安', '詩詩', '薇蘿', '詩安', '艾安', '詩蘿', '蘿婕', '蘿琳', '薇蘿', '艾薇', '蘿雅', '婕雅', '芙雅', '詩芙', '安婕', '雅雅', '婕蘿', '蘿安', '婕薇', '琳薇', '薇蘿', '艾詩', '芙詩', '薇詩', '安芙', '詩琳', '莉安', '詩雅', '詩蘿', '蘿安', '莉詩', '蘿琳', '莉薇', '艾艾', '薇莉', '詩安', '艾婕', '詩芙', '艾婕', '詩婕', '雅艾', '婕艾', '琳芙', '安詩', '蘿琳', '婕琳', '蘿琳', '雅詩', '琳安', '詩蘿', '芙婕', '詩薇', '薇安', '艾薇', '莉艾', '雅蘿', '芙婕', '安安', '芙蘿', '安雅', '薇艾', '婕薇', '婕芙', '雅詩', '薇蘿', '薇安', '芙艾', '詩詩', '莉莉', '蘿蘿', '琳薇', '詩艾', '芙莉', '詩雅', '婕薇', '莉艾', '芙琳', '艾艾', '安琳', '琳琳', '雅琳', '艾薇', '詩芙', '雅蘿', '雅薇', '詩薇', '詩薇', '蘿蘿', '蘿薇', '艾莉', '芙琳', '蘿雅', '薇安', '莉詩', '艾蘿', '蘿芙', '莉芙', '蘿琳', '蘿艾', '婕雅', '琳蘿', '薇蘿', '雅婕', '莉安', '婕艾', '芙莉', '琳琳', '蘿薇', '琳芙', '芙薇', '莉詩', '雅婕', '安雅', '莉琳', '艾安', '莉芙', '薇安', '芙雅', '琳艾', '詩雅', '蘿琳', '雅蘿', '詩莉', '艾婕', '芙薇', '艾艾', '莉雅', '芙薇', '琳蘿', '艾詩', '詩婕', '雅詩', '琳芙', '詩婕', '婕芙', '琳琳', '安詩', '婕艾', '艾安', '蘿雅', '莉莉', '雅薇', '詩莉', '蘿雅', '安芙', '詩莉', '莉安', '琳安', '莉安', '薇雅', '詩莉', '雅詩', '安婕', '琳艾', '雅莉', '莉婕', '莉琳', '婕琳', '婕薇', '琳艾', '雅婕', '琳雅', '安芙', '雅婕', '雅琳', '琳艾', '艾琳', '婕芙', '芙婕', '婕芙', '婕莉', '詩琳', '薇安', '薇雅', '艾蘿', '薇婕', '婕安', '艾琳', '莉雅', '婕莉', '琳蘿', '芙安', '蘿琳', '蘿艾', '婕蘿', '薇莉', '艾雅', '婕薇', '雅安', '薇安', '雅婕', '艾雅', '安芙', '詩安', '莉薇', '雅婕', '艾雅', '薇芙', '雅艾', '雅婕', '芙蘿', '薇安', '芙艾', '芙芙', '蘿安', '安琳', '艾雅', '芙莉', '婕艾', '婕安', '婕雅', '詩薇', '詩蘿', '雅雅', '芙莉', '蘿琳', '雅雅', '琳婕', '艾芙', '艾詩', '莉艾', '薇莉', '琳芙', '婕雅', '莉薇', '婕琳', '婕琳', '莉薇', '琳婕', '雅雅', '莉蘿', '詩芙', '詩安', '芙雅', '雅安', '艾薇', '婕芙', '雅薇', '芙安', '雅薇', '琳艾', '蘿薇', '詩蘿', '莉芙', '蘿莉'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['時', '尚', '潮', '流', '雅', '婷', '欣', '怡', '柔', '嬌', '美', '麗', '清', '秀', '婉', '約', '端', '莊', '淑', '女', '時尚', '潮流', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '美美', '麗麗', '清清', '秀秀', '婉婉', '約約', '端端', '莊莊', '淑淑', '女女', '時子', '尚美', '潮音', '流美', '雅子', '婷美', '欣子', '怡美', '柔子', '嬌美'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                korea: {
                    firstNames: ['時', '尚', '潮', '流', '雅', '婷', '欣', '怡', '柔', '嬌', '美', '麗', '清', '秀', '婉', '約', '端', '莊', '淑', '女', '時尚', '潮流', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '美美', '麗麗', '清清', '秀秀', '婉婉', '約約', '端端', '莊莊', '淑淑', '女女', '時妍', '尚美', '潮流', '流美', '雅妍', '婷美', '欣妍', '怡美', '柔妍', '嬌美'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['時', '尚', '潮', '流', '雅', '婷', '欣', '怡', '柔', '嬌', '美', '麗', '清', '秀', '婉', '約', '端', '莊', '淑', '女', '時尚', '潮流', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '美美', '麗麗', '清清', '秀秀', '婉婉', '約約', '端端', '莊莊', '淑淑', '女女', '維多利亞', '凱特', '妮可', '珍妮佛', '安潔莉娜', '布萊克', '史嘉蕾', '艾瑪', '蘇菲亞', '伊莎貝拉', '艾娃', '米雅', '夏洛特', '艾蜜莉', '奧莉薇亞', '艾蜜莉亞', '哈珀', '伊芙琳', '艾比蓋兒', '伊莉莎白', '米拉', '艾拉', '艾佛瑞', '索菲亞', '卡蜜拉'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                }
            },
            celebrity: {
                taiwan: {
                    firstNames: ['影安', '星琳', '光薇', '星雅', '影雅', '曦艾', '辰艾', '影婕', '辰蘿', '宙芙', '光莉', '月雅', '光薇', '影蘿', '月蘿', '月芙', '月雅', '辰艾', '晶莉', '月安', '宙婕', '光婕', '宙薇', '夢詩', '辰莉', '夢芙', '星芙', '光雅', '曦艾', '晶芙', '辰薇', '夢艾', '月詩', '幻婕', '晶婕', '曦琳', '晶薇', '曦艾', '宙莉', '宙莉', '幻安', '晶安', '辰艾', '辰莉', '辰艾', '影琳', '辰婕', '曦琳', '影艾', '曦蘿', '夢薇', '光婕', '辰安', '月艾', '光莉', '月薇', '月安', '星艾', '幻詩', '幻安', '光安', '星蘿', '幻安', '幻芙', '幻安', '宙薇', '辰芙', '晶艾', '宙詩', '影雅', '光蘿', '夢芙', '月蘿', '月琳', '晶雅', '幻安', '幻詩', '影安', '晶安', '幻芙', '夢安', '影安', '辰莉', '晶詩', '影艾', '夢艾', '星薇', '夢艾', '星安', '光蘿', '月安', '影詩', '宙莉', '曦詩', '宙艾', '晶婕', '星艾', '宙雅', '晶莉', '光艾', '光蘿', '影婕', '辰莉', '月雅', '星蘿', '辰艾', '辰莉', '辰琳', '宙詩', '幻莉', '光蘿', '月薇', '影蘿', '月艾', '辰琳', '光婕', '宙蘿', '幻雅', '影雅', '辰艾', '光艾', '夢蘿', '月雅', '夢薇', '光艾', '月琳', '影薇', '月莉', '幻琳', '幻安', '辰安', '幻芙', '月詩', '光婕', '月雅', '幻莉', '晶芙', '星薇', '晶雅', '辰琳', '幻芙', '幻安', '幻蘿', '夢安', '夢薇', '幻蘿', '曦婕', '曦芙', '光雅', '宙安', '影薇', '影安', '曦婕', '曦雅', '夢安', '星艾', '辰琳', '星蘿', '幻薇', '曦艾', '夢詩', '光婕', '夢莉', '夢蘿', '幻婕', '光艾', '夢薇', '晶莉', '光莉', '幻安', '星安', '月蘿', '光薇', '宙詩', '辰琳', '幻芙', '月艾', '宙薇', '影安', '宙安', '曦蘿', '曦雅', '幻安', '幻琳', '晶婕', '影琳', '晶艾', '曦芙', '光芙', '宙雅', '晶莉', '曦詩', '光安', '晶莉', '辰婕', '幻婕', '曦芙', '宙婕', '月艾', '辰琳', '曦芙', '月雅', '宙莉', '光莉', '星詩', '光薇', '夢雅', '幻蘿', '曦薇', '晶艾', '光詩', '光婕', '曦莉', '星詩', '曦詩', '月琳', '幻艾', '辰芙', '曦琳', '星琳', '光琳', '光芙', '幻詩', '星雅', '月艾', '星薇', '曦婕', '幻薇', '夢莉', '光艾', '月莉', '月艾', '月莉', '光詩', '曦莉', '光薇', '星詩', '辰雅', '影艾', '星琳', '晶蘿', '幻詩', '光詩', '幻艾', '月蘿', '影安', '晶詩', '夢薇', '宙詩', '曦芙', '光琳', '幻雅', '星安', '宙琳', '影婕', '曦詩', '月芙', '晶雅', '曦芙', '晶雅', '幻艾', '月婕', '幻蘿', '晶艾', '晶芙', '曦芙', '月雅', '宙蘿', '月蘿', '影薇', '光琳', '晶薇', '星安', '幻蘿', '晶安', '月琳', '月琳', '幻安', '影莉', '宙芙', '宙艾', '星安', '月婕', '月雅', '曦婕', '宙蘿', '幻婕', '月安', '光莉', '宙琳', '辰雅', '星薇', '辰琳', '星薇', '星薇', '夢安', '辰琳', '幻芙', '月艾', '辰薇', '光琳', '幻婕', '晶莉', '光莉', '星詩', '宙芙', '幻芙', '月芙', '晶雅', '辰芙', '光艾', '光婕', '光薇', '夢婕', '影莉', '辰婕', '光雅', '月艾', '月雅', '辰雅', '宙琳', '幻艾', '夢詩', '夢雅', '光芙', '辰琳', '夢莉', '星薇', '幻琳', '影薇', '月琳', '夢安', '影琳', '辰詩', '宙莉', '星芙', '曦詩', '光莉', '影蘿', '晶安', '影莉', '影薇', '幻芙', '宙薇', '光艾', '曦薇', '辰安', '辰芙', '幻艾', '星雅', '曦婕', '光雅', '幻詩', '月艾', '夢詩', '宙芙', '辰琳', '幻薇', '晶艾', '宙婕', '曦詩', '影蘿', '影芙', '幻莉', '星艾', '曦莉', '宙蘿', '晶琳', '光安', '月琳', '宙安', '辰安', '晶薇', '影莉', '月婕', '光芙', '幻婕', '影安', '星芙', '光蘿', '影詩', '辰莉', '夢詩', '光詩', '宙琳', '光琳', '辰薇', '曦蘿', '星艾', '影薇', '幻詩', '辰琳', '夢雅', '星薇', '晶安', '影芙', '星莉', '星艾', '晶薇', '夢琳', '宙詩', '影蘿', '幻琳', '宙蘿', '光詩', '月艾', '宙琳', '夢芙', '曦琳', '光安', '光莉', '辰芙', '月莉', '辰安', '宙芙', '光雅', '影蘿', '影安', '影婕', '曦艾', '月安', '幻薇', '夢詩', '月安', '月詩', '月蘿', '月詩', '幻艾', '月雅', '宙琳', '曦艾', '光芙', '辰安', '夢艾', '曦薇', '辰芙', '影詩', '夢蘿', '光婕', '星琳', '晶詩', '曦蘿', '影艾', '夢琳', '幻蘿', '月芙', '星婕', '影安', '宙艾', '宙薇', '星芙', '宙琳', '星薇', '晶薇', '曦蘿', '月琳', '影莉', '夢莉', '宙琳', '星莉', '辰莉', '星婕', '影詩', '晶薇', '夢雅', '幻安', '星芙', '晶蘿', '晶莉', '星安', '星芙', '影婕', '宙安', '光蘿', '辰芙', '辰安', '星芙', '月琳', '辰艾', '光艾', '影琳', '影艾', '晶芙', '曦薇', '月芙', '辰莉', '夢安', '幻薇', '月莉', '光蘿', '夢芙', '曦安', '曦雅', '幻安', '夢安', '影婕', '夢詩', '影詩', '晶婕', '光蘿'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['小', '美', '花', '月', '星', '夢', '心', '愛', '雅', '婷', '欣', '怡', '柔', '嬌', '萌', '寶', '小美', '花花', '月月', '星星', '夢夢', '心心', '愛愛', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '萌萌', '寶寶', '新垣結衣', '石原里美', '長澤雅美', '綾瀨遙', '上戶彩', '深田恭子', '松島菜菜子', '中山美穗', '酒井法子', '工藤靜香', '安室奈美惠', '濱崎步', '宇多田光', '倉木麻衣', '倖田來未', '中島美嘉', '大塚愛', '西野加奈', 'Perfume', 'AKB48'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                korea: {
                    firstNames: ['小', '美', '花', '月', '星', '夢', '心', '愛', '雅', '婷', '欣', '怡', '柔', '嬌', '萌', '寶', '小美', '花花', '月月', '星星', '夢夢', '心心', '愛愛', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '萌萌', '寶寶', '少女時代', '太妍', '潔西卡', '蒂芬妮', '徐玄', '秀英', '俞利', '孝淵', '潤娥', 'Sunny', 'f(x)', '宋茜', 'Amber', 'Luna', 'Krystal', '雪莉', 'Victoria', '2NE1', 'CL', '朴春', 'Dara', '敏智', 'Wonder Girls', '先藝', '譽恩', '昭熙', '瑜斌', '惠林', '宣美', 'AOA', '雪炫', '草娥', '惠晶', '酉奈', '珉娥', '智珉', '有慶', '澯美', 'Red Velvet', 'Irene', '瑟琪', 'Wendy', 'Joy', 'Yeri', 'TWICE', '娜璉', '定延', 'Momo', 'Sana', '志效', 'Mina', '多賢', '彩瑛', '子瑜', 'ITZY', '禮志', 'Lia', '留真', '彩領', '有娜', 'NewJeans', 'Minji', 'Hanni', 'Danielle', 'Haerin', 'Hyein', 'LE SSERAFIM', '金采源', '許允真', '中村一葉', 'Kazuha', '洪恩採', 'LE SSERAFIM', '金采源', '許允真', '中村一葉', 'Kazuha', '洪恩採'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['小', '美', '花', '月', '星', '夢', '心', '愛', '雅', '婷', '欣', '怡', '柔', '嬌', '萌', '寶', '小美', '花花', '月月', '星星', '夢夢', '心心', '愛愛', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '萌萌', '寶寶', '泰勒', '艾薇兒', '布蘭妮', '克莉絲汀', '瑪丹娜', '席琳狄翁', '惠妮休斯頓', '瑪麗亞凱莉', '碧昂絲', '蕾哈娜', '凱蒂佩芮', '女神卡卡', '愛黛兒', '艾莉西亞', '艾莉森', '艾瑪', '蘇菲亞', '伊莎貝拉', '艾娃', '米雅', '夏洛特', '艾蜜莉', '奧莉薇亞', '艾蜜莉亞', '哈珀', '伊芙琳', '艾比蓋兒', '伊莉莎白', '米拉', '艾拉', '艾佛瑞', '索菲亞', '卡蜜拉', '維多利亞', '凱特', '妮可', '珍妮佛', '安潔莉娜', '布萊克', '史嘉蕾', '艾瑪', '蘇菲亞', '伊莎貝拉', '艾娃', '米雅', '夏洛特', '艾蜜莉', '奧莉薇亞', '艾蜜莉亞', '哈珀', '伊芙琳', '艾比蓋兒', '伊莉莎白', '米拉', '艾拉', '艾佛瑞', '索菲亞', '卡蜜拉'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                }
            },
            repeated: {
                taiwan: {
                    firstNames: ['甜甜', '可可', '奈奈', '樂樂', '靜靜', '可可', '莉莉', '樂樂', '萌萌', '安安', '靜靜', '莉莉', '甜甜', '樂樂', '安安', '靜靜', '奈奈', '樂樂', '莉莉', '甜甜', '甜甜', '萌萌', '樂樂', '安安', '可可', '朵朵', '奈奈', '安安', '靜靜', '靜靜', '朵朵', '朵朵', '甜甜', '朵朵', '朵朵', '樂樂', '安安', '安安', '萌萌', '樂樂', '莉莉', '莉莉', '可可', '靜靜', '奈奈', '甜甜', '安安', '奈奈', '甜甜', '萌萌', '奈奈', '莉莉', '甜甜', '靜靜', '樂樂', '甜甜', '莉莉', '安安', '萌萌', '朵朵', '莉莉', '靜靜', '朵朵', '奈奈', '安安', '莉莉', '靜靜', '樂樂', '奈奈', '可可', '可可', '靜靜', '安安', '萌萌', '可可', '莉莉', '可可', '安安', '靜靜', '可可', '奈奈', '安安', '心心', '萌萌', '朵朵', '甜甜', '可可', '朵朵', '朵朵', '心心', '安安', '朵朵', '朵朵', '心心', '樂樂', '莉莉', '可可', '靜靜', '莉莉', '萌萌', '奈奈', '安安', '萌萌', '莉莉', '萌萌', '莉莉', '奈奈', '萌萌', '萌萌', '奈奈', '靜靜', '萌萌', '心心', '安安', '甜甜', '莉莉', '奈奈', '樂樂', '心心', '甜甜', '甜甜', '朵朵', '甜甜', '安安', '萌萌', '朵朵', '莉莉', '朵朵', '靜靜', '安安', '心心', '朵朵', '可可', '靜靜', '樂樂', '朵朵', '靜靜', '奈奈', '朵朵', '莉莉', '甜甜', '萌萌', '靜靜', '可可', '靜靜', '心心', '萌萌', '心心', '安安', '莉莉', '莉莉', '莉莉', '靜靜', '朵朵', '可可', '奈奈', '靜靜', '安安', '奈奈', '心心', '萌萌', '甜甜', '安安', '萌萌', '莉莉', '奈奈', '靜靜', '安安', '朵朵', '甜甜', '樂樂', '樂樂', '可可', '心心', '心心', '莉莉', '心心', '心心', '心心', '萌萌', '心心', '可可', '樂樂', '可可', '甜甜', '奈奈', '朵朵', '可可', '樂樂', '可可', '心心', '奈奈', '安安', '朵朵', '可可', '心心', '安安', '莉莉', '心心', '奈奈', '樂樂', '可可', '奈奈', '樂樂', '可可', '朵朵', '萌萌', '安安', '靜靜', '心心', '莉莉', '靜靜', '甜甜', '萌萌', '心心', '樂樂', '可可', '萌萌', '可可', '莉莉', '樂樂', '奈奈', '萌萌', '安安', '朵朵', '萌萌', '靜靜', '莉莉', '靜靜', '靜靜', '安安', '心心', '樂樂', '靜靜', '心心', '靜靜', '可可', '甜甜', '莉莉', '甜甜', '可可', '心心', '靜靜', '奈奈', '甜甜', '樂樂', '心心', '心心', '莉莉', '萌萌', '朵朵', '可可', '奈奈', '心心', '奈奈', '樂樂', '可可', '甜甜', '甜甜', '朵朵', '奈奈', '甜甜', '安安', '萌萌', '萌萌', '心心', '安安', '奈奈', '莉莉', '朵朵', '甜甜', '莉莉', '萌萌', '樂樂', '心心', '萌萌', '可可', '朵朵', '莉莉', '朵朵', '甜甜', '樂樂', '安安', '心心', '奈奈', '莉莉', '樂樂', '甜甜', '心心', '可可', '朵朵', '安安', '朵朵', '萌萌', '甜甜', '萌萌', '心心', '安安', '心心', '靜靜', '心心', '朵朵', '奈奈', '心心', '朵朵', '莉莉', '安安', '安安', '靜靜', '甜甜', '可可', '莉莉', '心心', '莉莉', '樂樂', '安安', '心心', '莉莉', '萌萌', '靜靜', '樂樂', '莉莉', '樂樂', '樂樂', '甜甜', '甜甜', '朵朵', '心心', '安安', '朵朵', '安安', '安安', '安安', '心心', '心心', '奈奈', '萌萌', '朵朵', '甜甜', '心心', '萌萌', '甜甜', '安安', '萌萌', '靜靜', '可可', '甜甜', '樂樂', '心心', '靜靜', '奈奈', '安安', '心心', '莉莉', '安安', '可可', '萌萌', '可可', '奈奈', '奈奈', '甜甜', '安安', '可可', '靜靜', '朵朵', '朵朵', '可可', '可可', '可可', '安安', '奈奈', '可可', '萌萌', '萌萌', '朵朵', '萌萌', '可可', '莉莉', '靜靜', '甜甜', '奈奈', '萌萌', '樂樂', '奈奈', '安安', '樂樂', '樂樂', '奈奈', '安安', '可可', '樂樂', '甜甜', '甜甜', '朵朵', '萌萌', '甜甜', '萌萌', '奈奈', '奈奈', '甜甜', '奈奈', '萌萌', '樂樂', '安安', '樂樂', '心心', '靜靜', '樂樂', '莉莉', '可可', '奈奈', '奈奈', '奈奈', '朵朵', '安安', '莉莉', '甜甜', '安安', '朵朵', '靜靜', '甜甜', '朵朵', '心心', '安安', '安安', '奈奈', '奈奈', '莉莉', '安安', '朵朵', '奈奈', '靜靜', '甜甜', '樂樂', '奈奈', '安安', '安安', '心心', '心心', '朵朵', '朵朵', '可可', '安安', '莉莉', '奈奈', '心心', '萌萌', '心心', '甜甜', '靜靜', '樂樂', '朵朵', '奈奈', '莉莉', '樂樂', '靜靜', '奈奈', '甜甜', '樂樂', '朵朵', '萌萌', '奈奈', '靜靜', '靜靜', '萌萌', '朵朵', '莉莉', '奈奈', '奈奈', '朵朵', '可可', '可可', '甜甜', '莉莉', '莉莉', '萌萌', '甜甜', '心心', '樂樂', '朵朵', '奈奈', '甜甜', '莉莉', '心心', '可可', '朵朵', '靜靜', '甜甜', '萌萌', '朵朵', '莉莉', '甜甜', '可可', '萌萌', '心心', '心心', '奈奈', '靜靜', '奈奈', '莉莉'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['美美', '花花', '月月', '星星', '夢夢', '心心', '愛愛', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '萌萌', '寶寶', '美咲', '花音', '月乃', '星奈', '夢美', '心愛', '愛美', '美月', '花美', '月花', '美香', '花子', '月子', '星子', '夢子', '心子', '愛子', '美子', '花音', '月音', '星音', '夢音', '心音', '愛音', '美音', '花菜', '月菜', '星菜', '夢菜', '心菜', '愛菜', '美菜', '花穗', '月穗', '星穗', '夢穗', '心穗', '愛穗', '美穗', '花梨', '月梨', '星梨', '夢梨', '心梨', '愛梨', '美梨', '花鈴', '月鈴', '星鈴', '夢鈴', '心鈴', '愛鈴', '美鈴', '花絵', '月絵', '星絵', '夢絵', '心絵', '愛絵', '美絵', '花奈', '月奈', '星奈', '夢奈', '心奈', '愛奈', '美奈', '花紗', '月紗', '星紗', '夢紗', '心紗', '愛紗', '美紗', '花緒', '月緒', '星緒', '夢緒', '心緒', '愛緒', '美緒', '花凛', '月凛', '星凛', '夢凛', '心凛', '愛凛', '美凛', '花織', '月織', '星織', '夢織', '心織', '愛織', '美織', '花衣', '月衣', '星衣', '夢衣', '心衣', '愛衣', '美衣', '花瑠', '月瑠', '星瑠', '夢瑠', '心瑠', '愛瑠', '美瑠', '花瑳', '月瑳', '星瑳', '夢瑳', '心瑳', '愛瑳', '美瑳'],
                    lastNames: ['田中', '佐藤', '鈴木', '高橋', '渡邊', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川', '前田', '岡田', '長谷川', '藤田', '村上', '近藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '藤原', '岡本', '中川', '中野', '原田', '松田', '竹内', '上田', '小野', '田村']
                },
                korea: {
                    firstNames: ['美美', '花花', '月月', '星星', '夢夢', '心心', '愛愛', '雅雅', '婷婷', '欣欣', '怡怡', '柔柔', '嬌嬌', '萌萌', '寶寶', '美娜', '花英', '月姬', '星兒', '夢雅', '心美', '愛琳', '美善', '花妍', '月熙', '美妍', '花美', '月美', '星美', '夢美', '心妍', '愛妍', '美英', '花熙', '月英', '星熙', '夢熙', '心熙', '愛熙', '美熙', '花娜', '月娜', '星娜', '夢娜', '心娜', '愛娜', '美娜', '花善', '月善', '星善', '夢善', '心善', '愛善', '美善', '花雅', '月雅', '星雅', '夢雅', '心雅', '愛雅', '美雅', '花琳', '月琳', '星琳', '夢琳', '心琳', '愛琳', '美琳', '花妍', '月妍', '星妍', '夢妍', '心妍', '愛妍', '美妍', '花美', '月美', '星美', '夢美', '心美', '愛美', '美美', '花英', '月英', '星英', '夢英', '心英', '愛英', '美英', '花熙', '月熙', '星熙', '夢熙', '心熙', '愛熙', '美熙', '花娜', '月娜', '星娜', '夢娜', '心娜', '愛娜', '美娜', '花善', '月善', '星善', '夢善', '心善', '愛善', '美善', '花雅', '月雅', '星雅', '夢雅', '心雅', '愛雅', '美雅', '花琳', '月琳', '星琳', '夢琳', '心琳', '愛琳', '美琳'],
                    lastNames: ['金', '李', '朴', '崔', '鄭', '姜', '趙', '尹', '張', '林', '吳', '韓', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '鍾', '譚', '陸', '汪', '范', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['Emma', 'Mia', 'Ava', 'Kate', 'Nico', 'Ella', 'Mila', 'Sofia', 'Camila', 'Victoria', 'Kate', 'Nico', 'Jennifer', 'Angelina', 'Blake', 'Scarlett', 'Emma', 'Sofia', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Emily', 'Olivia', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Victoria', 'Kate', 'Nico', 'Jennifer', 'Angelina', 'Blake', 'Scarlett', 'Emma', 'Sofia', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Emily', 'Olivia', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Victoria', 'Kate', 'Nico', 'Jennifer', 'Angelina', 'Blake', 'Scarlett', 'Emma', 'Sofia', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Emily', 'Olivia', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Victoria', 'Kate', 'Nico', 'Jennifer', 'Angelina', 'Blake', 'Scarlett'],
                    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']
                }
            },
            fruit: {
                taiwan: {
                    firstNames: ['葡婕', '果琳', '蘋婕', '桃雅', '葡婕', '桃婕', '荔蘿', '莓薇', '蘋艾', '柚安', '果琳', '葡琳', '桃薇', '梨薇', '梨琳', '莓艾', '柚莉', '梨婕', '檸蘿', '梨詩', '蘋詩', '橙薇', '莓艾', '葡詩', '梨芙', '桃蘿', '莓婕', '檸艾', '蘋婕', '果婕', '檸薇', '葡芙', '檸雅', '莓艾', '蘋艾', '檸薇', '果薇', '果薇', '莓薇', '橙雅', '橙琳', '葡芙', '荔詩', '果安', '蘋莉', '桃薇', '檸婕', '梨蘿', '檸艾', '果安', '荔雅', '桃莉', '蘋詩', '果芙', '檸蘿', '蘋薇', '莓艾', '蘋詩', '橙婕', '蘋安', '莓艾', '桃安', '荔芙', '蘋莉', '果艾', '橙雅', '檸雅', '葡薇', '葡琳', '蘋婕', '蘋雅', '橙蘿', '荔婕', '橙琳', '橙蘿', '莓雅', '蘋蘿', '果安', '葡莉', '葡艾', '梨芙', '柚薇', '葡艾', '桃蘿', '桃莉', '果詩', '桃艾', '檸蘿', '梨蘿', '果雅', '梨婕', '橙芙', '梨詩', '檸雅', '莓安', '檸婕', '荔婕', '果雅', '梨薇', '柚琳', '梨薇', '橙婕', '橙安', '桃琳', '果安', '荔蘿', '荔琳', '荔薇', '檸婕', '桃芙', '蘋薇', '莓雅', '桃莉', '梨雅', '葡琳', '荔蘿', '桃雅', '葡莉', '桃薇', '橙琳', '莓蘿', '蘋艾', '葡蘿', '果蘿', '蘋詩', '葡雅', '梨安', '檸艾', '蘋安', '橙雅', '荔雅', '橙莉', '檸莉', '莓雅', '桃蘿', '梨安', '檸安', '蘋安', '果薇', '果蘿', '柚薇', '果蘿', '柚薇', '葡蘿', '莓芙', '橙琳', '果安', '果婕', '果艾', '梨雅', '橙薇', '檸雅', '桃安', '果安', '柚芙', '荔蘿', '梨薇', '檸雅', '莓詩', '莓詩', '莓安', '橙艾', '蘋安', '果莉', '蘋蘿', '檸安', '梨莉', '果蘿', '果雅', '橙婕', '柚詩', '果薇', '檸琳', '蘋蘿', '檸安', '柚莉', '檸芙', '葡琳', '莓莉', '檸詩', '蘋蘿', '蘋琳', '葡芙', '桃莉', '檸詩', '梨莉', '葡蘿', '果雅', '莓琳', '柚薇', '檸艾', '莓婕', '荔琳', '葡雅', '檸詩', '檸婕', '柚艾', '葡芙', '桃薇', '蘋薇', '果蘿', '梨蘿', '莓芙', '柚莉', '荔婕', '柚琳', '莓雅', '果婕', '橙蘿', '桃蘿', '梨雅', '荔雅', '柚琳', '橙雅', '梨艾', '梨莉', '葡安', '柚琳', '桃詩', '荔蘿', '荔蘿', '葡莉', '荔安', '梨琳', '柚芙', '莓莉', '橙安', '梨安', '檸雅', '荔詩', '荔琳', '蘋薇', '蘋琳', '蘋琳', '葡芙', '蘋雅', '橙婕', '梨莉', '桃詩', '檸艾', '桃芙', '葡蘿', '荔芙', '檸琳', '桃詩', '荔芙', '梨琳', '梨艾', '橙婕', '梨琳', '蘋薇', '葡芙', '葡安', '葡安', '荔雅', '莓薇', '桃莉', '葡安', '荔婕', '柚蘿', '荔琳', '蘋安', '葡蘿', '葡莉', '莓莉', '莓安', '柚艾', '果琳', '莓詩', '葡琳', '果芙', '蘋安', '莓蘿', '橙詩', '柚安', '柚琳', '蘋安', '荔雅', '荔安', '檸安', '蘋蘿', '莓艾', '檸安', '梨艾', '柚薇', '荔婕', '柚芙', '柚琳', '蘋芙', '梨蘿', '桃莉', '橙安', '莓莉', '荔安', '柚艾', '桃詩', '果婕', '葡雅', '柚艾', '果雅', '桃安', '桃琳', '果詩', '葡芙', '果詩', '檸詩', '果莉', '荔琳', '橙芙', '橙莉', '荔芙', '柚婕', '柚婕', '檸琳', '梨詩', '桃莉', '果薇', '柚芙', '橙蘿', '梨蘿', '梨雅', '蘋琳', '葡蘿', '莓莉', '果詩', '荔莉', '果琳', '荔艾', '柚安', '橙雅', '果蘿', '橙艾', '橙莉', '檸莉', '梨詩', '果薇', '荔婕', '莓芙', '梨薇', '梨莉', '橙詩', '莓安', '檸安', '莓琳', '荔詩', '莓薇', '荔艾', '荔薇', '莓蘿', '果艾', '蘋莉', '橙芙', '桃蘿', '柚薇', '荔蘿', '荔芙', '莓艾', '果芙', '桃芙', '莓琳', '柚安', '梨雅', '葡莉', '荔雅', '蘋琳', '莓莉', '梨莉', '蘋芙', '橙芙', '橙蘿', '梨蘿', '蘋薇', '檸詩', '葡蘿', '果婕', '荔蘿', '桃蘿', '桃詩', '檸艾', '檸莉', '柚婕', '柚詩', '果芙', '檸琳', '荔芙', '莓薇', '荔莉', '荔詩', '梨琳', '荔蘿', '荔琳', '桃薇', '柚琳', '柚安', '蘋婕', '橙婕', '果莉', '桃薇', '荔詩', '荔雅', '檸蘿', '桃艾', '蘋詩', '檸雅', '果薇', '桃莉', '荔薇', '果芙', '莓安', '蘋琳', '橙艾', '蘋詩', '梨詩', '柚蘿', '葡艾', '蘋琳', '梨詩', '果莉', '橙芙', '柚安', '葡婕', '檸婕', '檸詩', '果婕', '莓安', '荔安', '莓薇', '荔芙', '桃艾', '梨詩', '柚琳', '梨詩', '梨薇', '莓安', '梨艾', '梨莉', '橙蘿', '蘋琳', '梨琳', '葡芙', '莓艾', '桃琳', '蘋安', '蘋芙', '蘋莉', '蘋芙', '葡婕', '桃艾', '梨安', '莓詩', '果詩', '果艾', '莓安', '果蘿', '莓薇', '橙雅', '檸蘿', '蘋芙', '橙詩', '荔蘿', '梨莉', '荔雅', '橙琳', '柚莉', '梨琳', '柚薇', '葡芙', '桃艾', '桃莉', '果安', '荔婕', '葡薇', '莓詩', '葡莉', '葡莉', '葡琳', '蘋詩', '莓蘿', '桃安', '果安', '橙蘿', '葡雅', '果薇', '桃安', '桃詩', '蘋莉', '葡詩', '橙莉', '蘋蘿', '莓雅', '荔芙', '荔琳', '莓詩', '荔薇', '果詩', '桃婕', '橙詩', '荔婕', '橙芙', '梨莉'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['蘋果', '橘子', '香蕉', '葡萄', '草莓', '櫻桃', '桃子', '梨子', '李子', '梅子', '檸檬', '柳橙', '鳳梨', '西瓜', '哈密瓜', '香瓜', '木瓜', '芒果', '荔枝', '龍眼', '蓮霧', '芭樂', '奇異果', '火龍果', '百香果', '榴槤', '椰子', '石榴', '柿子', '棗子', '蘋果', '橘子', '香蕉', '葡萄', '草莓', '櫻桃', '桃子', '梨子', '李子', '梅子', '檸檬', '柳橙', '鳳梨', '西瓜', '哈密瓜', '香瓜', '木瓜', '芒果', '荔枝', '龍眼', '蓮霧', '芭樂', '奇異果', '火龍果', '百香果', '榴槤', '椰子', '石榴', '柿子', '棗子'],
                    lastNames: ['田中', '佐藤', '鈴木', '高橋', '渡邊', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川', '前田', '岡田', '長谷川', '藤田', '村上', '近藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '藤原', '岡本', '中川', '中野', '原田', '松田', '竹内', '上田', '小野', '田村']
                },
                korea: {
                    firstNames: ['蘋果', '橘子', '香蕉', '葡萄', '草莓', '櫻桃', '桃子', '梨子', '李子', '梅子', '檸檬', '柳橙', '鳳梨', '西瓜', '哈密瓜', '香瓜', '木瓜', '芒果', '荔枝', '龍眼', '蓮霧', '芭樂', '奇異果', '火龍果', '百香果', '榴槤', '椰子', '石榴', '柿子', '棗子', '蘋果', '橘子', '香蕉', '葡萄', '草莓', '櫻桃', '桃子', '梨子', '李子', '梅子', '檸檬', '柳橙', '鳳梨', '西瓜', '哈密瓜', '香瓜', '木瓜', '芒果', '荔枝', '龍眼', '蓮霧', '芭樂', '奇異果', '火龍果', '百香果', '榴槤', '椰子', '石榴', '柿子', '棗子'],
                    lastNames: ['金', '李', '朴', '崔', '鄭', '姜', '趙', '尹', '張', '林', '吳', '韓', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '鍾', '譚', '陸', '汪', '范', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['Apple', 'Orange', 'Banana', 'Grape', 'Strawberry', 'Cherry', 'Peach', 'Pear', 'Plum', 'Lemon', 'Lime', 'Pineapple', 'Watermelon', 'Cantaloupe', 'Honeydew', 'Papaya', 'Mango', 'Lychee', 'Longan', 'Wax Apple', 'Guava', 'Kiwi', 'Dragon Fruit', 'Passion Fruit', 'Durian', 'Coconut', 'Pomegranate', 'Persimmon', 'Date', 'Apple', 'Orange', 'Banana', 'Grape', 'Strawberry', 'Cherry', 'Peach', 'Pear', 'Plum', 'Lemon', 'Lime', 'Pineapple', 'Watermelon', 'Cantaloupe', 'Honeydew', 'Papaya', 'Mango', 'Lychee', 'Longan', 'Wax Apple', 'Guava', 'Kiwi', 'Dragon Fruit', 'Passion Fruit', 'Durian', 'Coconut', 'Pomegranate', 'Persimmon', 'Date'],
                    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']
                }
            },
            tall: {
                taiwan: {
                    firstNames: ['雅涵', '婉婷', '靜雯', '婉蓉', '雅涵', '語彤', '靜雯', '思婕', '語彤', '語彤', '思婕', '雅真', '彤妍', '婉婷', '婉婷', '姿妍', '思婕', '雅涵', '思婕', '雅真', '姿妍', '婉蓉', '彤妍', '思婕', '雅涵', '雅真', '雅涵', '婉婷', '語彤', '婉蓉', '婉蓉', '思婕', '思婕', '思婕', '彤妍', '彤妍', '婉婷', '雅真', '涵予', '婉蓉', '雅真', '靜雯', '語彤', '婉婷', '婉蓉', '靜雯', '思婕', '姿妍', '婉蓉', '婉婷', '婉蓉', '姿妍', '靜雯', '彤妍', '姿妍', '靜雯', '姿妍', '思婕', '語彤', '思婕', '雅涵', '涵予', '涵予', '語彤', '彤妍', '婉蓉', '姿妍', '涵予', '雅涵', '思婕', '思婕', '雅真', '婉蓉', '姿妍', '涵予', '思婕', '彤妍', '婉婷', '思婕', '姿妍', '姿妍', '語彤', '語彤', '思婕', '語彤', '思婕', '雅真', '語彤', '姿妍', '婉蓉', '婉蓉', '彤妍', '姿妍', '涵予', '姿妍', '姿妍', '姿妍', '語彤', '彤妍', '彤妍', '雅真', '婉婷', '語彤', '姿妍', '婉婷', '靜雯', '雅涵', '思婕', '婉婷', '婉蓉', '雅真', '思婕', '雅真', '婉蓉', '婉蓉', '婉婷', '雅涵', '姿妍', '涵予', '語彤', '彤妍', '婉蓉', '思婕', '思婕', '語彤', '婉婷', '婉婷', '彤妍', '靜雯', '靜雯', '姿妍', '靜雯', '雅涵', '涵予', '靜雯', '雅涵', '語彤', '姿妍', '婉婷', '雅涵', '雅真', '雅涵', '靜雯', '姿妍', '雅涵', '靜雯', '語彤', '婉蓉', '婉蓉', '姿妍', '思婕', '雅真', '彤妍', '婉蓉', '語彤', '涵予', '雅真', '婉蓉', '靜雯', '婉蓉', '雅真', '婉婷', '雅涵', '婉婷', '雅真', '婉婷', '雅真', '語彤', '婉婷', '姿妍', '靜雯', '彤妍', '思婕', '語彤', '雅涵', '姿妍', '婉蓉', '彤妍', '婉婷', '涵予', '涵予', '雅真', '彤妍', '靜雯', '姿妍', '彤妍', '姿妍', '靜雯', '彤妍', '思婕', '婉蓉', '語彤', '雅真', '彤妍', '婉蓉', '彤妍', '靜雯', '彤妍', '婉蓉', '姿妍', '婉蓉', '雅真', '涵予', '語彤', '雅真', '彤妍', '語彤', '雅真', '語彤', '語彤', '雅真', '語彤', '婉婷', '雅真', '雅涵', '婉婷', '雅涵', '婉蓉', '姿妍', '雅真', '雅涵', '思婕', '婉婷', '雅涵', '彤妍', '姿妍', '婉婷', '思婕', '思婕', '靜雯', '彤妍', '思婕', '姿妍', '思婕', '雅涵', '靜雯', '婉蓉', '語彤', '靜雯', '雅涵', '彤妍', '婉婷', '雅涵', '彤妍', '雅真', '涵予', '思婕', '靜雯', '雅真', '靜雯', '婉婷', '雅真', '婉婷', '語彤', '思婕', '語彤', '姿妍', '婉婷', '雅涵', '靜雯', '思婕', '雅真', '彤妍', '姿妍', '姿妍', '婉婷', '靜雯', '思婕', '思婕', '婉婷', '涵予', '語彤', '姿妍', '婉蓉', '婉蓉', '雅真', '雅涵', '姿妍', '雅涵', '姿妍', '語彤', '姿妍', '姿妍', '靜雯', '姿妍', '靜雯', '雅真', '雅真', '姿妍', '雅涵', '婉蓉', '婉蓉', '彤妍', '靜雯', '語彤', '思婕', '涵予', '雅真', '語彤', '姿妍', '思婕', '雅真', '靜雯', '語彤', '雅涵', '婉婷', '婉蓉', '雅涵', '婉婷', '雅涵', '涵予', '涵予', '涵予', '彤妍', '語彤', '雅真', '彤妍', '彤妍', '雅真', '彤妍', '姿妍', '語彤', '姿妍', '涵予', '雅真', '涵予', '語彤', '婉婷', '雅涵', '涵予', '姿妍', '婉婷', '彤妍', '彤妍', '靜雯', '語彤', '思婕', '雅真', '靜雯', '彤妍', '靜雯', '涵予', '姿妍', '婉婷', '雅真', '姿妍', '婉婷', '靜雯', '雅真', '思婕', '雅真', '思婕', '婉蓉', '雅真', '思婕', '語彤', '雅涵', '婉蓉', '雅真', '語彤', '雅涵', '婉婷', '雅涵', '思婕', '語彤', '雅真', '彤妍', '雅真', '靜雯', '思婕', '涵予', '雅真', '涵予', '語彤', '彤妍', '靜雯', '雅涵', '雅真', '雅真', '靜雯', '思婕', '姿妍', '雅真', '語彤', '婉蓉', '姿妍', '婉蓉', '雅真', '雅真', '思婕', '婉蓉', '思婕', '靜雯', '姿妍', '雅真', '靜雯', '彤妍', '婉蓉', '雅真', '婉婷', '涵予', '婉蓉', '姿妍', '靜雯', '雅涵', '雅真', '靜雯', '婉婷', '靜雯', '涵予', '靜雯', '思婕', '雅真', '姿妍', '語彤', '靜雯', '思婕', '婉蓉', '婉婷', '涵予', '彤妍', '涵予', '雅涵', '婉婷', '婉婷', '涵予', '思婕', '彤妍', '思婕', '語彤', '雅涵', '雅涵', '婉蓉', '雅涵', '思婕', '雅涵', '雅涵', '雅涵', '彤妍', '姿妍', '思婕', '姿妍', '靜雯', '雅真', '思婕', '婉蓉', '語彤', '涵予', '涵予', '語彤', '雅涵', '雅涵', '姿妍', '涵予', '靜雯', '靜雯', '語彤', '雅涵', '雅真', '涵予', '婉蓉', '姿妍', '涵予', '婉婷', '靜雯', '思婕', '涵予', '姿妍', '雅涵', '婉蓉', '雅真', '靜雯', '姿妍', '語彤', '雅涵', '思婕', '涵予', '雅涵', '涵予', '涵予', '靜雯', '婉婷', '雅真', '婉蓉', '姿妍', '婉蓉', '雅真', '語彤', '靜雯', '姿妍', '靜雯', '靜雯', '婉蓉', '雅涵', '思婕', '靜雯', '婉婷', '婉婷', '彤妍', '婉蓉'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗'],
                    lastNames: ['田中', '佐藤', '鈴木', '高橋', '渡邊', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川', '前田', '岡田', '長谷川', '藤田', '村上', '近藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '藤原', '岡本', '中川', '中野', '原田', '松田', '竹内', '上田', '小野', '田村']
                },
                korea: {
                    firstNames: ['高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗', '高挑', '修長', '挺拔', '優雅', '端莊', '氣質', '高貴', '典雅', '清秀', '秀麗'],
                    lastNames: ['金', '李', '朴', '崔', '鄭', '姜', '趙', '尹', '張', '林', '吳', '韓', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '鍾', '譚', '陸', '汪', '范', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['Tall', 'Elegant', 'Graceful', 'Sophisticated', 'Refined', 'Classy', 'Stunning', 'Gorgeous', 'Beautiful', 'Radiant', 'Tall', 'Elegant', 'Graceful', 'Sophisticated', 'Refined', 'Classy', 'Stunning', 'Gorgeous', 'Beautiful', 'Radiant', 'Tall', 'Elegant', 'Graceful', 'Sophisticated', 'Refined', 'Classy', 'Stunning', 'Gorgeous', 'Beautiful', 'Radiant', 'Tall', 'Elegant', 'Graceful', 'Sophisticated', 'Refined', 'Classy', 'Stunning', 'Gorgeous', 'Beautiful', 'Radiant', 'Tall', 'Elegant', 'Graceful', 'Sophisticated', 'Refined', 'Classy', 'Stunning', 'Gorgeous', 'Beautiful', 'Radiant', 'Tall', 'Elegant', 'Graceful', 'Sophisticated', 'Refined', 'Classy', 'Stunning', 'Gorgeous', 'Beautiful', 'Radiant'],
                    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']
                }
            },
            petite: {
                taiwan: {
                    firstNames: ['嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動'],
                    lastNames: ['林', '陳', '李', '王', '張', '劉', '黃', '吳', '周', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '鄭', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '韓', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '姜', '崔', '鍾', '譚', '陸', '汪', '范', '金', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '尹', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                japan: {
                    firstNames: ['嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動'],
                    lastNames: ['田中', '佐藤', '鈴木', '高橋', '渡邊', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川', '前田', '岡田', '長谷川', '藤田', '村上', '近藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '藤原', '岡本', '中川', '中野', '原田', '松田', '竹内', '上田', '小野', '田村']
                },
                korea: {
                    firstNames: ['嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動', '嬌小', '可愛', '甜美', '溫柔', '小巧', '精緻', '迷人', '俏皮', '活潑', '靈動'],
                    lastNames: ['金', '李', '朴', '崔', '鄭', '姜', '趙', '尹', '張', '林', '吳', '韓', '徐', '孫', '馬', '朱', '胡', '郭', '何', '高', '羅', '梁', '謝', '宋', '唐', '許', '鄧', '馮', '曹', '曾', '彭', '蕭', '蔡', '潘', '田', '董', '袁', '於', '余', '葉', '蔣', '杜', '蘇', '魏', '程', '呂', '丁', '任', '沈', '姚', '盧', '鍾', '譚', '陸', '汪', '范', '石', '廖', '賈', '夏', '韋', '付', '方', '白', '鄒', '孟', '熊', '秦', '邱', '江', '薛', '閻', '段', '雷', '侯', '龍', '史', '陶', '黎', '賀', '顧', '毛', '郝', '龔', '邵']
                },
                western: {
                    firstNames: ['Petite', 'Cute', 'Sweet', 'Gentle', 'Tiny', 'Delicate', 'Charming', 'Playful', 'Lively', 'Energetic', 'Petite', 'Cute', 'Sweet', 'Gentle', 'Tiny', 'Delicate', 'Charming', 'Playful', 'Lively', 'Energetic', 'Petite', 'Cute', 'Sweet', 'Gentle', 'Tiny', 'Delicate', 'Charming', 'Playful', 'Lively', 'Energetic', 'Petite', 'Cute', 'Sweet', 'Gentle', 'Tiny', 'Delicate', 'Charming', 'Playful', 'Lively', 'Energetic', 'Petite', 'Cute', 'Sweet', 'Gentle', 'Tiny', 'Delicate', 'Charming', 'Playful', 'Lively', 'Energetic', 'Petite', 'Cute', 'Sweet', 'Gentle', 'Tiny', 'Delicate', 'Charming', 'Playful', 'Lively', 'Energetic'],
                    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']
                }
            }
        };
        
        return data[this.currentStyle][this.currentType];
    }
    
    displayNames(names) {
        this.namesDisplay.innerHTML = '';
        names.forEach(name => {
            const nameItem = document.createElement('div');
            nameItem.className = 'name-item';
            nameItem.textContent = name;
            this.namesDisplay.appendChild(nameItem);
        });
    }
    
    copyAllNames() {
        const nameItems = this.namesDisplay.querySelectorAll('.name-item');
        if (nameItems.length === 0) {
            showToast('沒有可複製的名字');
            return;
        }
        
        const names = Array.from(nameItems).map(item => item.textContent.trim());
        const text = names.join('\n');
        copyToClipboard(text);
    }
}

// 初始化翻譯機、姓名生產器和文字複製工具
let translator;
let nameGenerator;
let textCopyTool;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    initializeEventListeners();
    
    // 初始化翻譯機
    translator = new Translator();
    
    // 初始化姓名生產器
    nameGenerator = new NameGenerator();
    
    // 初始化文字複製工具
    textCopyTool = new TextCopyTool();
});

// 初始化完成提示
setTimeout(() => {
    showToast('歡迎使用潘朵拉工作清單！');
}, 1000);
