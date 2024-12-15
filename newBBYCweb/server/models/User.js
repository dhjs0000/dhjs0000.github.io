const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '请输入用户名'],
        unique: true,
        trim: true,
        minlength: [3, '用户名至少需要3个字符'],
        maxlength: [20, '用户名不能超过20个字符']
    },
    email: {
        type: String,
        required: [true, '请输入邮箱'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, '请输入有效的邮箱地址']
    },
    password: {
        type: String,
        required: [true, '请输入密码'],
        minlength: [6, '密码至少需要6个字符'],
        select: false
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        maxlength: [200, '个人简介不能超过200个字符']
    },
    github: String,
    website: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 密码加密
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 生成JWT Token
userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// 验证密码
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 