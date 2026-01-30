---
title: Blender-VMT-Remastered打包问题怎么解决
date: 2025-01-17
category: Blender-VMT-Remastered
author: dhjs0000
tags: ["问题解决", "PyInstaller"]
excerpt: 最近在使用Blender-VMT-Remastered时遇到了一个严重问题：打开打包后的exe文件会导致进程无限复制，造成系统卡死。请帮我们解决这个问题，并将在下一个版本中发布修复。
blog_number: 2
github_issue: 3
---

> 最近在开发Blender-VMT-Remastered时遇到了一个严重问题：打开打包后的exe文件会导致进程无限复制，造成系统卡死。请帮我们解决这个问题，并将在下一个版本中发布修复。如果你也遇到了类似的问题，欢迎在GitHub上提交issue或参与讨论。

## 问题描述

在使用PyInstaller打包Blender-VMT-Remastered后，运行生成的exe文件时出现以下问题：

- 程序启动后会不断创建新的进程
- 进程数量快速增长，导致系统资源耗尽
- 最终造成系统卡死，需要强制重启

## 后续更新

请帮我们解决这个问题，并将在下一个版本中发布修复。如果你也遇到了类似的问题，欢迎在GitHub上提交issue或参与讨论。

- 🐛 [提交Issue](https://github.com/dhjs0000/Blender-VMT-Remastered/issues)
- 💬 [参与讨论](https://github.com/dhjs0000/Blender-VMT-Remastered/discussions)
