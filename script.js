// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // 从 localStorage 获取保存的主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (savedTheme === 'dark-theme') {
            themeToggle.classList.add('dark');
        }
    }
    
    // 主题切换按钮点击事件
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-theme');
            themeToggle.classList.toggle('dark');
            
            // 保存主题设置到 localStorage
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark-theme');
            } else {
                localStorage.setItem('theme', '');
            }
        });
    }

    // Clarity 通知
    const clarityNotice = document.querySelector('.clarity-notice');
    const acceptButton = document.querySelector('.accept-button');
    
    if (clarityNotice && acceptButton) {
        // 检查是否已经接受
        if (!localStorage.getItem('clarity-accepted')) {
            clarityNotice.style.display = 'flex';
        }

        acceptButton.addEventListener('click', function() {
            clarityNotice.style.display = 'none';
            localStorage.setItem('clarity-accepted', 'true');
        });
    }

    // 懒加载动画
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.lazy-load').forEach(element => {
        observer.observe(element);
    });
});

// 新增倒计时功能
window.onload = function() {
    const countDownDate = new Date("2026-05-01").getTime();
    
    const updateCountdown = function() {
        const now = new Date().getTime();
        const timeLeft = countDownDate - now;
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        document.getElementById("countdown").innerHTML = 
            `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
        
        if(timeLeft < 0) {
            clearInterval(countdownInterval);
            document.getElementById("countdown").innerHTML = "已开服！";
        }
    };
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
};