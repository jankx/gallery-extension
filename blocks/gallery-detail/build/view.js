(function(){
    var lightboxModal = null;
    var lightboxImages = [];
    var lightboxIndex = 0;

    function getLightboxModal() {
        if (lightboxModal) return lightboxModal;
        var modal = document.querySelector('.jankx-gallery-lightbox');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'jankx-gallery-lightbox';
            modal.innerHTML = 
                '<div class="jankx-lightbox-overlay"></div>' +
                '<div class="jankx-lightbox-content">' +
                    '<button type="button" class="jankx-lightbox-close" aria-label="Close">&times;</button>' +
                    '<button type="button" class="jankx-lightbox-prev" aria-label="Previous">&lsaquo;</button>' +
                    '<button type="button" class="jankx-lightbox-next" aria-label="Next">&rsaquo;</button>' +
                    '<div class="jankx-lightbox-figure">' +
                        '<img class="jankx-lightbox-image" src="" alt="" />' +
                        '<div class="jankx-lightbox-caption"></div>' +
                        '<div class="jankx-lightbox-counter"></div>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(modal);

            var closeBtn = modal.querySelector('.jankx-lightbox-close');
            var overlay = modal.querySelector('.jankx-lightbox-overlay');
            var prevBtn = modal.querySelector('.jankx-lightbox-prev');
            var nextBtn = modal.querySelector('.jankx-lightbox-next');

            function close() {
                modal.classList.remove('is-active');
                document.body.style.overflow = '';
            }

            closeBtn.addEventListener('click', close);
            overlay.addEventListener('click', close);

            prevBtn.addEventListener('click', function(){
                if (lightboxImages.length <= 1) return;
                lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
                updateLightboxImage();
            });

            nextBtn.addEventListener('click', function(){
                if (lightboxImages.length <= 1) return;
                lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
                updateLightboxImage();
            });

            document.addEventListener('keydown', function(e){
                if (!modal.classList.contains('is-active')) return;
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowLeft' && lightboxImages.length > 1) {
                    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
                    updateLightboxImage();
                }
                if (e.key === 'ArrowRight' && lightboxImages.length > 1) {
                    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
                    updateLightboxImage();
                }
            });
        }
        lightboxModal = modal;
        return lightboxModal;
    }

    function updateLightboxImage() {
        if (!lightboxModal || !lightboxImages.length) return;
        var imgObj = lightboxImages[lightboxIndex];
        if (!imgObj) return;

        var imgEl = lightboxModal.querySelector('.jankx-lightbox-image');
        var captionEl = lightboxModal.querySelector('.jankx-lightbox-caption');
        var counterEl = lightboxModal.querySelector('.jankx-lightbox-counter');
        var prevBtn = lightboxModal.querySelector('.jankx-lightbox-prev');
        var nextBtn = lightboxModal.querySelector('.jankx-lightbox-next');

        imgEl.src = imgObj.url || '';
        if (imgObj.srcset) {
            imgEl.setAttribute('srcset', imgObj.srcset);
        } else {
            imgEl.removeAttribute('srcset');
        }
        imgEl.alt = imgObj.alt || '';

        if (captionEl) {
            captionEl.textContent = imgObj.caption || '';
            captionEl.style.display = imgObj.caption ? 'block' : 'none';
        }

        if (counterEl) {
            counterEl.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
            counterEl.style.display = lightboxImages.length > 1 ? 'block' : 'none';
        }

        if (prevBtn) prevBtn.style.display = lightboxImages.length > 1 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = lightboxImages.length > 1 ? 'flex' : 'none';
    }

    function openLightbox(images, startIndex) {
        if (!images || !images.length) return;
        lightboxImages = images;
        lightboxIndex = startIndex >= 0 && startIndex < images.length ? startIndex : 0;
        var modal = getLightboxModal();
        updateLightboxImage();
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    }

    function init(root){
        if (!root) return;
        var main = root.querySelector('.jankx-gallery-detail__image');
        var buttons = Array.prototype.slice.call(root.querySelectorAll('.jankx-gallery-detail__thumb'));
        var total = buttons.length;
        var thumbs = root.querySelector('.jankx-gallery-detail__thumbs');
        var prev = root.querySelector('.jankx-gallery-detail__prev');
        var next = root.querySelector('.jankx-gallery-detail__next');
        var wishlist = root.querySelector('.jankx-gallery-detail__wishlist');
        var fullscreen = root.querySelector('.jankx-gallery-detail__fullscreen');
        var currentIndex = 0;

        function selectIndex(idx){
            var btn = buttons[idx];
            if (!btn) return;
            var s = btn.getAttribute('data-src') || '';
            var ss = btn.getAttribute('data-srcset') || '';
            var sz = btn.getAttribute('data-sizes') || '';
            if (s && main) main.setAttribute('src', s);
            if (main) {
                if (ss) { main.setAttribute('srcset', ss); } else { main.removeAttribute('srcset'); }
                if (sz) { main.setAttribute('sizes', sz); } else { main.removeAttribute('sizes'); }
                if (main.getAttribute('loading') === 'lazy') { main.removeAttribute('loading'); }
            }
            buttons.forEach(function(b){ b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            currentIndex = idx;
            if (thumbs) {
                var rect = btn.getBoundingClientRect();
                var trect = thumbs.getBoundingClientRect();
                var offset = rect.left - trect.left - (trect.width/2 - rect.width/2);
                thumbs.scrollBy({ left: offset, behavior: 'smooth' });
            }
        }
        if (total > 1) {
            buttons.forEach(function(btn, idx){
                if (idx === 0) btn.classList.add('is-active');
                btn.addEventListener('click', function(){ selectIndex(idx); });
            });
            if (prev) prev.addEventListener('click', function(){
                selectIndex((currentIndex - 1 + buttons.length) % buttons.length);
            });
            if (next) next.addEventListener('click', function(){
                selectIndex((currentIndex + 1) % buttons.length);
            });
        } else {
            if (prev) prev.remove();
            if (next) next.remove();
        }
        if (wishlist) wishlist.addEventListener('click', function(){
            var pressed = wishlist.getAttribute('aria-pressed') === 'true';
            wishlist.setAttribute('aria-pressed', pressed ? 'false' : 'true');
            wishlist.classList.toggle('is-active');
        });
        if (fullscreen) fullscreen.addEventListener('click', function(){
            var el = root.querySelector('.jankx-gallery-detail__stage');
            if (el && el.requestFullscreen) el.requestFullscreen();
        });

        // Autoplay
        var autoplay = total > 1 && root.getAttribute('data-autoplay') === '1';
        var speed = parseInt(root.getAttribute('data-speed') || '3000', 10);
        var timer = null;
        function startAutoplay(){
            if (timer || !autoplay) return;
            timer = setInterval(function(){
                selectIndex((currentIndex + 1) % buttons.length);
            }, speed);
        }
        function stopAutoplay(){
            if (timer) { clearInterval(timer); timer = null; }
        }
        if (autoplay) startAutoplay();
        root.addEventListener('mouseenter', stopAutoplay);
        root.addEventListener('mouseleave', function(){ if (autoplay) startAutoplay(); });

        // Lightbox integration
        var enableLightbox = root.getAttribute('data-enable-lightbox') !== '0';
        var galleryImages = [];
        try {
            galleryImages = JSON.parse(root.getAttribute('data-gallery-images') || '[]');
        } catch(e) {}

        if (enableLightbox && galleryImages.length > 0) {
            // Main stage click (for classic)
            var stage = root.querySelector('.jankx-gallery-detail__stage');
            if (stage) {
                stage.style.cursor = 'pointer';
                stage.addEventListener('click', function(e){
                    if (e.target.closest('.jankx-gallery-detail__wishlist, .jankx-gallery-detail__fullscreen, .jankx-gallery-detail__prev, .jankx-gallery-detail__next')) {
                        return;
                    }
                    openLightbox(galleryImages, currentIndex);
                });
            }

            // Grid, Zigzag, Mosaic item click
            var items = root.querySelectorAll('.jankx-gallery-item, .jankx-gallery-grid-item, .jankx-gallery-mosaic-item');
            Array.prototype.forEach.call(items, function(item){
                item.style.cursor = 'pointer';
                item.addEventListener('click', function(e){
                    var idx = parseInt(item.getAttribute('data-index') || '0', 10);
                    openLightbox(galleryImages, isNaN(idx) ? 0 : idx);
                });
            });
        }
    }

    var roots = document.querySelectorAll('.jankx-gallery-detail');
    Array.prototype.forEach.call(roots, init);
    document.addEventListener('jankx:modal:show', function(e){
        var m = e.detail && e.detail.modalElement;
        if (!m) return;
        var r = m.querySelectorAll('.jankx-gallery-detail');
        Array.prototype.forEach.call(r, init);
    });
    document.addEventListener('jankx:gallery:refresh', function(){
        var rs = document.querySelectorAll('.jankx-gallery-detail');
        Array.prototype.forEach.call(rs, init);
    });
})();
