(function applyInviteeNameFromURL() {
  const params = new URLSearchParams(window.location.search);

  // Bạn có thể chọn 1 key cố định, ví dụ: ?to=
  // Hoặc hỗ trợ nhiều key cho tiện: to, name, guest
  const raw =
    params.get("to") ||
    params.get("name") ||
    params.get("guest");

  const el = document.getElementById("inviteeName");
  if (!el) return;

  // Mặc định nếu không có param
  const fallback = "Quý khách";

  if (!raw) {
    el.textContent = fallback;
    return;
  }

  // Decode + xử lý dấu '+' (nhiều người copy link hay có '+')
  const decoded = decodeURIComponent(raw.replace(/\+/g, " ")).trim();

  // Chặn rỗng / quá dài (tránh phá layout)
  const safeName = decoded.length ? decoded.slice(0, 60) : fallback;

  // IMPORTANT: dùng textContent để tránh XSS
  el.textContent = safeName;

  // (Tuỳ chọn) prefill luôn form "Họ và tên" ở guestbook
  const nameInput = document.getElementById("name");
  if (nameInput && !nameInput.value) {
    nameInput.value = safeName;
  }
})();

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // WEDDING DATE & COUNTDOWN
    // ============================================
    const weddingDate = new Date('2026-03-29T08:00:00+07:00').getTime();

    function updateCountdown() {
        const now = Date.now();
        const distance = weddingDate - now;
        
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;

        if (distance < 0) {
            countdownEl.innerHTML = '<p style="font-size: 1.5rem; color: var(--secondary-color);">Chúng tôi đã kết hôn! 💍</p>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    const backToTopBtn = document.getElementById('backToTop');
    const quickNav = document.getElementById('quickNav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            if (backToTopBtn) backToTopBtn.classList.add('visible');
            if (quickNav) quickNav.classList.add('visible');
        } else {
            if (backToTopBtn) backToTopBtn.classList.remove('visible');
            if (quickNav) quickNav.classList.remove('visible');
        }
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // GOOGLE SHEETS - GUESTBOOK
    // ============================================
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgXQVRMxY9lRwqpwypqYOUFQ0ASR7bErjzdYaDurJVw-YDm2mxFcqZHxMxNM7YLBEw-g/exec';

    const guestbookForm = document.getElementById('guestbook-form');
    const formMessage = document.getElementById('form-message');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');

    function showMessage(message, type) {
        if (!formMessage) return;
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        setTimeout(function() {
            formMessage.className = 'form-message';
        }, 5000);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function addWishToDisplay(wish) {
        var wishesContainer = document.getElementById('wishes-container');
        if (!wishesContainer) return;
        
        var wishCard = document.createElement('div');
        wishCard.className = 'wish-card';
        
        var date = new Date(wish.timestamp);
        var formattedDate = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        wishCard.innerHTML = '<p class="wish-name">' + escapeHtml(wish.name) + '</p>' +
            '<p class="wish-date">' + formattedDate + '</p>' +
            '<p class="wish-message">' + escapeHtml(wish.message) + '</p>';
        
        wishesContainer.insertBefore(wishCard, wishesContainer.firstChild);
    }

    function loadWishes() {
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            var sampleWishes = [
                { name: 'Nguyễn Văn A', message: 'Chúc hai bạn trăm năm hạnh phúc!', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { name: 'Trần Thị B', message: 'Chúc mừng hạnh phúc!', timestamp: new Date(Date.now() - 172800000).toISOString() }
            ];
            sampleWishes.forEach(function(wish) { addWishToDisplay(wish); });
            return;
        }

        fetch(GOOGLE_SCRIPT_URL)
            .then(function(response) { return response.json(); })
            .then(function(wishes) {
                wishes.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
                wishes.forEach(function(wish) { addWishToDisplay(wish); });
            })
            .catch(function(error) { console.error('Error loading wishes:', error); });
    }

    loadWishes();

    if (guestbookForm) {
        guestbookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var formData = {
                name: document.getElementById('name').value.trim(),
                attending: document.getElementById('attending').value,
                side: document.getElementById('side').value,
                quantity: parseInt(document.getElementById('quantity').value, 10) || 1,
                message: document.getElementById('message').value.trim()
            };

            if (!formData.name || !formData.message) {
                showMessage('Vui lòng điền đầy đủ họ tên và lời chúc!', 'error');
                return;
            }

            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline';
            guestbookForm.querySelector('button').disabled = true;

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(function() {
                addWishToDisplay({
                    name: formData.name,
                    message: formData.message,
                    timestamp: new Date().toISOString()
                });
                showMessage('Cảm ơn bạn đã gửi lời chúc!', 'success');
                guestbookForm.reset();
            })
            .catch(function(error) {
                console.error('Error:', error);
                showMessage('Có lỗi xảy ra. Vui lòng thử lại sau!', 'error');
            })
            .finally(function() {
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                guestbookForm.querySelector('button').disabled = false;
            });
        });
    }

    // ============================================
    // SCROLL ANIMATION — Unified Element System
    // ① anim-title  ② anim-fade-up  ③ anim-left/right  ④ gallery polaroid
    // ============================================
    var animObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
                setTimeout(function() {
                    el.classList.add('in-view');
                }, delay);
                animObserver.unobserve(el);
            }
        });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.anim-title, .anim-fade-up, .anim-left, .anim-right').forEach(function(el) {
        animObserver.observe(el);
    });

    // Legacy animate-on-scroll support (gift cards, etc.)
    var legacyObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                legacyObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function(el) {
        legacyObserver.observe(el);
    });

    // ============================================
    // MUSIC PLAYER
    // ============================================
    var bgMusic = document.getElementById('bgMusic');
    var musicBtn = document.getElementById('musicBtn');
    var welcomeScreen = document.getElementById('welcomeScreen');
    var enterBtn = document.getElementById('enterBtn');
    var isPlaying = false;

    function playMusic() {
        if (!bgMusic) return;
        bgMusic.play().then(function() {
            if (musicBtn) musicBtn.classList.add('playing');
            isPlaying = true;
        }).catch(function(error) {
            console.log('Autoplay prevented:', error);
        });
    }

    function toggleMusic() {
        if (!bgMusic) return;
        if (isPlaying) {
            bgMusic.pause();
            if (musicBtn) musicBtn.classList.remove('playing');
            isPlaying = false;
        } else {
            playMusic();
        }
    }

    if (enterBtn) {
        enterBtn.addEventListener('click', function() {
            if (welcomeScreen) welcomeScreen.classList.add('hidden');
            playMusic();
        });
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }

    // ============================================
    // CURSOR TRAIL EFFECT
    // ============================================
    var cursorEffect = document.getElementById('cursorEffect');
    var particleEmojis = ['💕', '✨', '💗', '❤️', '💖'];
    var lastTime = 0;
    var throttleDelay = 50;

    function createParticle(x, y) {
        if (!cursorEffect) return;
        var particle = document.createElement('span');
        particle.className = 'cursor-particle';
        particle.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
        
        var offsetX = (Math.random() - 0.5) * 20;
        var offsetY = (Math.random() - 0.5) * 20;
        
        particle.style.left = (x + offsetX) + 'px';
        particle.style.top = (y + offsetY) + 'px';
        particle.style.fontSize = (15 + Math.random() * 15) + 'px';
        
        cursorEffect.appendChild(particle);
        setTimeout(function() { particle.remove(); }, 1500);
    }

    function createSparkle(x, y) {
        if (!cursorEffect) return;
        var sparkle = document.createElement('span');
        sparkle.className = 'cursor-sparkle';
        
        var offsetX = (Math.random() - 0.5) * 30;
        var offsetY = (Math.random() - 0.5) * 30;
        
        sparkle.style.left = (x + offsetX) + 'px';
        sparkle.style.top = (y + offsetY) + 'px';
        sparkle.style.background = Math.random() > 0.5 ? '#e91e63' : '#fce4ec';
        
        cursorEffect.appendChild(sparkle);
        setTimeout(function() { sparkle.remove(); }, 800);
    }

    function handleMove(x, y) {
        var now = Date.now();
        if (now - lastTime < throttleDelay) return;
        lastTime = now;
        createParticle(x, y);
        if (Math.random() > 0.5) createSparkle(x, y);
    }

    function createBurst(x, y) {
        for (var i = 0; i < 8; i++) {
            (function(index) {
                setTimeout(function() {
                    createParticle(x, y);
                    createSparkle(x, y);
                }, index * 30);
            })(i);
        }
    }

    document.addEventListener('mousemove', function(e) { handleMove(e.clientX, e.clientY); });
    document.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, { passive: true });
    document.addEventListener('click', function(e) { createBurst(e.clientX, e.clientY); });
    document.addEventListener('touchstart', function(e) {
        var touch = e.touches[0];
        createBurst(touch.clientX, touch.clientY);
    }, { passive: true });

    // ============================================
    // FALLING FLOWERS
    // ============================================
    var fallingFlowers = document.getElementById('fallingFlowers');
    var flowerEmojis = ['🌸', '🌺', '💮', '🏵️', '🌷', '🌹', '💐', '🪷'];

    function createFlower() {
        if (!fallingFlowers) return;
        var flower = document.createElement('span');
        flower.className = 'flower';
        flower.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
        flower.style.left = Math.random() * 100 + 'vw';
        
        var size = 15 + Math.random() * 20;
        flower.style.fontSize = size + 'px';
        
        var duration = 8 + Math.random() * 7;
        flower.style.animationDuration = duration + 's';
        flower.style.animationDelay = Math.random() * 2 + 's';
        
        flower.classList.add(Math.random() > 0.5 ? 'sway-1' : 'sway-2');
        
        fallingFlowers.appendChild(flower);
        setTimeout(function() { flower.remove(); }, (duration + 2) * 1000);
    }

    // Initial flowers
    for (var i = 0; i < 10; i++) {
        (function(index) {
            setTimeout(createFlower, index * 300);
        })(i);
    }
    
    // Continuous flowers
    setInterval(function() {
        if (document.visibilityState === 'visible') createFlower();
    }, 800);

    // ============================================
    // HORIZONTAL SCROLL DRAG (STORY)
    // ============================================
    var timelineScroll = document.getElementById('timelineScroll');
    if (timelineScroll) {
        var isDown = false;
        var startX;
        var scrollLeft;

        timelineScroll.addEventListener('mousedown', function(e) {
            isDown = true;
            timelineScroll.style.cursor = 'grabbing';
            startX = e.pageX - timelineScroll.offsetLeft;
            scrollLeft = timelineScroll.scrollLeft;
        });

        timelineScroll.addEventListener('mouseleave', function() {
            isDown = false;
            timelineScroll.style.cursor = 'grab';
        });

        timelineScroll.addEventListener('mouseup', function() {
            isDown = false;
            timelineScroll.style.cursor = 'grab';
        });

        timelineScroll.addEventListener('mousemove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - timelineScroll.offsetLeft;
            var walk = (x - startX) * 2;
            timelineScroll.scrollLeft = scrollLeft - walk;
        });

        // Hide scroll hint once user has scrolled a bit
        var scrollHint = document.getElementById('scrollHint');
        if (scrollHint) {
            timelineScroll.addEventListener('scroll', function() {
                if (timelineScroll.scrollLeft > 60) {
                    scrollHint.classList.add('hidden');
                }
            }, { passive: true });
        }
    }

    // ============================================
    // GALLERY SHUFFLE
    // ============================================
    (function() {
        var grid = document.querySelector('.gallery-grid');
        if (!grid) return;
        var items = Array.from(grid.querySelectorAll('.gallery-item'));
        // Fisher-Yates shuffle
        for (var i = items.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            grid.appendChild(items[j]);
            var tmp = items[i]; items[i] = items[j]; items[j] = tmp;
        }
        // Re-assign data-index after shuffle so lightbox order matches
        items = Array.from(grid.querySelectorAll('.gallery-item'));
        items.forEach(function(item, idx) {
            item.setAttribute('data-index', idx);
        });
    })();

    // ============================================
    // GALLERY ORIENTATION DETECTION
    // ============================================
    document.querySelectorAll('.gallery-item').forEach(function(item) {
        var img = item.querySelector('img');
        if (!img) return;
        function applyOrientation() {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                if (img.naturalHeight > img.naturalWidth) {
                    item.classList.add('is-portrait');
                } else {
                    item.classList.add('is-landscape');
                }
            }
        }
        if (img.complete) {
            applyOrientation();
        } else {
            img.addEventListener('load', applyOrientation);
        }
    });

    // ============================================
    // IMAGE LIGHTBOX
    // ============================================
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var lightboxCounter = document.getElementById('lightboxCounter');

    // Collect gallery images (thumbnail for preview, full-res for lightbox)
    var galleryImages = [];
    document.querySelectorAll('.gallery-item').forEach(function(item) {
        var img = item.querySelector('img');
        if (img) galleryImages.push({
            src: img.getAttribute('data-full-src') || img.getAttribute('src'),
            thumbnail: img.getAttribute('src'),
            alt: img.alt
        });
    });

    var currentIndex = 0;
    var lightboxGeneration = 0; // prevents stale full-res loads from overwriting newer image

    function setLightboxImage(src, alt, thumbnailSrc) {
        if (!lightboxImg) return;
        lightboxImg.classList.remove('loaded');
        lightboxImg.alt = alt || 'Preview';
        lightboxGeneration++;
        var gen = lightboxGeneration;

        if (thumbnailSrc && thumbnailSrc !== src) {
            // Show thumbnail immediately for instant display
            lightboxImg.src = thumbnailSrc;
            lightboxImg.classList.add('loaded');
            // Load full-res in background, swap when ready
            var fullImg = new Image();
            fullImg.onload = function() {
                if (lightboxGeneration === gen) {
                    lightboxImg.src = src;
                }
            };
            fullImg.src = src;
        } else {
            lightboxImg.onload = function() { lightboxImg.classList.add('loaded'); };
            lightboxImg.src = src;
            if (lightboxImg.complete) lightboxImg.classList.add('loaded');
        }
    }

    function updateCounter() {
        if (lightboxCounter && !lightbox.classList.contains('single-mode')) {
            lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
        }
    }

    function openGalleryLightbox(index) {
        if (!lightbox || galleryImages.length === 0) return;
        currentIndex = ((index % galleryImages.length) + galleryImages.length) % galleryImages.length;
        lightbox.classList.remove('single-mode');
        setLightboxImage(galleryImages[currentIndex].src, galleryImages[currentIndex].alt, galleryImages[currentIndex].thumbnail);
        updateCounter();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function openSingleLightbox(src, alt, thumbnailSrc) {
        if (!lightbox) return;
        lightbox.classList.add('single-mode');
        setLightboxImage(src, alt, thumbnailSrc);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightboxGeneration++; // cancel any pending full-res load
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        setLightboxImage(galleryImages[currentIndex].src, galleryImages[currentIndex].alt, galleryImages[currentIndex].thumbnail);
        updateCounter();
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        setLightboxImage(galleryImages[currentIndex].src, galleryImages[currentIndex].alt, galleryImages[currentIndex].thumbnail);
        updateCounter();
    }

    // Gallery items click
    document.querySelectorAll('.gallery-item').forEach(function(item) {
        item.addEventListener('click', function() {
            var index = parseInt(item.getAttribute('data-index'), 10);
            openGalleryLightbox(isNaN(index) ? 0 : index);
        });
    });

    // Story / timeline images click (single mode)
    document.querySelectorAll('.timeline-images img').forEach(function(img) {
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            var fullSrc = img.getAttribute('data-full-src') || img.getAttribute('src');
            openSingleLightbox(fullSrc, img.alt, img.getAttribute('src'));
        });
    });

    // Button events
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function(e) { e.stopPropagation(); showPrev(); });
    if (lightboxNext) lightboxNext.addEventListener('click', function(e) { e.stopPropagation(); showNext(); });

    // Close on backdrop click
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target === document.querySelector('.lightbox-content')) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && !lightbox.classList.contains('single-mode')) showPrev();
        if (e.key === 'ArrowRight' && !lightbox.classList.contains('single-mode')) showNext();
    });

    // Touch swipe on mobile
    var touchStartX = 0;
    var touchStartY = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            if (lightbox.classList.contains('single-mode')) return;
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
                if (dx < 0) showNext();
                else showPrev();
            }
        }, { passive: true });
    }

    // ============================================
    // SECTION BACKGROUND PHOTOS
    // ============================================
    var sectionBgPool = [
        'AbumAnhCuoi_Compress/BH_01560phong.jpg',
        'AbumAnhCuoi_Compress/BH_01578phong.jpg',
        'AbumAnhCuoi_Compress/BH_01712cc_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01749c_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01828cc_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01860_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01867_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01899_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01930_(2).jpg',
        'AbumAnhCuoi_Compress/BH_01951_(2).jpg',
        'AbumAnhCuoi_Compress/BH_02042_(2).jpg',
        'AbumAnhCuoi_Compress/BH_02073_(2).jpg',
        'AbumAnhCuoi_Compress/BH_02088_(2).jpg',
        'AbumAnhCuoi_Compress/BH_02154_(2).jpg'
    ];

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    var bgTargetIds = ['save-date', 'couple', 'story', 'event', 'guestbook', 'gift', 'map'];
    var shuffledBgImgs = shuffleArray(sectionBgPool);

    bgTargetIds.forEach(function(id, i) {
        var section = document.getElementById(id);
        if (!section) return;
        section.classList.add('section-photo-bg');
        var imgSrc = shuffledBgImgs[i % shuffledBgImgs.length];
        var preloader = new Image();
        preloader.onload = function() {
            section.style.setProperty('--section-bg', 'url("' + imgSrc + '")');
            section.classList.add('bg-loaded');
        };
        preloader.src = imgSrc;
    });

    // Gallery entrance animation (IntersectionObserver)
    var galleryItems = document.querySelectorAll('.gallery-item');
    if ('IntersectionObserver' in window && galleryItems.length) {
        var galleryObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var index = parseInt(el.getAttribute('data-index'), 10) || 0;
                    var rotation = (Math.random() * 8 - 4).toFixed(1);
                    // Set CSS variable first, then trigger animation after a frame
                    // so the keyframe `from` state can read the variable
                    el.style.setProperty('--init-rotate', rotation + 'deg');
                    var delay = Math.max(20, index * 120);
                    setTimeout(function() { el.classList.add('visible'); }, delay);
                    galleryObserver.unobserve(el);
                }
            });
        }, { threshold: 0.12 });

        galleryItems.forEach(function(item) {
            galleryObserver.observe(item);
        });
    } else {
        // Fallback: show all immediately
        galleryItems.forEach(function(item) { item.classList.add('visible'); });
    }

});
