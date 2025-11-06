# 排班管理 API 接口变更说明

## 1. 排班创建/更新接口 - 价格字段变更

### 接口路径
- 创建：`POST /admin/schedules`
- 更新：`PUT /admin/schedules/{schedule_id}`

### 变更内容
`price` 字段现在支持特殊值：
- **`price = 0` 或 `price < 0`**：表示使用门诊默认价格
- **`price > 0`**：表示使用自定义价格

### 请求参数（兼容现有接口）
```json
{
  "doctor_id": 123,
  "clinic_id": 456,
  "schedule_date": "2025-11-10",
  "time_section": "上午",
  "slot_type": "普通",
  "status": "正常",
  "price": 0,           // 0表示使用门诊默认价格，>0表示自定义价格
  "total_slots": 20
}
```

### 后端处理逻辑
```python
if price <= 0:
    # 根据 slot_type 获取门诊默认价格
    if slot_type == "普通":
        price = clinic.default_price_normal or 50
    elif slot_type == "专家":
        price = clinic.default_price_expert or 100
    else:  # 特需
        price = clinic.default_price_special or 500
```

---

## 2. 门诊信息更新接口（新增）

### 接口路径
`PUT /admin/clinics/{clinic_id}`

### 功能
更新现有门诊的基本信息和默认价格

### 请求参数
```json
{
  "name": "心内科门诊",                    // 可选：门诊名称
  "address": "内科楼2楼",                   // 可选：门诊地址
  "default_price_normal": 50,            // 可选：普通号默认价格（不设置则为null）
  "default_price_expert": 100,           // 可选：专家号默认价格（不设置则为null）
  "default_price_special": 500           // 可选：特需号默认价格（不设置则为null）
}
```

### 响应格式
```json
{
  "code": 0,
  "message": {
    "detail": "门诊信息更新成功"
  }
}
```

### 说明
- 所有字段均为可选
- 价格字段可以设置为 `null` 表示不设置默认价格
- 如果不提供某个字段，则不更新该字段（保持原值）

---

## 3. 门诊详情接口 - 响应字段扩展

### 接口路径
`GET /admin/clinics?dept_id={dept_id}`

### 变更内容
响应中的门诊对象新增默认价格字段（兼容现有接口）

### 响应格式
```json
{
  "code": 0,
  "message": {
    "clinics": [
      {
        "clinic_id": 1,
        "area_id": 1,
        "name": "心内科门诊",
        "type": 0,
        "address": "内科楼2楼",
        "minor_dept_id": 10,
        "create_time": "2025-01-01 10:00:00",
        
        // 新增字段（如果未设置则为null）
        "default_price_normal": 50,      // 普通号默认价格
        "default_price_expert": 100,     // 专家号默认价格
        "default_price_special": 500     // 特需号默认价格
      }
    ]
  }
}
```

---

## 4. 兼容性说明

### 向后兼容
- 所有新增字段均为可选，不影响现有功能
- `price = 0` 的处理逻辑在后端实现，前端发送 0 即可
- 如果后端未实现默认价格功能，`price = 0` 可以在后端使用固定默认值

### 迁移建议
1. 后端先添加 `default_price_*` 字段到数据库（可为null）
2. 更新门诊列表接口返回新字段
3. 实现门诊更新接口
4. 在排班创建/更新接口中添加 `price <= 0` 的处理逻辑

### 数据库字段（建议）
```sql
ALTER TABLE clinics 
ADD COLUMN default_price_normal DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN default_price_expert DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN default_price_special DECIMAL(10,2) DEFAULT NULL;
```
