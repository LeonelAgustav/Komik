// State Management
class MangaState {
    constructor() {
        this.cache = new Map();
        this.currentManga = null;
        this.currentChapter = null;
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        this.readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
        this.settings = JSON.parse(localStorage.getItem('mangaSettings') || JSON.stringify({
            theme: 'light',
            readerMode: 'vertical',
            imageQuality: 'high',
            autoPlay: false,
            showPageNumbers: true
        }));
    }

    // Cache Management
    setCache(key, data, expiry = 3600000) { // 1 hour default expiry
        this.cache.set(key, {
            data,
            expiry: Date.now() + expiry
        });
    }

    getCache(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }

    // Bookmark Management
    toggleBookmark(mangaId) {
        const index = this.bookmarks.indexOf(mangaId);
        if (index === -1) {
            this.bookmarks.push(mangaId);
        } else {
            this.bookmarks.splice(index, 1);
        }
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
        return index === -1;
    }

    isBookmarked(mangaId) {
        return this.bookmarks.includes(mangaId);
    }

    // Reading History
    addToHistory(mangaId, chapterId) {
        const historyItem = {
            mangaId,
            chapterId,
            timestamp: Date.now()
        };
        
        const index = this.readingHistory.findIndex(item => 
            item.mangaId === mangaId && item.chapterId === chapterId
        );
        
        if (index !== -1) {
            this.readingHistory.splice(index, 1);
        }
        
        this.readingHistory.unshift(historyItem);
        this.readingHistory = this.readingHistory.slice(0, 50); // Keep last 50 entries
        localStorage.setItem('readingHistory', JSON.stringify(this.readingHistory));
    }

    getHistory() {
        return this.readingHistory;
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('mangaSettings', JSON.stringify(this.settings));
    }

    getSettings() {
        return this.settings;
    }

    // Current Manga/Chapter Management
    setCurrentManga(manga) {
        this.currentManga = manga;
    }

    getCurrentManga() {
        return this.currentManga;
    }

    setCurrentChapter(chapter) {
        this.currentChapter = chapter;
    }

    getCurrentChapter() {
        return this.currentChapter;
    }
}

// Create and export a singleton instance
const mangaState = new MangaState();
export default mangaState; 