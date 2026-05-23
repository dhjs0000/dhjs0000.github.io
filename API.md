# Ethernos GomoFast API 文档

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  ...
}
```

### 错误响应
```json
{
  "detail": "错误描述"
}
```

## API 端点

### 1. 服务状态

```http
GET /
```

返回服务基本信息。

**响应示例**:
```json
{
  "service": "Ethernos GomoFast API",
  "version": "1.0.0",
  "status": "running",
  "protocol": "Gomocup"
}
```

---

### 2. 健康检查

```http
GET /health
```

**响应示例**:
```json
{
  "status": "healthy",
  "active_sessions": 5
}
```

---

### 3. 创建会话

```http
POST /sessions
Content-Type: application/json
```

创建新的GomoFast引擎实例并返回会话哈希值。

**请求体**:
```json
{
  "board_size": 15,
  "rule": "freestyle",
  "timeout_turn": 5000,
  "timeout_match": 300000,
  "max_memory": 4096
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| board_size | int | 否 | 15 | 棋盘大小 (5-25) |
| rule | string | 否 | "freestyle" | 规则: freestyle/standard/renju |
| timeout_turn | int | 否 | 5000 | 每步超时时间(毫秒) |
| timeout_match | int | 否 | 300000 | 整局超时时间(毫秒) |
| max_memory | int | 否 | 4096 | 最大内存(MB) |

**响应示例**:
```json
{
  "success": true,
  "session_id": "a1b2c3d4e5f6...",
  "message": "Session created successfully"
}
```

---

### 4. 列出所有会话

```http
GET /sessions
```

**响应示例**:
```json
[
  {
    "session_id": "a1b2c3d4...",
    "board_size": 15,
    "rule": "freestyle",
    "created_at": "2026-05-13T21:30:00",
    "last_activity": "2026-05-13T21:35:00",
    "is_active": true,
    "move_count": 10,
    "position_history": ["7,7", "8,8", "6,6"]
  }
]
```

---

### 5. 获取会话信息

```http
GET /sessions/{session_id}
```

**路径参数**:
- `session_id`: 会话哈希值

**响应示例**:
```json
{
  "session_id": "a1b2c3d4...",
  "board_size": 15,
  "rule": "freestyle",
  "created_at": "2026-05-13T21:30:00",
  "last_activity": "2026-05-13T21:35:00",
  "is_active": true,
  "move_count": 10,
  "position_history": ["7,7", "8,8", "6,6"]
}
```

---

### 6. 删除会话

```http
DELETE /sessions/{session_id}
```

**路径参数**:
- `session_id`: 会话哈希值

**响应示例**:
```json
{
  "success": true,
  "message": "Session destroyed"
}
```

---

### 7. 执行走子

```http
POST /sessions/{session_id}/move
Content-Type: application/json
```

发送走子命令到引擎并获取引擎回应。

**路径参数**:
- `session_id`: 会话哈希值

**请求体**:
```json
{
  "x": 7,
  "y": 7
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| x | int | 是 | X坐标 (0-based, >=0) |
| y | int | 是 | Y坐标 (0-based, >=0) |

> **注意**: 坐标采用 **0-based** 索引。15x15棋盘的中心点为 `7,7`，左上角为 `0,0`。

**响应示例**:
```json
{
  "success": true,
  "move": "7,7",
  "engine_move": "8,8"
}
```

---

### 8. 发送Gomocup命令

```http
POST /sessions/{session_id}/gomocup
Content-Type: application/json
```

发送原始Gomocup协议命令。

**路径参数**:
- `session_id`: 会话哈希值

**请求体**:
```json
{
  "command": "INFO timeout_turn 10000",
  "args": null
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| command | string | 是 | 命令字符串 |
| args | string | 否 | 命令参数 |

**支持的命令**:
- `INFO key value` - 设置引擎参数
- `START size` - 开始新游戏
- `TURN x,y` - 走子
- `BEGIN` - 引擎先行
- `BOARD` - 设置棋盘状态
- `END` - 结束游戏
- `ABOUT` - 获取引擎信息

**响应示例**:
```json
{
  "success": true,
  "output": "8,8\nMESSAGE depth 2-3 ev -428 n 44 nps 44000 tm 0 pv H5 G6",
  "best_move": "8,8",
  "messages": ["depth 2-3 ev -428 n 44 nps 44000 tm 0 pv H5 G6"],
  "thinking_info": {
    "depths": ["2-3"],
    "evaluations": ["-428"],
    "nodes": ["44"],
    "nps": ["44000"],
    "time": ["0"],
    "pv": ["H5 G6"]
  }
}
```

---

### 9. 获取引擎信息

```http
GET /sessions/{session_id}/about
```

执行ABOUT命令获取引擎信息。

**路径参数**:
- `session_id`: 会话哈希值

**响应示例**:
```json
{
  "success": true,
  "info": {
    "name": "Rapfi",
    "version": "2025.1.0",
    "author": "Rapfi Team",
    "country": "CN"
  },
  "raw_output": "name=Rapfi\nversion=2025.1.0\nauthor=Rapfi Team\ncountry=CN"
}
```

---

### 10. 结束会话

```http
POST /sessions/{session_id}/end
```

发送END命令结束游戏会话。

**路径参数**:
- `session_id`: 会话哈希值

**响应示例**:
```json
{
  "success": true,
  "message": "Session ended"
}
```

---

### 11. 获取棋盘状态

```http
GET /sessions/{session_id}/board
```

获取当前棋盘状态。

**路径参数**:
- `session_id`: 会话哈希值

**响应示例**:
```json
{
  "session_id": "a1b2c3d4...",
  "board_size": 15,
  "moves": [
    {"x": 7, "y": 7, "player": 1},
    {"x": 8, "y": 8, "player": 2},
    {"x": 6, "y": 6, "player": 1}
  ],
  "current_player": 2,
  "is_game_over": false,
  "winner": null
}
```

---

## 数据模型

### RuleType (规则类型)
- `freestyle` - 自由规则
- `standard` - 标准规则
- `renju` - 连珠规则

### SessionInfo (会话信息)
| 字段 | 类型 | 说明 |
|------|------|------|
| session_id | string | 会话ID(哈希值) |
| board_size | int | 棋盘大小 |
| rule | RuleType | 游戏规则 |
| created_at | datetime | 创建时间 |
| last_activity | datetime | 最后活动时间 |
| is_active | bool | 是否活跃 |
| move_count | int | 已走步数 |
| position_history | string[] | 位置历史 |

### EngineInfo (引擎信息)
| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 引擎名称 |
| version | string | 版本 |
| author | string | 作者 |
| country | string | 国家 |

---

## 错误码

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 会话不存在 |
| 422 | 验证错误 |
| 503 | 服务不可用 |
| 500 | 服务器内部错误 |

---

## 使用示例

### Python

```python
import httpx

# 创建会话
async with httpx.AsyncClient() as client:
    resp = await client.post("http://localhost:8000/sessions", json={
        "board_size": 15,
        "rule": "freestyle"
    })
    session_id = resp.json()["session_id"]
    
    # 走子
    resp = await client.post(
        f"http://localhost:8000/sessions/{session_id}/move",
        json={"x": 7, "y": 7}
    )
    print(resp.json()["engine_move"])
    
    # 删除会话
    await client.delete(f"http://localhost:8000/sessions/{session_id}")
```

### cURL

```bash
# 创建会话
curl -X POST http://localhost:8000/sessions \
  -H "Content-Type: application/json" \
  -d '{"board_size":15,"rule":"freestyle"}'

# 走子
curl -X POST http://localhost:8000/sessions/{session_id}/move \
  -H "Content-Type: application/json" \
  -d '{"x":7,"y":7}'

# 删除会话
curl -X DELETE http://localhost:8000/sessions/{session_id}
```

---

## 测试脚本

项目包含以下测试脚本:

- `test_api.py` - 单元测试
- `integration_test.py` - 集成测试
- `load_test.py` - 负载测试
- `test_runner.ps1` - PowerShell测试运行器

运行测试:
```bash
# 单元测试
python test_api.py

# 集成测试
python integration_test.py

# 负载测试
python load_test.py
```
