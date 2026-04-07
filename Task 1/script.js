/**
 * Dynamic Hero Slider with jQuery
 * Features: auto-rotation, manual navigation, keyboard support, responsive rendering
 */

var HeroSlider = function(config) {
    this.config = $.extend({
        autoRotateInterval: 5000,
        slidesPerGroup: 1
    }, config);

    this.slides = [];
    this.currentIndex = 0;
    this.autoRotateTimer = null;
    this.isTransitioning = false;

    this.$slidesContainer = $('#slides');
    this.$indicatorsContainer = $('#indicators');
    this.$prevBtn = $('#prevBtn');
    this.$nextBtn = $('#nextBtn');
    this.$heroSection = $('.hero-section');

    this.init();
};

HeroSlider.prototype.init = function() {
    var self = this;

    this.loadSlides().done(function() {
        self.renderSlides();
        self.renderIndicators();
        self.attachEventListeners();
        self.startAutoRotate();

        console.log('Hero Slider initialized successfully');
    }).fail(function(error) {
        console.error('Failed to initialize slider:', error);
    });
};

HeroSlider.prototype.loadSlides = function() {
    var self = this;
    var deferred = $.Deferred();
    var isFileProtocol = window.location.protocol === 'file:';

    if (isFileProtocol) {
        console.warn('Local file mode detected. Using demo slides because browsers block AJAX requests from file:// URLs.');
        self.slides = self.getDemoSlides();
        deferred.resolve();
        return deferred.promise();
    }

    $.ajax({
        url: 'data.json',
        dataType: 'json'
    }).done(function(data) {
        self.slides = data.slides || [];

        if (!self.slides.length) {
            console.warn('data.json did not contain slide entries. Using demo slides instead.');
            self.slides = self.getDemoSlides();
        }

        deferred.resolve();
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error loading slides data, using demo slides:', errorThrown || textStatus);
        self.slides = self.getDemoSlides();
        deferred.resolve();
    });

    return deferred.promise();
};

HeroSlider.prototype.getDemoSlides = function() {
    return [
        {
            id: 1,
            title: 'AI Project Demo',
            description: 'Experience cutting-edge artificial intelligence technology that transforms ideas into reality.',
            image: 'https://images.unsplash.com/photo-1677442d019cecf8b13b3c6f0e31d968?w=1600&h=900&fit=crop',
            alt: 'Abstract artificial intelligence concept with glowing digital interface',
            buttonText: 'View Project',
            buttonLink: '#projects'
        },
        {
            id: 2,
            title: 'Web Development Services',
            description: 'Build modern, responsive websites with clean code, strong UX, and production-ready design.',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&h=900&fit=crop',
            alt: 'Developer workspace with laptop displaying code editor',
            buttonText: 'Learn More',
            buttonLink: '#projects'
        },
        {
            id: 3,
            title: 'Mobile App Solutions',
            description: 'Create polished cross-platform mobile experiences focused on usability and performance.',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&h=900&fit=crop',
            alt: 'Hand holding a smartphone with a modern app interface',
            buttonText: 'Explore',
            buttonLink: '#projects'
        },
        {
            id: 4,
            title: 'UI/UX Design',
            description: 'Design intuitive and beautiful interfaces that engage users and support business goals.',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&h=900&fit=crop',
            alt: 'UI design mockups and wireframes laid out on a workspace',
            buttonText: 'View Service',
            buttonLink: '#contact'
        }
    ];
};

HeroSlider.prototype.renderSlides = function() {
    var self = this;

    this.$slidesContainer.empty();

    $.each(this.slides, function(index, slide) {
        var activeClass = index === 0 ? 'active' : '';
        var slideAlt = slide.alt || slide.title;

        var slideHtml = $('<article>')
            .addClass('slide ' + activeClass)
            .attr({
                'data-index': index,
                'role': 'group',
                'aria-roledescription': 'slide',
                'aria-label': 'Slide ' + (index + 1) + ' of ' + self.slides.length
            })
            .html(
                '<img class="slide-image" src="' + self.escapeHtml(slide.image) + '" alt="' + self.escapeHtml(slideAlt) + '">' +
                '<div class="slide-overlay"></div>' +
                '<div class="slide-content">' +
                    '<p class="eyebrow">Featured ' + (index + 1) + '</p>' +
                    '<h1>' + self.escapeHtml(slide.title) + '</h1>' +
                    '<p>' + self.escapeHtml(slide.description) + '</p>' +
                    '<a href="' + self.escapeHtml(slide.buttonLink) + '" class="cta-button" aria-label="' + self.escapeHtml(slide.buttonText + ' - ' + slide.title) + '">' +
                        self.escapeHtml(slide.buttonText) +
                    '</a>' +
                '</div>'
            );

        self.$slidesContainer.append(slideHtml);
    });
};

