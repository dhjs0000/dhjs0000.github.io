/**
 * Ethernos 网站配置
 * 
 * ============================================================
 * GitHub OAuth 2.0 with PKCE 设置指南
 * ============================================================
 * 
 * 步骤 1: 创建 GitHub OAuth App
 *   - 访问 https://github.com/settings/developers
 *   - 点击 "New OAuth App"
 *   - Application name: Ethernos (或你喜欢的名称)
 *   - Homepage URL: https://ethernos.net/ (你的网站地址)
 *   - Authorization callback URL: https://ethernos.net/auth-callback.html
 *   - 点击 "Register application"
 *   - 复制生成的 Client ID (Client Secret 不会用到，因为我们用 PKCE)
 * 
 * 步骤 2: 部署 Serverless Proxy (处理 Token Exchange)
 *   由于 GitHub token endpoint 不支持 CORS，需要一个 proxy:
 *   - 选项 A: Cloudflare Worker (推荐，免费额度充足)
 *   - 选项 B: Vercel Edge Functions
 *   - 选项 C: Netlify Functions
 *   详细代码见 github-oauth.js 文件顶部注释
 * 
 * 步骤 3: 更新下面的配置
 *   - 将 YOUR_GITHUB_CLIENT_ID 替换为你的实际 Client ID
 *   - 将 proxyUrl 替换为你部署的 proxy 地址
 * 
 * 步骤 4: 测试
 *   - 打开设置页面 (Clarity_setting.html)
 *   - 点击 "使用 GitHub 登录"
 *   - 完成授权后应自动跳转回设置页面并显示用户信息
 * 
 * ============================================================
 * 安全提示
 * ============================================================
 * - 不要将 Client Secret 暴露在前端代码中
 * - 使用 PKCE (Proof Key for Code Exchange) 提高安全性
 * - 所有敏感操作都在 proxy 中处理
 */

var config = {
    // GitHub Personal Access Token (已弃用，保留用于其他用途)
    githubToken: 'ghp_YOUR_TOKEN_HERE',
    
    // GitHub OAuth 2.0 with PKCE 配置
    githubOAuth: {
        // 从 https://github.com/settings/developers 获取的 Client ID
        clientId: 'Iv23liAToHUoCaTGWWBL',
        
        // OAuth 回调地址 - 必须与 GitHub 中配置的完全一致
        // 注意：GitHub 要求使用 HTTPS (localhost 除外)
        redirectUri: window.location.origin + '/auth-callback.html',
        
        // 请求的权限范围
        // user:email - 获取你的公开邮箱
        // read:user - 读取你的个人资料
        scope: 'user:email read:user',
        
        // Serverless Proxy 地址
        // 需要部署 Cloudflare Worker / Vercel Function / Netlify Function
        // 详细代码见 github-oauth.js 文件顶部注释
        proxyUrl: 'https://github-oauth-proxy.3110197220.workers.dev'
    },
    
    // 本地存储键名
    storageKeys: {
        // 完整的认证信息 (access_token 等)
        auth: 'ethernos-github-auth',
        // Token 过期时间戳 (毫秒)
        authExpiry: 'ethernos-github-auth-expiry',
        // 临时保存的 pending auth (code_verifier 等，用于回调验证)
        pendingAuth: 'ethernos-pending-auth'
    }
};
