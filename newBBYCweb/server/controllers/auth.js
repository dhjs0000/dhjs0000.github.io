const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册用户
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 检查用户是否已存在
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: '该邮箱已被注册'
            });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                success: false,
                message: '该用户名已被使用'
            });
        }

        // 创建用户
        user = await User.create({
            username,
            email,
            password
        });

        // 生成Token
        const token = user.getSignedJwtToken();

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 验证邮箱和密码是否提供
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '请提供邮箱和密码'
            });
        }

        // 检查用户是否存在
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '邮箱或密码错误'
            });
        }

        // 验证密码
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: '邮箱或密码错误'
            });
        }

        // 更新最后登录时间
        user.lastLogin = Date.now();
        await user.save();

        // 生成Token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// 更新用户信息
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email,
            bio: req.body.bio,
            github: req.body.github,
            website: req.body.website
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
};

// 更新密码
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // 检查当前密码
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: '当前密码错误'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        // 生成新Token
        const token = user.getSignedJwtToken();

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
}; 