HeroSlider.prototype.renderIndicators = function() {
    var self = this;

    this.$indicatorsContainer.empty();

    $.each(this.slides, function(index, slide) {
        var activeClass = index === 0 ? 'active' : '';
        var ariaPressed = index === 0 ? 'true' : 'false';

        var indicator = $('<button>')
            .addClass('indicator ' + activeClass)
            .attr({
                'type': 'button',
                'data-index': index,
                'aria-label': 'Go to slide ' + (index + 1) + ': ' + slide.title,
                'aria-pressed': ariaPressed
            })
            .on('click', function() {
                self.goToSlide(index);
            });

        self.$indicatorsContainer.append(indicator);
    });
};

HeroSlider.prototype.attachEventListeners = function() {
    var self = this;

    this.$nextBtn.on('click', function() {
        self.nextSlide();
    });

    this.$prevBtn.on('click', function() {
        self.prevSlide();
    });

    $(document).on('keydown', function(e) {
        self.handleKeyboardNav(e);
    });

    this.$slidesContainer.on('mouseenter focusin', function() {
        self.pauseAutoRotate();
    });

    this.$slidesContainer.on('mouseleave focusout', function() {
        self.resumeAutoRotate();
    });
};

HeroSlider.prototype.handleKeyboardNav = function(e) {
    var heroOffset = this.$heroSection.offset();
    var heroHeight = this.$heroSection.outerHeight();
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();

    if (!heroOffset) {
        return;
    }

    var isHeroInView = (heroOffset.top + heroHeight > scrollTop) &&
        (heroOffset.top < scrollTop + windowHeight);

    if (!isHeroInView) {
        return;
    }

    switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            this.nextSlide();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            this.prevSlide();
            break;
    }
};

HeroSlider.prototype.goToSlide = function(index) {
    if (this.isTransitioning || index === this.currentIndex) {
        return;
    }

    if (index < 0 || index >= this.slides.length) {
        return;
    }

    this.isTransitioning = true;
    var self = this;

    $('.slide').removeClass('active');
    $('.slide').eq(index).addClass('active');

    $('.indicator').removeClass('active').attr('aria-pressed', 'false');
    $('.indicator').eq(index).addClass('active').attr('aria-pressed', 'true');

    this.currentIndex = index;

    setTimeout(function() {
        self.isTransitioning = false;
    }, 800);

    this.resetAutoRotate();
};

HeroSlider.prototype.nextSlide = function() {
    if (!this.slides.length) {
        return;
    }

    var nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
};

HeroSlider.prototype.prevSlide = function() {
    if (!this.slides.length) {
        return;
    }

    var prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
};

HeroSlider.prototype.startAutoRotate = function() {
    var self = this;

    if (!this.config.autoRotateInterval || this.slides.length <= 1 || this.autoRotateTimer) {
        return;
    }

    this.autoRotateTimer = setTimeout(function() {
        self.autoRotateTimer = null;
        self.nextSlide();
        self.startAutoRotate();
    }, this.config.autoRotateInterval);
};

HeroSlider.prototype.pauseAutoRotate = function() {
    if (this.autoRotateTimer) {
        clearTimeout(this.autoRotateTimer);
        this.autoRotateTimer = null;
    }
};

HeroSlider.prototype.resetAutoRotate = function() {
    this.pauseAutoRotate();
    this.startAutoRotate();
};

HeroSlider.prototype.resumeAutoRotate = function() {
    if (!this.autoRotateTimer) {
        this.startAutoRotate();
    }
};

HeroSlider.prototype.escapeHtml = function(text) {
    var value = String(text == null ? '' : text);
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return value.replace(/[&<>"']/g, function(character) {
        return map[character];
    });
};

HeroSlider.prototype.destroy = function() {
    this.pauseAutoRotate();
    this.$nextBtn.off('click');
    this.$prevBtn.off('click');
    this.$slidesContainer.off('mouseenter mouseleave focusin focusout');
    $(document).off('keydown');
};

$(document).ready(function() {
    var slider = new HeroSlider({
        autoRotateInterval: 5000,
        slidesPerGroup: 1
    });

    window.heroSlider = slider;
});
