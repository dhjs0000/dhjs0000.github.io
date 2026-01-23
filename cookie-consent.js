/**
 * Cookie同意管理系统
 * 处理用户隐私设置和Clarity consentv2 API集成
 */

class CookieConsentManager {
    constructor() {
        this.consentKey = 'ethernos-cookie-consent';
        this.consentVersion = 'v1.0';
        this.modal = null;
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupConsent());
        } else {
            this.setupConsent();
        }
    }

    setupConsent() {
        // 检查是否已经存在同意记录
        const existingConsent = this.getStoredConsent();
        
        if (existingConsent) {
            // 应用已存储的同意设置
            this.applyConsent(existingConsent);
        } else {
            // 显示同意弹窗
            this.showConsentModal();
        }
    }

    getStoredConsent() {
        try {
            const stored = localStorage.getItem(this.consentKey);
            if (stored) {
                const consent = JSON.parse(stored);
                // 检查版本是否匹配
                if (consent.version === this.consentVersion) {
                    return consent;
                }
            }
        } catch (error) {
            console.warn('读取存储的同意设置失败:', error);
        }
        return null;
    }

    storeConsent(consentType) {
        try {
            const consentData = {
                type: consentType,
                version: this.consentVersion,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.consentKey, JSON.stringify(consentData));
            return true;
        } catch (error) {
            console.warn('存储同意设置失败:', error);
            return false;
        }
    }

    showConsentModal() {
        // 创建或获取弹窗元素
        this.createModal();
        
        // 显示弹窗
        this.modal.classList.add('show');
        
        // 绑定事件
        this.bindModalEvents();
        
        // 防止页面滚动
        document.body.style.overflow = 'hidden';
    }

    hideConsentModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    createModal() {
        // 如果已经存在则返回
        if (document.getElementById('cookie-consent-modal')) {
            this.modal = document.getElementById('cookie-consent-modal');
            return;
        }

        // 加载弹窗HTML
        this.loadModalHTML();
    }

    loadModalHTML() {
        // 创建弹窗容器
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = `
            <!-- Cookie同意弹窗 -->
            <div id="cookie-consent-modal" class="cookie-consent-modal">
                <div class="cookie-consent-content">
                    <div class="cookie-consent-header">
                        <h3>隐私设置</h3>
                    </div>
                    <div class="cookie-consent-body">
                        <p class="consent-message">
                            我们通过使用 Microsoft Clarity 来了解您如何使用我们的网站来改进我们的产品和广告。
                        </p>
                        <div class="clarity-explanation">
                        <p>Microsoft Clarity是一个网站分析工具，帮助我们了解用户如何与网站交互。它会：</p>
                        <ul>
                            <li>记录用户的点击、滚动和页面浏览行为</li>
                            <li>生成热力图，显示网站上最受关注的区域</li>
                            <li>记录会话回放（不包含密码等敏感信息）</li>
                            <li>帮助我们优化网站布局和用户体验</li>
                        </ul>
                        <p>所有收集的数据都是匿名的，不会包含您的个人信息。</p>
                    </div>
                        <div class="consent-options">
                            <div class="consent-option">
                                <input type="radio" id="consent-full" name="cookie-consent" value="full">
                                <label for="consent-full">
                                    <strong>全部数据</strong>
                                    <span class="option-description">开启Cookie收集功能和Microsoft Clarity，提供完整信息</span>
                                </label>
                            </div>
                            <div class="consent-option">
                                <input type="radio" id="consent-partial" name="cookie-consent" value="partial">
                                <label for="consent-partial">
                                    <strong>部分数据</strong>
                                    <span class="option-description">不开启Cookie收集功能，但开启Microsoft Clarity</span>
                                </label>
                            </div>
                            <div class="consent-option">
                                <input type="radio" id="consent-none" name="cookie-consent" value="none">
                                <label for="consent-none">
                                    <strong>我不想提供</strong>
                                    <span class="option-description">不提供任何数据，使用基本功能</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-consent-footer">
                        <button id="consent-save" class="consent-btn consent-save" disabled>保存设置</button>
                        <button id="consent-accept-all" class="consent-btn consent-accept-all">接受全部</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer.firstElementChild);
        this.modal = document.getElementById('cookie-consent-modal');
    }

    bindModalEvents() {
        const radioButtons = this.modal.querySelectorAll('input[name="cookie-consent"]');
        const saveButton = this.modal.querySelector('#consent-save');
        const acceptAllButton = this.modal.querySelector('#consent-accept-all');

        // 单选按钮变化事件
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                saveButton.disabled = false;
            });
        });

        // 保存设置按钮
        saveButton.addEventListener('click', () => {
            const selectedConsent = this.modal.querySelector('input[name="cookie-consent"]:checked');
            if (selectedConsent) {
                this.handleConsent(selectedConsent.value);
            }
        });

        // 接受全部按钮
        acceptAllButton.addEventListener('click', () => {
            this.handleConsent('full');
        });
    }

    handleConsent(consentType) {
        // 存储用户选择
        this.storeConsent(consentType);
        
        // 应用同意设置
        this.applyConsent({ type: consentType });
        
        // 隐藏弹窗
        this.hideConsentModal();
    }

    applyConsent(consent) {
        const { type } = consent;
        
        switch (type) {
            case 'full':
                // 全部数据：开启Cookie和Clarity
                this.enableFullTracking();
                break;
            case 'partial':
                // 部分数据：仅开启Clarity，不开启Cookie
                this.enablePartialTracking();
                break;
            case 'none':
                // 我不想提供：不开启Clarity
                this.disableTracking();
                break;
            default:
                // 默认：不开启任何跟踪
                this.disableTracking();
        }
    }

    enableFullTracking() {
        // 初始化Clarity（首次加载时）
        this.initializeClarity();
        
        // 设置Clarity consentv2 - 完全同意
        if (window.clarity) {
            window.clarity('consentv2', {
                ad_Storage: "granted",
                analytics_Storage: "granted"
            });
            console.log('Clarity: 完全跟踪模式已启用');
        }
        
        // 可以在这里添加其他需要Cookie的服务初始化
        this.initializeCookieServices();
    }

    enablePartialTracking() {
        // 初始化Clarity（首次加载时）
        this.initializeClarity();
        
        // 设置Clarity consentv2 - 仅分析存储同意
        if (window.clarity) {
            window.clarity('consentv2', {
                ad_Storage: "denied",
                analytics_Storage: "granted"
            });
            console.log('Clarity: 部分跟踪模式已启用（仅分析）');
        }
        
        // 不初始化需要Cookie的服务
        console.log('Cookie服务: 未启用');
    }

    disableTracking() {
        // 不初始化Clarity，保持完全无跟踪状态
        console.log('Clarity: 未启用（用户选择不提供数据）');
        console.log('Cookie服务: 未启用');
    }

    initializeClarity() {
        // 动态加载Clarity脚本
        if (!window.clarity && (this.getCurrentConsent()?.type === 'full' || this.getCurrentConsent()?.type === 'partial')) {
            console.log('正在动态加载Clarity...');
            
            // 创建Clarity脚本标签
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://www.clarity.ms/tag/pe969al7w9';
            
            // 初始化Clarity函数
            window.clarity = window.clarity || function() {
                (window.clarity.q = window.clarity.q || []).push(arguments);
            };
            
            // 添加脚本到页面
            document.head.appendChild(script);
            
            console.log('Clarity脚本已动态加载');
        }
    }

    initializeCookieServices() {
        // 这里可以添加需要Cookie的服务初始化代码
        console.log('Cookie服务: 已启用');
    }

    // 公共方法：获取当前同意状态
    getCurrentConsent() {
        return this.getStoredConsent();
    }

    // 公共方法：重新显示同意弹窗（用于设置页面等）
    showConsentSettings() {
        this.showConsentModal();
    }

    // 公共方法：撤销同意
    revokeConsent() {
        localStorage.removeItem(this.consentKey);
        
        // 重置Clarity到无同意状态
        if (window.clarity) {
            window.clarity('consentv2', {
                ad_Storage: "denied",
                analytics_Storage: "denied"
            });
        }
        
        console.log('同意已撤销');
    }
}

// 初始化Cookie同意管理器
let cookieConsentManager;

// 全局初始化函数
function initializeCookieConsent() {
    if (!cookieConsentManager) {
        cookieConsentManager = new CookieConsentManager();
    }
    return cookieConsentManager;
}

// 自动初始化（如果不需要手动控制）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCookieConsent);
} else {
    initializeCookieConsent();
}

// 暴露全局方法供页面调用
window.CookieConsent = {
    init: initializeCookieConsent,
    getManager: () => cookieConsentManager,
    showSettings: () => {
        if (cookieConsentManager) {
            cookieConsentManager.showConsentSettings();
        }
    },
    revoke: () => {
        if (cookieConsentManager) {
            cookieConsentManager.revokeConsent();
        }
    }
};