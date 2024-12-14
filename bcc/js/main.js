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

    // 添加滚动动画效果
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .step, .example-card');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                element.classList.add('animate-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // 初始检查

    // 添加悬停效果
    document.querySelectorAll('.feature-card, .example-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('card-hover');
        });
    });

    // 添加打字机效果
    const typeWriter = (element, text, speed = 50) => {
        let i = 0;
        element.textContent = '';
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    };

    // 为代码示例添加动态效果
    document.querySelectorAll('.code-example').forEach(example => {
        const code = example.querySelector('code');
        if (code) {
            const originalText = code.textContent;
            code.textContent = '';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typeWriter(code, originalText, 30);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(example);
        }
    });

    // 添加粒子效果背景
    const createParticles = () => {
        const hero = document.querySelector('.hero');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--x', `${Math.random() * 100}%`);
            particle.style.setProperty('--y', `${Math.random() * 100}%`);
            particle.style.setProperty('--duration', `${3 + Math.random() * 7}s`);
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            hero.appendChild(particle);
        }
    };

    createParticles();

    // 创建悬浮光标效果
    const createCursorGlow = () => {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-glow';
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            cursor.style.opacity = '1';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });
    };

    createCursorGlow();
}); 