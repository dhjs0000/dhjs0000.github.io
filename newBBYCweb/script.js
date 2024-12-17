// 汉堡菜单交互
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // 添加点击其他区域关闭菜单
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                    navLinks.classList.remove('active');
                }
            });
        });
        
        // 点击链接后关闭菜单
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

var navbar = document.querySelector('.navbar');
var line = document.querySelector('.nav-line');
var items = Array.from(document.querySelectorAll('.nav-item'));

items.forEach(function(item, index) {
  item.addEventListener('mouseover', function() {
    line.style.width = item.offsetWidth + 'px';
    line.style.left = item.offsetLeft + 'px';
    line.style.transition = 'all 0.5s ease';
  });

  item.addEventListener('mouseout', function() {
    var activeItem = document.querySelector('.nav-item.current');
    line.style.width = activeItem.offsetWidth + 'px';
    line.style.left = activeItem.offsetLeft + 'px';
    line.style.transition = 'all 0.5s ease';
  });
});

// 初始化线段位置
var activeItem = document.querySelector('.nav-item.current');
if (activeItem) {
    line.style.width = activeItem.offsetWidth + 'px';
    line.style.left = activeItem.offsetLeft + 'px';
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// 处理Clarity提示
document.addEventListener('DOMContentLoaded', () => {
    const notice = document.querySelector('.clarity-notice');
    const acceptButton = document.querySelector('.accept-button');
    
    if (acceptButton && notice) {
        acceptButton.addEventListener('click', function() {
            notice.style.animation = 'slideDown 0.5s forwards';
            
            // 添加关闭动画
            if (!document.querySelector('#clarity-animation')) {
                const style = document.createElement('style');
                style.id = 'clarity-animation';
                style.textContent = `
                    @keyframes slideDown {
                        from {
                            transform: translateY(0);
                        }
                        to {
                            transform: translateY(100%);
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // 动画结束后隐藏元素
            setTimeout(() => {
                notice.style.display = 'none';
                // 存储用户的选择
                localStorage.setItem('clarityNoticeAccepted', 'true');
            }, 500);
        });
    }
    
    // 检查是否已经接受过
    if (localStorage.getItem('clarityNoticeAccepted') === 'true') {
        notice.style.display = 'none';
    }
});

// 添加滚动时的导航栏高亮效果
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section, div[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 150) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === currentSection) {
            link.classList.add('active');
        }
    });
});

// 添加页面加载动画
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
});

// 主题切换功能
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 从localStorage获取用户的主题偏好
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // 切换主题
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 触发主题变更事件
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
    });
}

// 导航交互
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    let lastScroll = 0;
    
    // 滚动处理
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // 导航栏显示/隐藏
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('scroll-down');
            navbar.classList.remove('scroll-up');
        } else {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }
        
        // 导航栏背景
        if (currentScroll > 50) {
            navbar.classList.add('solid');
            navbar.classList.remove('transparent');
        } else {
            navbar.classList.remove('solid');
            navbar.classList.add('transparent');
        }
        
        lastScroll = currentScroll;
        
        // 高亮当前部分
        const sections = document.querySelectorAll('section, div[id]');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });
    
    // 平滑滚动
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 页面加载动画
function initPageLoader() {
    const loader = document.querySelector('.page-loader');
    const content = document.querySelector('.content');
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            document.body.classList.add('loaded');
            
            // 添加元素逐个显示动画
            const fadeElements = document.querySelectorAll('.fade-in');
            fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('visible');
                }, 100 * index);
            });
        }, 500);
    });
}

// 懒加载功能
function initLazyLoading() {
    const lazyLoadOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('visible');
                observer.unobserve(element);
            }
        });
    }, lazyLoadOptions);

    // 获取所有需要懒加载的元素
    const lazyLoadElements = document.querySelectorAll('.lazy-load');
    lazyLoadElements.forEach(element => {
        // 初始状态隐藏
        element.classList.remove('visible');
        // 添加观察
        lazyLoadObserver.observe(element);
    });
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initNavigation();
    initPageLoader();
    initLazyLoading();
});