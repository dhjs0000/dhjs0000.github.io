document.addEventListener('DOMContentLoaded', () => {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 导航栏滚动效果
    let navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(5px)';
        } else {
            navbar.style.background = 'var(--bg-color)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // 预定义的示例输出
    const exampleOutputs = {
        calculator: [
            "结果：",
            "11"
        ],
        codeblock: [
            "第一行",
            "第二行",
            "第三行"
        ]
    };

    // 添加运行示例按钮的事件监听器
    document.querySelectorAll('.run-example').forEach(button => {
        button.addEventListener('click', function() {
            const exampleId = this.dataset.example;
            const outputDiv = document.getElementById(`${exampleId}-output`);
            outputDiv.innerHTML = ''; // 清空之前的输出
            
            // 显示输出区域
            outputDiv.classList.add('show');
            
            // 模拟运行效果
            let i = 0;
            const outputs = exampleOutputs[exampleId];
            
            function printNextLine() {
                if (i < outputs.length) {
                    const line = document.createElement('div');
                    line.textContent = outputs[i];
                    outputDiv.appendChild(line);
                    i++;
                    setTimeout(printNextLine, 500); // 每500ms输出一行
                }
            }
            
            printNextLine();
        });
    });
}); 