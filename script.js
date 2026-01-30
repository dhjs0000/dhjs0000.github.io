// 浏览器版本检测和兼容模式提示
function detectBrowser() {
    const userAgent = navigator.userAgent;
    const isIE = userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1;
    
    if (isIE) {
        let version = 0;
        
        // IE 11+
        if (userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:") > -1) {
            version = parseInt(userAgent.substring(userAgent.indexOf("rv:") + 3, userAgent.indexOf(".", userAgent.indexOf("rv:") + 3)));
        }
        // IE 10及以下
        else if (userAgent.indexOf("MSIE") > -1) {
            version = parseInt(userAgent.substring(userAgent.indexOf("MSIE") + 5, userAgent.indexOf(".", userAgent.indexOf("MSIE") + 5)));
        }
        
        return {
            isIE: true,
            version: version,
            isOldIE: version <= 8
        };
    }
    
    return {
        isIE: false,
        version: null,
        isOldIE: false
    };
}

// 显示兼容模式提示弹窗
function showCompatibilityModal() {
    // 检查是否已经提示过
    if (localStorage.getItem('compatibility-modal-shown')) {
        return;
    }
    
    // 创建弹窗HTML
    const modalHTML = `
        <div id="compatibility-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                text-align: center;
            ">
                <h2 style="color: #d32f2f; margin-bottom: 20px;">浏览器版本过低</h2>
                <p style="margin-bottom: 20px; line-height: 1.6;">
                    检测到您正在使用较旧版本的Internet Explorer浏览器（IE6-8），
                    这可能会影响网站的正常显示和功能使用。
                </p>
                <p style="margin-bottom: 25px; line-height: 1.6;">
                    建议您：
                </p>
                <div style="margin-bottom: 25px;">
                    <button id="compatibility-yes" style="
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        margin: 0 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">进入兼容模式</button>
                    <button id="compatibility-no" style="
                        background-color: #f44336;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        margin: 0 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">继续使用</button>
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 15px;">
                    兼容模式专门为Windows XP系统和IE6-8浏览器优化
                </p>
            </div>
        </div>
    `;
    
    // 添加弹窗到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 绑定按钮事件
    document.getElementById('compatibility-yes').addEventListener('click', function() {
        // 跳转到兼容模式网站
        window.location.href = '/compatible/index.html';
    });
    
    document.getElementById('compatibility-no').addEventListener('click', function() {
        // 关闭弹窗并记录已显示
        document.getElementById('compatibility-modal').remove();
        localStorage.setItem('compatibility-modal-shown', 'true');
    });
}

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
                modifiedContent = content.replace(/href="([^"])"/g, (match, p1) => {
                    if (!p1.startsWith('http')) {
                        return `href="${prefix}${p1}"`;
                    }
                    return match;
                });
            }
            
            navPlaceholder.innerHTML = modifiedContent;
            
            // 设置当前页面的导航链接为激活状态
            const currentPage = window.location.pathname.split('/').pop() || 'home';
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
    
    // 项目下拉菜单切换（所有设备）
    const projectDropdown = document.querySelector('.project-dropdown');
    const projectDropdownToggle = document.getElementById('projectDropdownToggle');
    
    if (projectDropdown && projectDropdownToggle) {
        projectDropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            projectDropdown.classList.toggle('active');
        });
        
        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!projectDropdown.contains(e.target)) {
                projectDropdown.classList.remove('active');
            }
        });
        
        // 点击下拉菜单内的链接后关闭菜单
        const dropdownLinks = projectDropdown.querySelectorAll('.dropdown-content a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                projectDropdown.classList.remove('active');
            });
        });
    }

    // 主题切换
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // 从 localStorage 获取保存的主题
    const savedTheme = localStorage.getItem('data-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // 默认使用深色主题
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // 更新主题切换按钮状态
    function updateThemeToggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (themeToggle) {
            if (currentTheme === 'light') {
                themeToggle.classList.add('light');
            } else {
                themeToggle.classList.remove('light');
            }
        }
    }
    updateThemeToggle();
    
    // 主题切换按钮点击事件
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('data-theme', newTheme);
            updateThemeToggle();
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
