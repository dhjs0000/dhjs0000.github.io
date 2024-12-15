// 表单验证和提交处理
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorMessages = document.querySelectorAll('.error-message');

// 清除错误消息
function clearErrors() {
    errorMessages.forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
}

// 显示错误消息
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// 验证邮箱格式
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// 处理登录表单提交
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // 验证邮箱
    if (!validateEmail(email)) {
        showError('loginEmailError', '请输入有效的邮箱地址');
        return;
    }

    // 验证密码
    if (password.length < 6) {
        showError('loginPasswordError', '密码至少需要6个字符');
        return;
    }

    try {
        const response = await ApiService.login({ email, password });
        
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // 登录成功后重定向到首页
        window.location.href = '/';
    } catch (error) {
        showError('loginPasswordError', error.message);
    }
});

// 处理注册表单提交
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // 验证用户名
    if (username.length < 3) {
        showError('registerUsernameError', '用户名至少需要3个字符');
        return;
    }

    // 验证邮箱
    if (!validateEmail(email)) {
        showError('registerEmailError', '请输入有效的邮箱地址');
        return;
    }

    // 验证密码
    if (password.length < 6) {
        showError('registerPasswordError', '密码至少需要6个字符');
        return;
    }

    // 验证确认密码
    if (password !== confirmPassword) {
        showError('confirmPasswordError', '两次输入的密码不一致');
        return;
    }

    try {
        const response = await ApiService.register({
            username,
            email,
            password
        });
        
        // 保存token和用户信息
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // 注册成功后重定向到首页
        window.location.href = '/';
    } catch (error) {
        showError('registerPasswordError', error.message);
    }
});

// 切换登录/注册表单
const tabs = document.querySelectorAll('.auth-tab');
const forms = document.querySelectorAll('.auth-form');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        clearErrors();
        const target = tab.dataset.tab;
        
        // 更新标签状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 更新表单显示
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${target}Form`) {
                form.classList.add('active');
            }
        });
    });
}); 