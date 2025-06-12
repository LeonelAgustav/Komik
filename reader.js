// Manga Reader
import mangaState from './state.js';
import { UIComponents } from './components.js';

export class MangaReader {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 0;
        this.pages = [];
        this.isLoading = false;
        this.readerMode = mangaState.getSettings().readerMode;
        this.autoPlay = mangaState.getSettings().autoPlay;
        this.autoPlayInterval = null;
    }

    async init(mangaId, chapterId) {
        this.mangaId = mangaId;
        this.chapterId = chapterId;
        
        try {
            // Show loading state
            this.showLoading();
            
            // Fetch chapter data
            const chapterData = await this.fetchChapterData(chapterId);
            if (!chapterData) throw new Error('Failed to load chapter');
            
            this.pages = chapterData.pages;
            this.totalPages = this.pages.length;
            
            // Update UI
            this.updateReaderUI();
            this.loadCurrentPage();
            
            // Add to reading history
            mangaState.addToHistory(mangaId, chapterId);
            
            // Start auto-play if enabled
            if (this.autoPlay) {
                this.startAutoPlay();
            }
            
        } catch (error) {
            console.error('Error initializing reader:', error);
            this.showError('Failed to load chapter. Please try again.');
        }
    }

    async fetchChapterData(chapterId) {
        try {
            const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
            if (!response.ok) throw new Error('Failed to fetch chapter data');
            
            const data = await response.json();
            return {
                baseUrl: data.baseUrl,
                pages: data.chapter.data
            };
        } catch (error) {
            console.error('Error fetching chapter data:', error);
            return null;
        }
    }

    showLoading() {
        const readerContent = document.getElementById('readerContent');
        readerContent.innerHTML = UIComponents.createSpinner('lg');
    }

    showError(message) {
        const readerContent = document.getElementById('readerContent');
        readerContent.innerHTML = UIComponents.createErrorMessage(message);
    }

    updateReaderUI() {
        // Update page counter
        const pageCounter = document.querySelector('#readerFooter span');
        if (pageCounter) {
            pageCounter.textContent = `${this.currentPage}/${this.totalPages}`;
        }

        // Update page select
        const pageSelect = document.querySelector('#readerFooter select');
        if (pageSelect) {
            pageSelect.innerHTML = this.pages.map((_, index) => `
                <option value="${index + 1}" ${index + 1 === this.currentPage ? 'selected' : ''}>
                    Page ${index + 1}
                </option>
            `).join('');
        }

        // Update navigation buttons
        const prevButton = document.querySelector('#readerFooter button:first-child');
        const nextButton = document.querySelector('#readerFooter button:last-child');
        
        if (prevButton) {
            prevButton.disabled = this.currentPage === 1;
            prevButton.classList.toggle('opacity-50', this.currentPage === 1);
        }
        
        if (nextButton) {
            nextButton.disabled = this.currentPage === this.totalPages;
            nextButton.classList.toggle('opacity-50', this.currentPage === this.totalPages);
        }
    }

    async loadCurrentPage() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const readerContent = document.getElementById('readerContent');
            const page = this.pages[this.currentPage - 1];
            
            if (!page) throw new Error('Page not found');

            // Show loading state
            readerContent.innerHTML = UIComponents.createSpinner();

            // Load image
            const img = new Image();
            img.src = `${this.baseUrl}/data/${page}`;
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // Update reader content
            readerContent.innerHTML = `
                <div class="max-w-screen-lg mx-auto">
                    <img src="${img.src}" alt="Page ${this.currentPage}" class="w-full h-auto">
                </div>
            `;

            // Update UI
            this.updateReaderUI();

        } catch (error) {
            console.error('Error loading page:', error);
            this.showError('Failed to load page. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadCurrentPage();
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadCurrentPage();
        }
    }

    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            this.loadCurrentPage();
        }
    }

    toggleReaderMode() {
        this.readerMode = this.readerMode === 'vertical' ? 'horizontal' : 'vertical';
        mangaState.updateSettings({ readerMode: this.readerMode });
        this.loadCurrentPage();
    }

    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        mangaState.updateSettings({ autoPlay: this.autoPlay });
        
        if (this.autoPlay) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }

    startAutoPlay() {
        this.stopAutoPlay(); // Clear any existing interval
        this.autoPlayInterval = setInterval(() => {
            if (this.currentPage < this.totalPages) {
                this.nextPage();
            } else {
                this.stopAutoPlay();
            }
        }, 3000); // 3 seconds per page
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    // Event Handlers
    handleKeyPress(event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.previousPage();
                break;
            case 'ArrowRight':
                this.nextPage();
                break;
            case 'Escape':
                this.closeReader();
                break;
        }
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }

    handleTouchEnd(event) {
        const touchEndX = event.changedTouches[0].clientX;
        const diff = this.touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                this.nextPage();
            } else {
                this.previousPage();
            }
        }
    }

    closeReader() {
        this.stopAutoPlay();
        const readerModal = document.getElementById('readerModal');
        readerModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Create and export a singleton instance
const mangaReader = new MangaReader();
export default mangaReader; 