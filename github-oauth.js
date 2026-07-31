/**
 * GitHub OAuth 2.0 with PKCE 客户端库
 * 
 * 使用方法:
 *   1. 在 HTML 中引入: <script src="config.js"></script> <script src="github-oauth.js"></script>
 *   2. 调用 GitHubAuth.login() 发起登录
 *   3. 在回调页面 (auth-callback.html) 调用 GitHubAuth.handleCallback() 处理授权码
 *   4. 使用 GitHubAuth.getUser() 获取已登录用户信息
 * 
 * 注意: 由于 GitHub token endpoint 不支持 CORS，需要一个 serverless proxy 来交换 token
 * 
 * ============================================================
 * Proxy 实现示例 (Cloudflare Worker) - 完整版本
 * ============================================================
 * 
 * // wrangler.toml 配置示例
 * // name = "github-oauth-proxy"
 * // main = "src/index.js"
 * // compatibility_date = "2024-01-01"
 * 
 * export default {
 *   async fetch(request) {
 *     // 处理 CORS Preflight (OPTIONS) 请求
 *     if (request.method === 'OPTIONS') {
 *       return new Response(null, {
 *         headers: {
 *           'Access-Control-Allow-Origin': '*',
 *           'Access-Control-Allow-Methods': 'POST, OPTIONS',
 *           'Access-Control-Allow-Headers': 'Content-Type, Accept',
 *           'Access-Control-Max-Age': '86400'  // 缓存 24 小时
 *         }
 *       });
 *     }
 * 
 *     if (request.method !== 'POST') {
 *       return new Response('Method not allowed', { 
 *         status: 405,
 *         headers: {
 *           'Access-Control-Allow-Origin': '*'
 *         }
 *       });
 *     }
 * 
 *     try {
 *       const { code, code_verifier, client_id } = await request.json();
 *       
 *       // 验证必要参数
 *       if (!code || !code_verifier || !client_id) {
 *         return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
 *           status: 400,
 *           headers: {
 *             'Content-Type': 'application/json',
 *             'Access-Control-Allow-Origin': '*'
 *           }
 *         });
 *       }
 *       
 *       const response = await fetch('https://github.com/login/oauth/access_token', {
 *         method: 'POST',
 *         headers: {
 *           'Content-Type': 'application/json',
 *           'Accept': 'application/json'
 *         },
 *         body: JSON.stringify({
 *           client_id,
 *           code,
 *           code_verifier
 *         })
 *       });
 *       
 *       const data = await response.json();
 *       return new Response(JSON.stringify(data), {
 *         headers: {
 *           'Content-Type': 'application/json',
 *           'Access-Control-Allow-Origin': '*'
 *         }
 *       });
 *     } catch (error) {
 *       return new Response(JSON.stringify({ error: 'Internal server error' }), {
 *         status: 500,
 *         headers: {
 *           'Content-Type': 'application/json',
 *           'Access-Control-Allow-Origin': '*'
 *         }
 *       });
 *     }
 *   }
 * };
 * 
 * ============================================================
 * 部署步骤:
 * ============================================================
 * 1. 安装 Wrangler CLI: npm install -g wrangler
 * 2. 登录 Cloudflare: wrangler login
 * 3. 创建目录: mkdir -p github-oauth-proxy/src
 * 4. 创建 wrangler.toml 和 src/index.js (使用上面的代码)
 * 5. 部署: wrangler deploy
 * 6. 复制生成的 URL 到 config.js 的 proxyUrl 字段
 * 
 * 注意: GitHub OAuth App 的 token 通常不会过期 (没有 expires_in)
 *       如果使用 GitHub App (非 OAuth App)，可能需要 client_secret
 * 
 * 替代方案: 也可以使用 Vercel Edge Functions 或 Netlify Functions
 */

