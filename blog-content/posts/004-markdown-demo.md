---
title: Markdown 高级语法演示
date: 2026-01-30
category: 技术文档
author: dhjs0000
tags: ["Markdown", "教程", "LaTeX"]
excerpt: 展示博客系统支持的各种高级Markdown语法，包括LaTeX公式、警示框、任务列表等。
blog_number: 4
---

> 本文档演示博客系统支持的各种高级 Markdown 语法特性。

## LaTeX 数学公式

### 行内公式

欧拉公式被誉为数学中最美丽的公式之一：$e^{i\pi} + 1 = 0$

二次方程求根公式：$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

### 块级公式

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

矩阵示例：

$$
A = \begin{bmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{bmatrix}
$$

## 警示框

::: info
这是一个信息框，用于提供一般性的信息说明。
:::

::: tip
这是一个提示框，用于给出有用的建议或技巧。
:::

::: note
这是一个注意框，用于强调重要的信息。
:::

::: warning
这是一个警告框，用于提醒潜在的问题。
:::

::: danger
这是一个危险框，用于警示严重的风险或错误操作。
:::

## 代码高亮

支持多种编程语言的语法高亮：

### Python

```python
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 测试
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### C++

```cpp
#include <iostream>
#include <vector>

template<typename T>
class Stack {
private:
    std::vector<T> elements;
public:
    void push(const T& element) {
        elements.push_back(element);
    }
    T pop() {
        T elem = elements.back();
        elements.pop_back();
        return elem;
    }
};
```

### JavaScript

```javascript
// 异步函数示例
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## 任务列表

项目进度追踪：

- [x] 设计系统架构
- [x] 实现基础功能
- [ ] 编写测试用例
- [ ] 性能优化
- [ ] 文档完善
- [ ] 发布正式版

## 表格

### 对齐方式

| 功能 | 描述 | 状态 | 优先级 |
| :--- | :--- | :---: | ---: |
| Markdown解析 | 支持标准Markdown语法 | ✅ | 高 |
| 代码高亮 | 支持多种编程语言 | ✅ | 高 |
| LaTeX公式 | 数学公式渲染 | ✅ | 中 |
| 任务列表 | 复选框列表 | ✅ | 低 |

## 文本格式

### 高亮标记

这是 ==高亮文本== 的示例。

### 上下标

- 化学公式：H~2~O, CO~2~
- 指数：E = mc^2^, a^2^ + b^2^ = c^2^

### 键盘按键

按下 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制选中的内容。

### 缩写

*[HTML]: HyperText Markup Language
*[CSS]: Cascading Style Sheets

HTML 和 CSS 是构建网页的基础技术。

### 删除线和插入线

这段文字包含 ~~删除的内容~~ 和 ++新增的内容++。

## 脚注

Markdown 支持脚注功能[^1]，可以用来添加参考文献或额外说明[^2]。

[^1]: 这是第一个脚注的内容。
[^2]: 这是第二个脚注，可以包含链接或其他格式。

## 折叠详情

<details>
<summary>点击查看详细配置</summary>

```json
{
  "site": {
    "title": "我的博客",
    "description": "技术分享"
  },
  "posts": []
}
```

更多配置选项请参考文档。

</details>

## 定义列表

术语 1
:   这是术语 1 的定义说明。

术语 2
:   这是术语 2 的定义说明。
:   术语 2 可以有多个定义。

## 引用块

> 这是普通的引用块。
>
> 可以包含多个段落。

嵌套引用：

> 外层引用
>> 内层引用
> 
> 回到外层

## 表情符号

支持标准的 Emoji：🎉 🚀 💻 ✨ 🌟 🔥

## 链接和图片

### 自动链接

访问 https://github.com/dhjs0000 获取更多信息。

### 图片

![示例图片](https://via.placeholder.com/600x300/7881ff/ffffff?text=Blog+Demo)

## 水平线

---

* * *

___

## 结语

以上就是博客系统支持的主要 Markdown 高级语法特性。系统会不断更新以支持更多功能。
