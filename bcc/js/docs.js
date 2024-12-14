// 复制代码功能
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    
    // 移除多余的空行和缩进
    const formattedCode = code.trim().split('\n')
        .map(line => line.trimRight())
        .join('\n');
    
    navigator.clipboard.writeText(formattedCode).then(() => {
        const originalText = button.textContent;
        button.textContent = '已复制!';
        button.style.background = 'rgba(74, 222, 128, 0.2)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'rgba(255,255,255,0.1)';
        }, 2000);
    });
}

// 搜索功能
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const menuSections = document.querySelectorAll('.menu-section');
    
    menuSections.forEach(section => {
        const items = section.querySelectorAll('a');
        let hasVisibleItems = false;
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            item.parentElement.style.display = matches ? 'block' : 'none';
            if (matches) hasVisibleItems = true;
        });
        
        section.style.display = hasVisibleItems ? 'block' : 'none';
    });
    
    // 如果搜索框为空，显示所有内容
    if (!searchTerm) {
        document.querySelectorAll('.menu-section, .menu-section li').forEach(el => {
            el.style.display = 'block';
        });
    }
}); 

// 添加代码块动画效果
document.querySelectorAll('.code-block').forEach(block => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                block.classList.add('code-animate');
                observer.unobserve(block);
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(block);
});

// 添加平滑滚动进度条
const createProgressBar = () => {
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    document.body.appendChild(bar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (winScroll / height) * 100;
        bar.style.width = scrolled + '%';
    });
};

createProgressBar();

// 添加目录项动画
document.querySelectorAll('.menu-section a').forEach((link, index) => {
    link.style.animationDelay = `${index * 0.1}s`;
    link.classList.add('menu-item-animate');
});

// 添加搜索框动画效果
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('focus', () => {
    searchContainer.classList.add('search-focus');
});

searchInput.addEventListener('blur', () => {
    searchContainer.classList.remove('search-focus');
});

// 添加代码高亮动画
document.querySelectorAll('pre code').forEach(block => {
    block.innerHTML = block.innerHTML
        .split('\n')
        .map((line, index) => 
            `<span class="code-line" style="animation-delay: ${index * 0.1}s">${line}</span>`
        )
        .join('\n');
});

// 添加笔记卡片悬停效果
document.querySelectorAll('.note').forEach(note => {
    note.addEventListener('mousemove', (e) => {
        const rect = note.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        note.style.setProperty('--mouse-x', `${x}px`);
        note.style.setProperty('--mouse-y', `${y}px`);
    });
});