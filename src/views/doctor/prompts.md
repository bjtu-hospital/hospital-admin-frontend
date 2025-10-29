提示词1:
```
请你按照科室管理的类似结构来写医生管理页面.
提供一下的分类选项
医生将会拿到的数据是:
请求体（可选是否同时创建账号）：

### 2.2 获取医生列表
- GET `/doctors?dept_id={dept_id}`
- 参数 `dept_id` 可选，用于按科室过滤

响应：

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
                "create_time": "2024-01-01T10:00:00",
                "is_registered": false    #这个字段可能不存在,不存在默认false
            },
            // ... 其他医生
        ]
    }
}

其中dept_id指的是minor_department.
应该提供以下的分类筛选规则:
1.查看全部
2.按照大科室筛选(major_department)
3.按照小科室筛选(minor_department)

然后点击医生的卡片,可以查看医生的详细信息.
在卡片上可以:

1. 更新医生信息
2. 删除医生
3. 医生调科室
4. 设置账号密码(如果有账号了显示,修改账号密码. 如果没有显示注册账号)
5. 查看修改医生的照片(留一个空间放医生的照片(没有显示空))

###  更新医生信息
- PUT `/doctors/{doctor_id}`

请求体（所有字段可选）：
{
    "name": "张三（更新）",
    "title": "副主任医师",
    "specialty": "心血管疾病，高血压",
    "introduction": "更新的简介..."
}

响应：
{
    "code": 0,
    "message": {
        "detail": "成功更新医生信息"
    }
}

###  删除医生
- DELETE `/doctors/{doctor_id}`
- 说明：如果医生有关联的用户账号，会执行以下操作：
  1. 将用户标记为已删除（`is_deleted=True`）
  2. 停用账号（`is_active=False`）
  3. 清理 Redis 中的 token 映射
  4. 解除医生-用户关联并删除医生记录

响应：

{
    "code": 0,
    "message": {
        "detail": "成功删除医生 张三"
    }
}


### 医生调科室
- PUT `/doctors/{doctor_id}/transfer`
- 说明：将医生调到新的科室

请求体：
{
    "new_dept_id": 2  // 新科室ID
}

{
    "code": 0,
    "message": {
        "detail": "成功将医生 张三 调至新科室",
        "doctor_id": 1,
        "old_dept_id": 1,
        "new_dept_id": 2
    }
}

### 为医生创建账号
- POST `/doctors/{doctor_id}/create-account`
- 说明：为已有的医生记录创建关联的用户账号

请求体：
{
    "identifier": "doc1001",  // 工号作为登录用户名
    "password": "StrongP@ss",
    "email": "doctor@example.com",  // 可选
    "phonenumber": "13800000000"    // 可选
}

响应：
{
    "code": 0,
    "message": {
        "detail": "成功为医生创建账号",
        "user_id": 10,
        "doctor_id": 1
    }
}


在这个页面之外, 还应该有个按钮可以创建一个医生信息:
### 创建医生
- POST `/doctors`

请求体（可选是否同时创建账号）：
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

响应：
{
    "code": 0,
    "message": {
        "detail": "成功创建医生信息",
        "doctor_id": 1,
        "user_id": 10  // 若同时创建了账号则返回
    }
}


请你有条理的在当前的框架下,添加这些内容.
```