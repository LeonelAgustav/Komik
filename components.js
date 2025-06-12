// UI Components
export class UIComponents {
    // Loading Spinner
    static createSpinner(size = 'md') {
        const sizes = {
            sm: 'h-4 w-4',
            md: 'h-8 w-8',
            lg: 'h-12 w-12'
        };
        
        return `
            <div class="flex justify-center items-center">
                <div class="animate-spin rounded-full border-t-2 border-b-2 border-primary-500 ${sizes[size]}"></div>
            </div>
        `;
    }

    // Error Message
    static createErrorMessage(message) {
        return `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline"> ${message}</span>
            </div>
        `;
    }

    // Manga Card
    static createMangaCard(manga) {
        return `
            <div class="manga-card group">
                <a href="#" class="block relative rounded-xl overflow-hidden shadow-lg bg-white dark:bg-dark-700" data-manga-id="${manga.id}">
                    <div class="relative pt-[140%]">
                        <img src="${manga.coverUrl}" alt="${manga.title}" class="absolute inset-0 w-full h-full object-cover">
                        <div class="absolute top-2 left-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            <i class="fas fa-star mr-1"></i> ${manga.rating || 'N/A'}
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <h3 class="text-white font-bold text-sm line-clamp-1">${manga.title}</h3>
                            <p class="text-gray-300 text-xs">Chapter ${manga.chapters || 'N/A'}</p>
                        </div>
                    </div>
                </a>
                <div class="mt-2 px-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <a href="#" class="font-medium text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">${manga.title}</a>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${manga.tags.slice(0, 2).join(', ')}</p>
                        </div>
                        <button class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bookmark-btn" data-manga-id="${manga.id}">
                            <i class="far fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Chapter List Item
    static createChapterListItem(chapter) {
        return `
            <div class="chapter-list-item p-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg cursor-pointer" data-chapter-id="${chapter.id}">
                <div class="flex justify-between items-center">
                    <div>
                        <h4 class="font-medium">Chapter ${chapter.chapter}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${new Date(chapter.publishAt).toLocaleDateString()}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">${chapter.pages} pages</span>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            </div>
        `;
    }

    // Pagination
    static createPagination(currentPage, totalPages) {
        let pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages];
            } else if (currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }

        return `
            <div class="flex justify-center space-x-2 mt-4">
                <button class="px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}" 
                        ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${pages.map(page => `
                    <button class="px-3 py-1 rounded ${page === currentPage ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                            ${page === '...' ? 'disabled' : ''} data-page="${page}">
                        ${page}
                    </button>
                `).join('')}
                
                <button class="px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}"
                        ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    // Toast Notification
    static createToast(message, type = 'success') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-full opacity-0`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-y-full', 'opacity-0');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
} 