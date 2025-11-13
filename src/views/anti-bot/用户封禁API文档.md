# 用户安全度检测 API 文档

## 概述

本模块提供用户风险管理功能，包括用户列表查询、封禁/解封、以及按时段统计用户行为。

**Mock 开关**: 在 `mock.js` 中设置 `USE_MOCK = true/false` 控制是否使用模拟数据。

---

## API 接口

### 1. 获取用户列表

**函数**: `getUsers(params)`

**描述**: 获取高风险用户或正常用户列表，支持分页。

**请求参数**:
```javascript
{
  user_type: 'high_risk' | 'normal',  // 用户类型，默认 'normal'
  page: 1,                             // 页码，默认 1
  page_size: 10                        // 每页数量，默认 10
}
```

**响应数据**:
```javascript
{
  code: 0,
  message: {
    users: [
      {
        user_id: 1000,              // 用户ID
        username: 'user_1000',      // 用户名
        name: '高风险用户1',         // 姓名
        phone: '13800000000',       // 手机号
        risk_level: '高危',         // 风险等级：高危/中危/正常
        ban_status: '未封禁',       // 封禁状态：未封禁/禁止挂号/禁止登录/完全封禁
        ban_type: 'register',       // 封禁类型：register/login
        ban_end_time: '2025-12-01', // 封禁结束时间，null表示未封禁或永久
        warning_count: 5,           // 警告次数
        cancel_count: 12,           // 取消挂号次数
        register_count: 45,         // 挂号次数
        last_active: '2025-11-10',  // 最后活跃时间
        risk_reason: '频繁取消挂号', // 风险原因
        created_at: '2025-01-15'    // 创建时间
      }
    ],
    total: 48,          // 总记录数
    page: 1,            // 当前页码
    page_size: 10,      // 每页数量
    total_pages: 5      // 总页数
  }
}
```

**使用示例**:
```javascript
import { getUsers } from '@/api/antiBot'

// 获取高风险用户列表
const response = await getUsers({ 
  user_type: 'high_risk', 
  page: 1, 
  page_size: 10 
})
```

**Mock 数据**:
- 高风险用户：48条
- 正常用户：156条

---

### 2. 封禁用户

**函数**: `banUser(params)`

**描述**: 对指定用户进行封禁操作。

**请求参数**:
```javascript
{
  user_id: 1000,                      // 用户ID (必填)
  ban_type: 'register',               // 封禁类型 (必填)
                                      // 'register' - 禁止挂号
                                      // 'login' - 禁止登录
                                      // 'all' - 完全封禁
  duration_days: 7,                   // 封禁时长（天），默认 0
                                      // 0 表示永久封禁
  reason: '频繁取消挂号'               // 封禁原因（选填）
}
```

**响应数据**:
```javascript
{
  code: 0,
  message: '封禁成功',
  data: {
    user_id: 1000,
    ban_type: 'register',
    ban_end_time: '2025-11-20T12:00:00.000Z'  // null 表示永久
  }
}
```

**使用示例**:
```javascript
import { banUser } from '@/api/antiBot'

// 封禁用户7天，禁止挂号
await banUser({
  user_id: 1000,
  ban_type: 'register',
  duration_days: 7,
  reason: '频繁取消挂号'
})
```

**封禁时长选项**:
- 1天 / 3天 / 7天 / 15天 / 30天 / 90天 / 永久(0)

---

### 3. 解除封禁

**函数**: `unbanUser(params)`

**描述**: 解除用户的封禁状态。

**请求参数**:
```javascript
{
  user_id: 1000  // 用户ID (必填)
}
```

**响应数据**:
```javascript
{
  code: 0,
  message: '解除封禁成功',
  data: {
    user_id: 1000
  }
}
```

**使用示例**:
```javascript
import { unbanUser } from '@/api/antiBot'

// 解除用户封禁
await unbanUser({ user_id: 1000 })
```

---

### 4. 获取用户详情

**函数**: `getUserDetail(params)`

**描述**: 获取指定用户的详细信息。

**请求参数**:
```javascript
{
  user_id: 1000  // 用户ID (必填)
}
```

**响应数据**:
```javascript
{
  code: 0,
  message: {
    user_id: 1000,
    username: 'user_1000',
    name: '高风险用户1',
    phone: '13800000000',
    risk_level: '高危',
    ban_status: '未封禁',
    ban_type: 'register',
    ban_end_time: null,
    warning_count: 5,
    cancel_count: 12,
    register_count: 45,
    last_active: '2025-11-10',
    risk_reason: '频繁取消挂号',
    created_at: '2025-01-15'
  }
}
```

**使用示例**:
```javascript
import { getUserDetail } from '@/api/antiBot'

// 获取用户详情
const response = await getUserDetail({ user_id: 1000 })
```

---

## 数据字典

### 用户类型 (user_type)
| 值 | 说明 |
|---|---|
| `high_risk` | 高风险用户 |
| `normal` | 正常用户 |

### 风险等级 (risk_level)
| 值 | 说明 |
|---|---|
| `高危` | 高风险 |
| `中危` | 中等风险 |
| `正常` | 正常 |

### 封禁状态 (ban_status)
| 值 | 说明 |
|---|---|
| `未封禁` | 用户正常 |
| `禁止挂号` | 无法挂号 |
| `禁止登录` | 无法登录 |
| `完全封禁` | 禁止登录和挂号 |

### 封禁类型 (ban_type)
| 值 | 说明 |
|---|---|
| `register` | 禁止挂号 |
| `login` | 禁止登录 |
| `all` | 完全封禁 |

---

## 后端接口路径

> **注意**: 当前使用 Mock 数据，后端接口需要实现以下路径：

| 接口 | 方法 | 路径 |
|---|---|---|
| 获取用户列表 | GET | `/api/anti-bot/users` |
| 封禁用户 | POST | `/api/anti-bot/ban` |
| 解除封禁 | POST | `/api/anti-bot/unban` |
| 获取用户详情 | GET | `/api/anti-bot/users/:user_id` |
| 获取行为统计 | GET | `/api/anti-bot/users/:user_id/stats` |

### 5. 获取用户时段行为统计

**函数**: `getUserStats(params)`

**描述**: 获取指定用户在时间范围内的挂号次数与取消次数汇总。

**请求参数**:
```javascript
{
  user_id: 1000,                      // 用户ID (必填)
  start_date: '2025-10-01T00:00:00Z', // 开始时间 ISO 字符串（可选）
  end_date: '2025-11-01T00:00:00Z'    // 结束时间 ISO 字符串（可选）
}
```

当不提供 `start_date` 时，统计从最早记录至 `end_date`；不提供 `end_date` 时，默认为当前时间。

**响应数据**:
```javascript
{
  code: 0,
  message: {
    user_id: 1000,
    start_date: '2025-10-01T00:00:00Z',
    end_date:   '2025-11-01T00:00:00Z',
    register_count: 25,  // 时段内挂号次数
    cancel_count: 4      // 时段内取消次数
  }
}
```

**使用示例**:
```javascript
import { getUserStats } from '@/api/antiBot'

const res = await getUserStats({
  user_id: 1000,
  start_date: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
  end_date: new Date().toISOString()
})
```

---

## 错误处理

所有接口统一错误响应格式：

```javascript
{
  code: 404,              // 错误码
  message: '用户不存在'    // 错误信息
}
```

常见错误码：
- `0`: 成功
- `404`: 资源不存在
- `400`: 请求参数错误
- `403`: 权限不足
- `500`: 服务器错误
