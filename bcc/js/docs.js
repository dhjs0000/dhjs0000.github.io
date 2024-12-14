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