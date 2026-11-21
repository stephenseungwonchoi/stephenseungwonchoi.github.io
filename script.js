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
        
        // --- 슬라이드쇼 함수 정의 ---
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
        // --- ---

        const cursorLoader = document.getElementById('cursor-loader');
        
        if (!isMobile && cursorLoader) {
            
            // --- 💡 [수정됨] 커서 & 슬라이드쇼 통합 로직 ---
            let currentDirection = null; // 현재 슬라이드 방향 추적
            
            const moveCursor = (e) => {
                cursorLoader.style.left = e.clientX + 'px';
                cursorLoader.style.top = e.clientY + 'px';
            };

            // 커서와 슬라이드쇼를 '시작'하는 함수
            const startSlideshowAndCursor = (direction) => {
                if (currentDirection === direction) return;
                
                // 1. 커서 보이기
                cursorLoader.style.display = 'block';
                document.body.classList.add('cursor-hidden');
                
                // 2. 커서 애니메이션 방향
                if (direction === 'left') {
                    cursorLoader.classList.remove('animate-forward');
                    cursorLoader.classList.add('animate-reverse');
                } else {
                    cursorLoader.classList.remove('animate-reverse');
                    cursorLoader.classList.add('animate-forward');
                }
                
                // 3. 커서 움직임 리스너 추가
                window.addEventListener('mousemove', moveCursor);
                
                // 4. 슬라이드쇼 시작
                stopSlideshow(); // 일단 멈추고
                const slideFunction = direction === 'left' ? prevSlide : nextSlide;
                slideInterval = setInterval(slideFunction, 1000); // 새로 시작
                currentDirection = direction; // 현재 방향 저장
            };

            // 커서와 슬라이드쇼를 '중지'하는 함수
            const stopSlideshowAndCursor = () => {
                // 1. 커서 숨기기
                cursorLoader.style.display = 'none';
                document.body.classList.remove('cursor-hidden');
                
                // 2. 커서 애니메이션 제거
                cursorLoader.classList.remove('animate-forward', 'animate-reverse');

                // 3. 커서 움직임 리스너 제거
                window.removeEventListener('mousemove', moveCursor);
                
                // 4. 슬라이드쇼 중지
                stopSlideshow();
                currentDirection = null; // 방향 초기화
            };
            
            // --- 통합 이벤트 리스너 ---
            leftNav.addEventListener('mouseenter', () => startSlideshowAndCursor('left'));
            rightNav.addEventListener('mouseenter', () => startSlideshowAndCursor('right'));
            
            // 좌우 영역에서 나가면 중지
            leftNav.addEventListener('mouseleave', stopSlideshowAndCursor);
            rightNav.addEventListener('mouseleave', stopSlideshowAndCursor);
            
            // 홀드존에 들어가도 중지
            holdZone.addEventListener('mouseenter', stopSlideshowAndCursor);
            // --- 💡 수정 끝 ---

        } else if (isMobile) {
            // --- 모바일 로직 ---
            // [수정됨] 더블클릭 방지 로직 추가
            const lastTouchTime = { time: 0 };
            const doubleTapThreshold = 300;
            document.body.addEventListener('touchstart', (e) => {
                const currentTime = new Date().getTime();
                const timeDifference = currentTime - lastTouchTime.time;

                if (timeDifference < doubleTapThreshold && timeDifference > 0) {
                    e.preventDefault();
                    e.stopPropagation(); // 확대 방지
                }
                lastTouchTime.time = currentTime;
            }, { passive: false });
            
            const startAutoSlideshow = function() {
                stopSlideshow();
                slideInterval = setInterval(nextSlide, 1000);
            };
            mainContainer.addEventListener('touchstart', (e) => {
                // 더블탭은 위에서 이미 방지됨
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
        const projectItems = projectGrid.querySelectorAll('.project-item');
        const imageViewer = document.getElementById('image-viewer');
        const modalContent = imageViewer.querySelector('.modal-content');
        const modalImage = document.getElementById('modal-image');
        const modalClose = document.querySelector('.modal-close');
        const modalNavs = imageViewer.querySelectorAll('.modal-nav');
        const modalCounter = document.querySelector('.modal-counter');
        const siteHeader = document.querySelector('.site-header');
        
        const modalGridToggle = imageViewer.querySelector('.modal-grid-toggle');
        const modalGridView = imageViewer.querySelector('.modal-grid-view');

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
            modalImage.style.display = '';
            modalNavs.forEach(nav => { nav.style.display = ''; });
            modalCounter.style.display = '';
            modalGridToggle.style.display = '';
        };

        const openVimeoModal = function(vimeoId) {
            clearVimeo();
            isVimeoMode = true;

            modalImage.style.display = 'none';
            modalNavs.forEach(nav => { nav.style.display = 'none'; });
            modalCounter.style.display = 'none';
            modalGridToggle.style.display = 'none';

            vimeoWrapper = document.createElement('div');
            vimeoWrapper.className = 'modal-vimeo-frame';
            vimeoWrapper.style.cssText = 'position: relative; height: min(85vh, 900px); width: calc(min(85vh, 900px) * 9 / 16); max-width: 90vw; z-index: 1015;';

            const iframe = document.createElement('iframe');
            iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
            iframe.style.cssText = 'width: 100%; height: 100%; border: 0;';
            iframe.allow = 'autoplay; fullscreen; picture-in-picture';
            iframe.allowFullscreen = true;

            vimeoWrapper.appendChild(iframe);
            modalContent.appendChild(vimeoWrapper);

            imageViewer.classList.add('visible');
            if (projectGrid) projectGrid.classList.add('blurred');
            siteHeader.classList.add('blurred');
            document.body.classList.add('modal-open');
        };

        const updateModal = function() {
            if (currentGallery.length > 0) {
                modalImage.src = currentGallery[currentIndex];
                modalCounter.textContent = `${currentIndex + 1} of ${currentGallery.length}`;
            }
        };

        const toggleGridView = (switchToGrid) => {
            if (switchToGrid) {
                imageViewer.classList.add('grid-view-active');
                modalGridView.innerHTML = '';
                
                if (currentLayoutClass) {
                    modalGridView.classList.remove(currentLayoutClass);
                }
                
                if (currentLayoutClass) {
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

        modalGridToggle.addEventListener('click', () => {
            const isGridView = imageViewer.classList.contains('grid-view-active');
            toggleGridView(!isGridView);
        });

        const openModal = function(galleryData, layoutClass = '') {
            if (!galleryData || galleryData.length === 0) return;
            clearVimeo();
            isVimeoMode = false;

            currentGallery = galleryData;
            currentIndex = 0;
            currentLayoutClass = layoutClass; 
            
            if (modalGridView.classList.contains(currentLayoutClass)) {
                 modalGridView.classList.remove(currentLayoutClass);
            }
            modalGridView.classList.add(currentLayoutClass);

            imageViewer.classList.add('visible');
            if(projectGrid) projectGrid.classList.add('blurred');
            siteHeader.classList.add('blurred');
            document.body.classList.add('modal-open');
            toggleGridView(false);
        };

        const closeModal = function() {
            imageViewer.classList.remove('visible');
            if(projectGrid) projectGrid.classList.remove('blurred');
            siteHeader.classList.remove('blurred');
            document.body.classList.remove('modal-open');
            clearVimeo();
            isVimeoMode = false;

            if (imageViewer.classList.contains('grid-view-active')) {
                toggleGridView(false);
            }
            if (currentLayoutClass) {
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

        projectItems.forEach(item => {
            item.addEventListener('click', () => {
                const vimeoId = item.dataset.vimeo;
                if (vimeoId) {
                    openVimeoModal(vimeoId);
                    return;
                }

                const galleryArray = JSON.parse(item.dataset.gallery || '[]' );
                
                let layoutClass = '';
                for (const cls of item.classList) {
                    if (cls.endsWith('-project')) {
                        layoutClass = cls.replace('-project', '-layout');
                        break;
                    }
                }
                openModal(galleryArray, layoutClass);
            });
        });

        modalClose.addEventListener('click', closeModal);
        modalNavs[0].addEventListener('click', showPrevImage);
        modalNavs[1].addEventListener('click', showNextImage);

        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer || e.target === modalContent) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (!imageViewer.classList.contains('visible')) return;
            
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
