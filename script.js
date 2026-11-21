document.addEventListener('DOMContentLoaded', () => {
    // --- 랜딩 페이지 슬라이드쇼 기능 ---
    const slideshowPage = document.querySelector('#page-index');
    if (slideshowPage) {
        const slides = slideshowPage.querySelectorAll('.slide-image');
        const slideshowCounter = slideshowPage.querySelector('.slideshow-counter');
        const holdZone = slideshowPage.querySelector('.hold-zone');
        const leftNav = slideshowPage.querySelector('.nav-overlay.left');
        const rightNav = slideshowPage.querySelector('.nav-overlay.right');
        const mainContainer = slideshowPage.querySelector('.main-container');
        let currentIndex = 0;
        let slideInterval = null;

        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        const updateCounter = function() {
            if(slides.length > 0) {
                slideshowCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
            }
        };
        const showSlide = function(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) {
                    slide.classList.add('active');
                }
            });
            updateCounter();
        };
        const nextSlide = function() {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        };
        const prevSlide = function() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
        };
        const stopSlideshow = function() {
            clearInterval(slideInterval);
            slideInterval = null;
        };

        const cursorLoader = document.getElementById('cursor-loader');
        
        if (!isMobile && cursorLoader) {
            let currentDirection = null;
            
            const moveCursor = (e) => {
                cursorLoader.style.left = e.clientX + 'px';
                cursorLoader.style.top = e.clientY + 'px';
            };

            const startSlideshowAndCursor = (direction) => {
                if (currentDirection === direction) return;
                
                cursorLoader.style.display = 'block';
                document.body.classList.add('cursor-hidden');
                
                if (direction === 'left') {
                    cursorLoader.classList.remove('animate-forward');
                    cursorLoader.classList.add('animate-reverse');
                } else {
                    cursorLoader.classList.remove('animate-reverse');
                    cursorLoader.classList.add('animate-forward');
                }
                
                window.addEventListener('mousemove', moveCursor);
                
                stopSlideshow();
                const slideFunction = direction === 'left' ? prevSlide : nextSlide;
                slideInterval = setInterval(slideFunction, 1000);
                currentDirection = direction;
            };

            const stopSlideshowAndCursor = () => {
                cursorLoader.style.display = 'none';
                document.body.classList.remove('cursor-hidden');
                cursorLoader.classList.remove('animate-forward', 'animate-reverse');
                window.removeEventListener('mousemove', moveCursor);
                stopSlideshow();
                currentDirection = null;
            };
            
            leftNav.addEventListener('mouseenter', () => startSlideshowAndCursor('left'));
            rightNav.addEventListener('mouseenter', () => startSlideshowAndCursor('right'));
            leftNav.addEventListener('mouseleave', stopSlideshowAndCursor);
            rightNav.addEventListener('mouseleave', stopSlideshowAndCursor);
            holdZone.addEventListener('mouseenter', stopSlideshowAndCursor);

        } else if (isMobile) {
            const lastTouchTime = { time: 0 };
            const doubleTapThreshold = 300;
            document.body.addEventListener('touchstart', (e) => {
                const currentTime = new Date().getTime();
                const timeDifference = currentTime - lastTouchTime.time;

                if (timeDifference < doubleTapThreshold && timeDifference > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                lastTouchTime.time = currentTime;
            }, { passive: false });
            
            const startAutoSlideshow = function() {
                stopSlideshow();
                slideInterval = setInterval(nextSlide, 1000);
            };
            mainContainer.addEventListener('touchstart', (e) => {
                if (slideInterval) stopSlideshow();
                const touchX = e.touches[0].clientX;
                const screenHalf = window.innerWidth / 2;
                if (touchX < screenHalf) prevSlide();
                else nextSlide();
            });
            startAutoSlideshow();
        }
        
        showSlide(currentIndex);
    }


    // --- 프로젝트 페이지 모달 기능 ---
    const projectPage = document.querySelector('#page-projects');
    if (projectPage) {
        const projectGrid = projectPage.querySelector('.project-grid');
        const imageViewer = document.getElementById('image-viewer');
        const modalContent = imageViewer ? imageViewer.querySelector('.modal-content') : null;
        const modalImage = document.getElementById('modal-image');
        const modalClose = imageViewer ? imageViewer.querySelector('.modal-close') : null;
        const modalNavs = imageViewer ? imageViewer.querySelectorAll('.modal-nav') : [];
        const modalCounter = imageViewer ? imageViewer.querySelector('.modal-counter') : null;
        const siteHeader = document.querySelector('.site-header');
        
        const modalGridToggle = imageViewer ? imageViewer.querySelector('.modal-grid-toggle') : null;
        const modalGridView = imageViewer ? imageViewer.querySelector('.modal-grid-view') : null;

        let currentGallery = [];
        let currentIndex = 0;
        let currentLayoutClass = '';
        let isVimeoMode = false;
        let vimeoWrapper = null;

        const clearVimeo = function() {
            if (vimeoWrapper) {
                vimeoWrapper.remove();
                vimeoWrapper = null;
            }
            if (modalContent) modalContent.style.display = '';
            if (modalGridView) modalGridView.style.display = '';
            if (modalImage) modalImage.style.display = '';
            modalNavs.forEach(nav => { nav.style.display = ''; });
            if (modalCounter) modalCounter.style.display = '';
            if (modalGridToggle) modalGridToggle.style.display = '';
        };

        const openVimeoModal = function(vimeoId) {
            if (!imageViewer || !modalContent) return;
            clearVimeo();
            isVimeoMode = true;

            imageViewer.classList.remove('grid-view-active');
            if (modalGridView) modalGridView.style.display = 'none';
            modalContent.style.display = 'flex';
            if (modalImage) modalImage.style.display = 'none';
            modalNavs.forEach(nav => { nav.style.display = 'none'; });
            if (modalCounter) modalCounter.style.display = 'none';
            if (modalGridToggle) modalGridToggle.style.display = 'none';

            vimeoWrapper = document.createElement('div');
            vimeoWrapper.className = 'modal-vimeo-frame';
            vimeoWrapper.style.cssText = 'position: relative; width: 80vw; max-width: 1120px; height: 45vw; max-height: 630px; z-index: 1020; background: #000;';

            const iframe = document.createElement('iframe');
            iframe.src = `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`;
            iframe.style.cssText = 'width: 100%; height: 100%; border: 0; display: block;';
            iframe.allow = 'autoplay; fullscreen; picture-in-picture';
            iframe.allowFullscreen = true;

            vimeoWrapper.appendChild(iframe);
            modalContent.appendChild(vimeoWrapper);

            imageViewer.classList.add('visible');
            if (projectGrid) projectGrid.classList.add('blurred');
            if (siteHeader) siteHeader.classList.add('blurred');
            document.body.classList.add('modal-open');
        };

        const updateModal = function() {
            if (currentGallery.length > 0 && modalImage && modalCounter) {
                modalImage.src = currentGallery[currentIndex];
                modalCounter.textContent = `${currentIndex + 1} of ${currentGallery.length}`;
            }
        };

        const toggleGridView = (switchToGrid) => {
            if (!imageViewer || !modalGridView || !modalGridToggle) return;
            if (switchToGrid) {
                imageViewer.classList.add('grid-view-active');
                modalGridView.innerHTML = '';
                
                if (currentLayoutClass) {
                    modalGridView.classList.remove(currentLayoutClass);
                    modalGridView.classList.add(currentLayoutClass);
                }
                
                currentGallery.forEach((imgSrc, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = imgSrc;
                    thumb.addEventListener('click', () => {
                        currentIndex = index;
                        toggleGridView(false);
                    });
                    modalGridView.appendChild(thumb);
                });
                modalGridToggle.textContent = 'BACK';
            } else {
                imageViewer.classList.remove('grid-view-active');
                updateModal();
                modalGridToggle.textContent = 'VIEW ALL';
            }
        };

        if (modalGridToggle) {
            modalGridToggle.addEventListener('click', () => {
                const isGridView = imageViewer.classList.contains('grid-view-active');
                toggleGridView(!isGridView);
            });
        }

        const openModal = function(galleryData, layoutClass = '') {
            if (!galleryData || galleryData.length === 0 || !imageViewer) return;
            clearVimeo();
            isVimeoMode = false;

            currentGallery = galleryData;
            currentIndex = 0;
            currentLayoutClass = layoutClass; 
            
            if (modalGridView && currentLayoutClass) {
                if (modalGridView.classList.contains(currentLayoutClass)) {
                    modalGridView.classList.remove(currentLayoutClass);
                }
                modalGridView.classList.add(currentLayoutClass);
            }

            imageViewer.classList.add('visible');
            if(projectGrid) projectGrid.classList.add('blurred');
            if(siteHeader) siteHeader.classList.add('blurred');
            document.body.classList.add('modal-open');
            toggleGridView(false);
        };

        const closeModal = function() {
            if (!imageViewer) return;
            imageViewer.classList.remove('visible');
            if(projectGrid) projectGrid.classList.remove('blurred');
            if(siteHeader) siteHeader.classList.remove('blurred');
            document.body.classList.remove('modal-open');
            clearVimeo();
            isVimeoMode = false;

            if (imageViewer.classList.contains('grid-view-active')) {
                toggleGridView(false);
            }
            if (currentLayoutClass && modalGridView) {
                modalGridView.classList.remove(currentLayoutClass);
                currentLayoutClass = '';
            }
        };
        
        const showNextImage = function() {
            if (isVimeoMode || currentGallery.length === 0) return;
            currentIndex = (currentIndex + 1) % currentGallery.length;
            updateModal();
        };
        const showPrevImage = function() {
            if (isVimeoMode || currentGallery.length === 0) return;
            currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
            updateModal();
        };

        if (projectGrid) {
            projectGrid.addEventListener('click', (e) => {
                const item = e.target.closest('.project-item');
                if (!item || !projectGrid.contains(item)) return;

                const vimeoId = item.dataset.vimeo;
                if (vimeoId) {
                    openVimeoModal(vimeoId);
                    return;
                }

                const galleryArray = JSON.parse(item.dataset.gallery || '[]');
                let layoutClass = '';
                for (const cls of item.classList) {
                    if (cls.endsWith('-project')) {
                        layoutClass = cls.replace('-project', '-layout');
                        break;
                    }
                }
                openModal(galleryArray, layoutClass);
            });
        }

        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalNavs[0]) modalNavs[0].addEventListener('click', showPrevImage);
        if (modalNavs[1]) modalNavs[1].addEventListener('click', showNextImage);

        if (imageViewer) {
            imageViewer.addEventListener('click', (e) => {
                if (e.target === imageViewer || e.target === modalContent) closeModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (!imageViewer || !imageViewer.classList.contains('visible')) return;
            
            if (!isVimeoMode && !imageViewer.classList.contains('grid-view-active')) {
                if (e.key === 'ArrowRight') showNextImage();
                if (e.key === 'ArrowLeft') showPrevImage();
            }
            if (e.key === 'Escape') closeModal();
        });
    }

    const setupLinkViewTransitions = () => {
        if (!document.startViewTransition) return;

        const isModifiedClick = (event) =>
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey;

        document.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const anchor = target.closest('a[href]');
            if (!anchor) return;
            if (anchor.target && anchor.target !== '_self') return;
            if (anchor.hasAttribute('download')) return;
            if (isModifiedClick(event)) return;

            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin) return;
            if (!['http:', 'https:'].includes(url.protocol)) return;

            event.preventDefault();
            document.startViewTransition(() => {
                window.location.href = url.href;
                return new Promise(() => {});
            });
        });
    };

    setupLinkViewTransitions();
});
