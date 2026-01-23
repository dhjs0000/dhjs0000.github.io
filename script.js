// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', async function() {
    // 加载导航栏
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        try {
            // 获取当前页面相对于根目录的路径级别
            const pathDepth = window.location.pathname.split('/').length - 2;
            const navPath = pathDepth > 0 ? '../'.repeat(pathDepth) + 'nav.html' : 'nav.html';
            
            const response = await fetch(navPath);
            const content = await response.text();
            
            // 根据页面深度调整导航链接
            let modifiedContent = content;
            if (pathDepth > 0) {
                const prefix = '../'.repeat(pathDepth);
                modifiedContent = content.replace(/href="([^"]+\.html)"/g, (match, p1) => {
                    if (!p1.startsWith('http')) {
                        return `href="${prefix}${p1}"`;
                    }
                    return match;
                });
            }
            
            navPlaceholder.innerHTML = modifiedContent;
            
            // 设置当前页面的导航链接为激活状态
            const currentPage = window.location.pathname.split('/').pop() || 'home.html';
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.endsWith(currentPage)) {
                    link.classList.add('active');
                }
            });
        } catch (error) {
            console.error('加载导航栏失败:', error);
        }
    }

    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // 移动端项目下拉菜单切换
    const projectDropdown = document.querySelector('.project-dropdown');
    if (projectDropdown) {
        const projectLink = projectDropdown.querySelector('a');
        projectLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                projectDropdown.classList.toggle('active');
            }
        });
    }

    // 主题切换
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // 从 localStorage 获取保存的主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        if (themeToggle && savedTheme === 'dark-theme') {
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

    // 加载鸣谢名单
    loadAcknowledgments();
});

// 加载鸣谢名单函数
async function loadAcknowledgments() {
    const sponsorThanks = document.getElementById('sponsor-thanks');
    const specialThanks = document.getElementById('special-thanks');
    
    if (!sponsorThanks && !specialThanks) return;
    
    try {
        const response = await fetch('Acknowledgments.json');
        const data = await response.json();
        
        // 处理赞助鸣谢 - 按赞助值从大到小排序
        if (sponsorThanks && data.sponsor) {
            const sortedSponsors = data.sponsor.sort((a, b) => parseInt(b.value) - parseInt(a.value));
            
            if (sortedSponsors.length > 0) {
                const sponsorList = sortedSponsors.map(sponsor =>
                    `<div class="sponsor-name">${sponsor.name}</div>`
                ).join('');
                
                sponsorThanks.innerHTML = `
                    <p>特别感谢以下在爱发电赞助我们的朋友们：</p>
                    <div class="sponsor-list">${sponsorList}</div>
                `;
            } else {
                sponsorThanks.innerHTML = '<p>暂无赞助信息</p>';
            }
        }
        
        // 处理特别鸣谢
        if (specialThanks && data.special) {
            if (data.special.length > 0) {
                const specialList = data.special.map(name =>
                    `<div class="special-name">${name}</div>`
                ).join('');
                
                specialThanks.innerHTML = `
                    <p>感谢所有支持和帮助过Ethernos Studio的朋友们：</p>
                    <div class="special-list">${specialList}</div>
                `;
            } else {
                specialThanks.innerHTML = '<p>暂无特别鸣谢信息</p>';
            }
        }
        
    } catch (error) {
        console.error('加载鸣谢名单失败:', error);
        if (sponsorThanks) sponsorThanks.innerHTML = '<p>加载赞助名单失败</p>';
        if (specialThanks) specialThanks.innerHTML = '<p>加载特别鸣谢名单失败</p>';
    }
}

// 新增倒计时功能
window.onload = function() {
    const countDownDate = new Date("2026-05-01").getTime();
    const countdownElement = document.getElementById("countdown");
    
    // 只有当countdown元素存在时，才执行倒计时功能
    if (countdownElement) {
        const updateCountdown = function() {
            const now = new Date().getTime();
            const timeLeft = countDownDate - now;
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            countdownElement.innerHTML = 
                `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
            
            if(timeLeft < 0) {
                clearInterval(countdownInterval);
                countdownElement.innerHTML = "已开服！";
            }
        };
        
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
    }
};