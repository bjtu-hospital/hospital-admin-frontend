现在/admin为路由, 而非/auth/admin



#### 1.7 更新小科室

- PUT `/minor-departments/{minor_dept_id}`

请求体：
```json
{
    "major_dept_id": 1,  // 可选，用于调整所属大科室
    "name": "心内科（更新）",
    "description": "心脏内科相关"
}
```

响应：
```json
{
    "code": 0,
    "message": {
        "detail": "成功更新小科室信息"
    }
}
```



## 2. 医生管理

### 2.1 创建医生
- POST `/doctors`

请求体（可选是否同时创建账号）：
```json
{
    "dept_id": 1,
    "name": "张三",
    "title": "主治医师",
    "specialty": "心血管疾病",
    "introduction": "从事心血管疾病临床工作多年...",
    "identifier": "doc1001",  // 可选，工号（若要创建账号）
    "password": "StrongP@ss", // 可选，密码（若要创建账号）
    "email": "zhangsan@example.com",
    "phonenumber": "13800000000"
}
```

响应：
```json
{
    "code": 0,
    "message": {
        "detail": "成功创建医生信息",
        "doctor_id": 1,
        "user_id": 10  // 若同时创建了账号则返回
    }
}
```

### 2.2 获取医生列表
- GET `/doctors?dept_id={dept_id}`
- 参数 `dept_id` 可选，用于按科室过滤

响应：
```json
{
    "code": 0,
    "message": {
        "doctors": [
            {
                "doctor_id": 1,
                "user_id": 10,
                "dept_id": 1,
                "name": "张三",
                "title": "主治医师",
                "specialty": "心血管疾病",
                "introduction": "从事心血管疾病临床工作多年...",
                "photo_path": null,
                "original_photo_url": null,
                "create_time": "2024-01-01T10:00:00"
            },
            // ... 其他医生
        ]
    }
}
```

### 2.3 更新医生信息
- PUT `/doctors/{doctor_id}`

请求体（所有字段可选）：
```json
{
    "name": "张三（更新）",
    "title": "副主任医师",
    "specialty": "心血管疾病，高血压",
    "introduction": "更新的简介..."
}
```

响应：
```json
{
    "code": 0,
    "message": {
        "detail": "成功更新医生信息"
    }
}
```

### 2.4 删除医生
- DELETE `/doctors/{doctor_id}`
- 说明：如果医生有关联的用户账号，会执行以下操作：
  1. 将用户标记为已删除（`is_deleted=True`）
  2. 停用账号（`is_active=False`）
  3. 清理 Redis 中的 token 映射
  4. 解除医生-用户关联并删除医生记录

响应：
```json
{
    "code": 0,
    "message": {
        "detail": "成功删除医生 张三"
    }
}
```

### 2.5 为医生创建账号
- POST `/doctors/{doctor_id}/create-account`
- 说明：为已有的医生记录创建关联的用户账号

请求体：
```json
{
    "identifier": "doc1001",  // 工号作为登录用户名
    "password": "StrongP@ss",
    "email": "doctor@example.com",  // 可选
    "phonenumber": "13800000000"    // 可选
}
```

响应：
```json
{
    "code": 0,
    "message": {
        "detail": "成功为医生创建账号",
        "user_id": 10,
        "doctor_id": 1
    }
}
```

### 2.6 医生调科室
- PUT `/doctors/{doctor_id}/transfer`
- 说明：将医生调到新的科室

请求体：
```json
{
    "new_dept_id": 2  // 新科室ID
}
```

响应：
```json
{
    "code": 0,
    "message": {
        "detail": "成功将医生 张三 调至新科室",
        "doctor_id": 1,
        "old_dept_id": 1,
        "new_dept_id": 2
    }
}
```