var GitHubAuth = (function() {
    'use strict';

    // 常量
    var GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
    var GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
    var GITHUB_USER_URL = 'https://api.github.com/user';
    var GITHUB_EMAIL_URL = 'https://api.github.com/user/emails';

    /**
     * 生成随机字符串
     * @param {number} length - 字符串长度
     * @returns {string} 随机字符串
     */
    function generateRandomString(length) {
        var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        
        if (window.crypto && window.crypto.getRandomValues) {
            var array = new Uint32Array(length);
            window.crypto.getRandomValues(array);
            for (var i = 0; i < length; i++) {
                result += charset.charAt(array[i] % charset.length);
            }
        } else {
            // 降级方案
            for (var j = 0; j < length; j++) {
                result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
        }
        
        return result;
    }

    /**
     * Base64URL 编码
     * @param {ArrayBuffer} buffer - 二进制数据
     * @returns {string} Base64URL 编码的字符串
     */
    function base64URLEncode(buffer) {
        var bytes = new Uint8Array(buffer);
        var binary = '';
        for (var i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        var base64 = btoa(binary);
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * 生成 PKCE 的 code_challenge
     * @param {string} codeVerifier - code_verifier
     * @returns {Promise<string>} code_challenge
     */
    function generateCodeChallenge(codeVerifier) {
        return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
            .then(function(digest) {
                return base64URLEncode(digest);
            });
    }

    /**
     * 构建授权 URL
     * @param {string} state - CSRF token
     * @param {string} codeChallenge - PKCE code_challenge
     * @returns {string} GitHub 授权 URL
     */
    function buildAuthUrl(state, codeChallenge) {
        var params = new URLSearchParams();
        params.set('client_id', config.githubOAuth.clientId);
        params.set('redirect_uri', config.githubOAuth.redirectUri);
        params.set('scope', config.githubOAuth.scope);
        params.set('state', state);
        params.set('code_challenge', codeChallenge);
        params.set('code_challenge_method', 'S256');
        params.set('response_type', 'code');
        
        return GITHUB_AUTH_URL + '?' + params.toString();
    }

    /**
     * 发起 GitHub OAuth 登录
     */
    function login() {
        // 生成 PKCE 参数
        var codeVerifier = generateRandomString(64);
        var state = generateRandomString(32);
        
        // 保存到 localStorage 用于后续验证
        var pendingAuth = {
            codeVerifier: codeVerifier,
            state: state,
            timestamp: Date.now()
        };
        localStorage.setItem(config.storageKeys.pendingAuth, JSON.stringify(pendingAuth));
        
        // 生成 code_challenge 并重定向
        generateCodeChallenge(codeVerifier)
            .then(function(codeChallenge) {
                var authUrl = buildAuthUrl(state, codeChallenge);
                window.location.href = authUrl;
            })
            .catch(function(error) {
                console.error('Failed to generate code challenge:', error);
                alert('登录失败: 无法生成安全参数');
            });
    }

    /**
     * 通过 Proxy 交换 token
     * @param {string} code - 授权码
     * @param {string} codeVerifier - PKCE code_verifier
     * @returns {Promise<object>} token 数据
     */
    function exchangeToken(code, codeVerifier) {
        return fetch(config.githubOAuth.proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                code_verifier: codeVerifier,
                client_id: config.githubOAuth.clientId,
                redirect_uri: config.githubOAuth.redirectUri
            })
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Token exchange failed: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            if (data.error) {
                throw new Error(data.error_description || data.error);
            }
            return data;
        });
    }

    /**
     * 获取用户信息
     * @param {string} accessToken - 访问令牌
     * @returns {Promise<object>} 用户信息
     */
    function fetchUser(accessToken) {
        var headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': 'Bearer ' + accessToken
        };
        
        return fetch(GITHUB_USER_URL, { headers: headers })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch user: ' + response.status);
                }
                return response.json();
            });
    }

    /**
     * 获取用户邮箱
     * @param {string} accessToken - 访问令牌
     * @returns {Promise<Array>} 邮箱列表
     */
    function fetchUserEmails(accessToken) {
        var headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': 'Bearer ' + accessToken
        };
        
        return fetch(GITHUB_EMAIL_URL, { headers: headers })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch emails: ' + response.status);
                }
                return response.json();
            });
    }

    /**
     * 保存认证信息到 localStorage
     * @param {object} authData - 认证数据
     */
    function saveAuth(authData) {
        // GitHub OAuth App 的 token 通常不会过期 (没有 expires_in)
        // 如果有 expires_in 则使用它，否则默认 30 天
        var expiresIn = authData.expires_in;
        var expiryMs;
        
        if (expiresIn) {
            expiryMs = expiresIn * 1000;
        } else {
            // 默认 30 天 (GitHub OAuth App tokens 通常长期有效)
            expiryMs = 30 * 24 * 60 * 60 * 1000;
        }
        
        var expiryTime = Date.now() + expiryMs;
        
        localStorage.setItem(config.storageKeys.auth, JSON.stringify({
            accessToken: authData.access_token,
            tokenType: authData.token_type,
            scope: authData.scope,
            createdAt: Date.now(),
            expiresIn: expiresIn || null
        }));
        
        localStorage.setItem(config.storageKeys.authExpiry, expiryTime.toString());
    }

    /**
     * 处理 OAuth 回调
     * @param {object} params - URL 参数 {code, state}
     * @returns {Promise<object>} 认证结果 {success, user, error}
     */
    function handleCallback(params) {
        return new Promise(function(resolve, reject) {
            // 检查错误
            if (params.error) {
                reject(new Error(params.error_description || params.error));
                return;
            }
            
            // 验证参数
            if (!params.code) {
                reject(new Error('Missing authorization code'));
                return;
            }
            
            // 获取保存的 pending auth
            var pendingAuthStr = localStorage.getItem(config.storageKeys.pendingAuth);
            if (!pendingAuthStr) {
                reject(new Error('No pending authentication found'));
                return;
            }
            
            var pendingAuth;
            try {
                pendingAuth = JSON.parse(pendingAuthStr);
            } catch (e) {
                reject(new Error('Invalid pending auth data'));
                return;
            }
            
            // 验证 state (CSRF 防护)
            if (pendingAuth.state !== params.state) {
                reject(new Error('State mismatch: possible CSRF attack'));
                return;
            }
            
            // 检查是否过期 (5 分钟超时)
            if (Date.now() - pendingAuth.timestamp > 5 * 60 * 1000) {
                reject(new Error('Authentication request expired'));
                return;
            }
            
            // 清除 pending auth
            localStorage.removeItem(config.storageKeys.pendingAuth);
            
            // 交换 token
            exchangeToken(params.code, pendingAuth.codeVerifier)
                .then(function(tokenData) {
                    // 保存认证信息
                    saveAuth(tokenData);
                    
                    // 获取用户信息
                    return fetchUser(tokenData.access_token)
                        .then(function(userData) {
                            // 尝试获取邮箱
                            return fetchUserEmails(tokenData.access_token)
                                .then(function(emails) {
                                    var primaryEmail = null;
                                    for (var i = 0; i < emails.length; i++) {
                                        if (emails[i].primary) {
                                            primaryEmail = emails[i].email;
                                            break;
                                        }
                                    }
                                    if (!primaryEmail && emails.length > 0) {
                                        primaryEmail = emails[0].email;
                                    }
                                    
                                    var user = {
                                        id: userData.id,
                                        login: userData.login,
                                        name: userData.name,
                                        avatarUrl: userData.avatar_url,
                                        email: primaryEmail,
                                        bio: userData.bio,
                                        url: userData.html_url,
                                        company: userData.company,
                                        location: userData.location,
                                        followers: userData.followers,
                                        following: userData.following
                                    };
                                    
                                    resolve({
                                        success: true,
                                        user: user,
                                        accessToken: tokenData.access_token
                                    });
                                })
                                .catch(function() {
                                    // 如果获取邮箱失败，仍然返回用户信息
                                    var user = {
                                        id: userData.id,
                                        login: userData.login,
                                        name: userData.name,
                                        avatarUrl: userData.avatar_url,
                                        email: null,
                                        bio: userData.bio,
                                        url: userData.html_url,
                                        company: userData.company,
                                        location: userData.location,
                                        followers: userData.followers,
                                        following: userData.following
                                    };
                                    
                                    resolve({
                                        success: true,
                                        user: user,
                                        accessToken: tokenData.access_token
                                    });
                                });
                        });
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    }

    /**
     * 检查是否已登录
     * @returns {boolean} 是否已登录
     */
    function isLoggedIn() {
        var authStr = localStorage.getItem(config.storageKeys.auth);
        var expiryStr = localStorage.getItem(config.storageKeys.authExpiry);
        
        if (!authStr || !expiryStr) {
            return false;
        }
        
        var expiryTime = parseInt(expiryStr, 10);
        return Date.now() < expiryTime;
    }

    /**
     * 获取已保存的认证信息
     * @returns {object|null} 认证信息或 null
     */
    function getAuth() {
        if (!isLoggedIn()) {
            return null;
        }
        
        try {
            var authStr = localStorage.getItem(config.storageKeys.auth);
            return JSON.parse(authStr);
        } catch (e) {
            return null;
        }
    }

    /**
     * 获取已登录用户信息
     * @returns {Promise<object|null>} 用户信息或 null
     */
    function getUser() {
        var auth = getAuth();
        if (!auth) {
            return Promise.resolve(null);
        }
        
        return fetchUser(auth.accessToken)
            .then(function(userData) {
                return fetchUserEmails(auth.accessToken)
                    .then(function(emails) {
                        var primaryEmail = null;
                        for (var i = 0; i < emails.length; i++) {
                            if (emails[i].primary) {
                                primaryEmail = emails[i].email;
                                break;
                            }
                        }
                        if (!primaryEmail && emails.length > 0) {
                            primaryEmail = emails[0].email;
                        }
                        
                        return {
                            id: userData.id,
                            login: userData.login,
                            name: userData.name,
                            avatarUrl: userData.avatar_url,
                            email: primaryEmail,
                            bio: userData.bio,
                            url: userData.html_url,
                            company: userData.company,
                            location: userData.location,
                            followers: userData.followers,
                            following: userData.following
                        };
                    })
                    .catch(function() {
                        return {
                            id: userData.id,
                            login: userData.login,
                            name: userData.name,
                            avatarUrl: userData.avatar_url,
                            email: null,
                            bio: userData.bio,
                            url: userData.html_url,
                            company: userData.company,
                            location: userData.location,
                            followers: userData.followers,
                            following: userData.following
                        };
                    });
            })
            .catch(function() {
                // 如果请求失败，清除认证信息
                logout();
                return null;
            });
    }

    /**
     * 登出
     */
    function logout() {
        localStorage.removeItem(config.storageKeys.auth);
        localStorage.removeItem(config.storageKeys.authExpiry);
        localStorage.removeItem(config.storageKeys.pendingAuth);
    }

    /**
     * 解析 URL 查询参数
     * @returns {object} 查询参数
     */
    function getUrlParams() {
        var params = {};
        var search = window.location.search.substring(1);
        var pairs = search.split('&');
        
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            if (pair.length === 2) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
        }
        
        return params;
    }

    // 公开 API
    return {
        login: login,
        handleCallback: handleCallback,
        isLoggedIn: isLoggedIn,
        getAuth: getAuth,
        getUser: getUser,
        logout: logout,
        getUrlParams: getUrlParams
    };
})();
