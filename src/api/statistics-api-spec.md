# 统计分析 API 文档

## 概述

提供多层级的挂号数据统计分析接口，支持从医院全局到具体医生的层级化数据查询和时间序列分析。

---

## 一、挂号统计接口

### 1.1 获取医院总体挂号统计

**接口**: `GET /admin/statistics/hospital/registrations`

**权限**: 仅管理员

**查询参数**:
- `date` (string, optional): 统计日期，格式 YYYY-MM-DD，默认为当天
- `date_range` (string, optional): 时间范围，可选值：`today`(默认)、`7days`、`30days`

**响应示例** (单日统计):
```json
{
  "code": 0,
  "message": {
    "date": "2025-11-13",
    "total_registrations": 1250,
    "by_slot_type": {
      "普通": 800,
      "专家": 350,
      "特需": 100
    },
    "total_revenue": 125000.00,
    "completed_consultations": 1188,
    "areas": [
      {
        "area_id": 1,
        "area_name": "东院区",
        "registrations": 650,
        "revenue": 65000.00
      },
      {
        "area_id": 2,
        "area_name": "西院区",
        "registrations": 600,
        "revenue": 60000.00
      }
    ]
  }
}
```

**字段说明**:
- `total_registrations`: 总挂号数量
- `completed_consultations`: 已完成就诊数量（已就诊完成的患者人数）
- `total_revenue`: 总收入（单位：元）
- `by_slot_type`: 按号源类型统计
- `areas`: 按院区统计

**响应示例** (时间序列):
```json
{
  "code": 0,
  "message": {
    "date_range": "7days",
    "start_date": "2025-11-07",
    "end_date": "2025-11-13",
    "time_series": [
      {
        "date": "2025-11-07",
        "registrations": 1100,
        "revenue": 110000.00
      },
      {
        "date": "2025-11-08",
        "registrations": 1200,
        "revenue": 120000.00
      }
      // ... 其他日期
    ],
    "total_registrations": 8200,
    "total_revenue": 820000.00,
    "completed_consultations": 7850
  }
}
```

### 1.2 获取分院区挂号统计

**接口**: `GET /admin/statistics/areas/{area_id}/registrations`

**权限**: 仅管理员

**路径参数**:
- `area_id` (int): 院区ID

**查询参数**:
- `date` (string, optional): 统计日期，格式 YYYY-MM-DD，默认为当天

**响应示例**:
```json
{
  "code": 0,
  "message": {
    "area_id": 1,
    "area_name": "东院区",
    "date": "2025-11-13",
    "total_registrations": 650,
    "by_slot_type": {
      "普通": 400,
      "专家": 200,
      "特需": 50
    },
    "total_revenue": 65000.00,
    "departments": [
      {
        "minor_dept_id": 101,
        "dept_name": "心内科",
        "registrations": 120,
        "revenue": 12000.00
      },
      {
        "minor_dept_id": 102,
        "dept_name": "神经内科",
        "registrations": 100,
        "revenue": 10000.00
      }
      // ... 其他科室
    ]
  }
}
```

### 1.3 获取科室挂号统计

**接口**: `GET /admin/statistics/departments/{minor_dept_id}/registrations`

**权限**: 仅管理员

**路径参数**:
- `minor_dept_id` (int): 小科室ID

**查询参数**:
- `date` (string, optional): 统计日期，格式 YYYY-MM-DD，默认为当天
- `date_range` (string, optional): 时间范围，可选值：`today`(默认)、`7days`、`30days`

**响应示例** (单日统计):
```json
{
  "code": 0,
  "message": {
    "minor_dept_id": 101,
    "dept_name": "心内科",
    "major_dept_name": "内科",
    "date": "2025-11-13",
    "total_registrations": 120,
    "by_slot_type": {
      "普通": 70,
      "专家": 40,
      "特需": 10
    },
    "total_revenue": 12000.00,
    "completed_consultations": 115,
    "doctors": [
      {
        "doctor_id": 301,
        "doctor_name": "张三",
        "title": "主任医师",
        "registrations": 45,
        "revenue": 4500.00
      },
      {
        "doctor_id": 302,
        "doctor_name": "李四",
        "title": "副主任医师",
        "registrations": 40,
        "revenue": 4000.00
      }
      // ... 其他医生
    ]
  }
}
```

**字段说明**:
- `total_registrations`: 科室总挂号数量
- `completed_consultations`: 已完成就诊数量
- `total_revenue`: 科室总收入（单位：元）
- `by_slot_type`: 按号源类型统计
- `doctors`: 该科室医生列表及其统计数据
```

**响应示例** (时间序列):
```json
{
  "code": 0,
  "message": {
    "minor_dept_id": 101,
    "dept_name": "心内科",
    "date_range": "7days",
    "start_date": "2025-11-07",
    "end_date": "2025-11-13",
    "time_series": [
      {
        "date": "2025-11-07",
        "registrations": 100,
        "revenue": 10000.00
      },
      {
        "date": "2025-11-08",
        "registrations": 110,
        "revenue": 11000.00
      }
      // ... 其他日期
    ],
    "total_registrations": 750,
    "total_revenue": 75000.00,
    "completed_consultations": 720
  }
}
```

### 1.4 获取医生挂号统计

**接口**: `GET /admin/statistics/doctors/{doctor_id}/registrations`

**权限**: 仅管理员

**路径参数**:
- `doctor_id` (int): 医生ID

**查询参数**:
- `date` (string, optional): 统计日期，格式 YYYY-MM-DD，默认为当天
- `date_range` (string, optional): 时间范围，可选值：`today`(默认)、`7days`、`30days`

**响应示例** (单日统计):
```json
{
  "code": 0,
  "message": {
    "doctor_id": 301,
    "doctor_name": "张三",
    "title": "主任医师",
    "dept_name": "心内科",
    "date": "2025-11-13",
    "total_registrations": 45,
    "by_slot_type": {
      "普通": 25,
      "专家": 15,
      "特需": 5
    },
    "total_revenue": 4500.00,
    "completed_consultations": 44,
    "by_time_section": {
      "上午": 25,
      "下午": 15,
      "晚上": 5
    },
    "schedules": [
      {
        "schedule_id": 1001,
        "clinic_name": "心内科1诊室",
        "time_section": "上午",
        "slot_type": "专家",
        "registrations": 15,
        "total_slots": 20,
        "utilization_rate": 0.75
      }
    ]
  }
}
```

**字段说明**:
- `total_registrations`: 医生总挂号数量
- `completed_consultations`: 已完成就诊数量
- `total_revenue`: 医生总收入（单位：元）
- `by_slot_type`: 按号源类型统计
- `by_time_section`: 按时段统计
- `schedules`: 排班详情及利用率
```

**响应示例** (时间序列):
```json
{
  "code": 0,
  "message": {
    "doctor_id": 301,
    "doctor_name": "张三",
    "date_range": "30days",
    "start_date": "2025-10-14",
    "end_date": "2025-11-13",
    "time_series": [
      {
        "date": "2025-10-14",
        "registrations": 40,
        "revenue": 4000.00
      },
      {
        "date": "2025-10-15",
        "registrations": 42,
        "revenue": 4200.00
      }
      // ... 其他日期
    ],
    "total_registrations": 1200,
    "total_revenue": 120000.00,
    "completed_consultations": 1150,
    "working_days": 30
  }
}
```

---

## 二、综合统计接口

### 2.1 获取科室排行榜

**接口**: `GET /admin/statistics/departments/ranking`

**权限**: 仅管理员

**查询参数**:
- `date` (string, optional): 统计日期，默认为当天
- `order_by` (string, optional): 排序依据，可选值：`registrations`(默认)、`revenue`
- `limit` (int, optional): 返回数量，默认10

**响应示例**:
```json
{
  "code": 0,
  "message": {
    "date": "2025-11-13",
    "order_by": "registrations",
    "ranking": [
      {
        "rank": 1,
        "minor_dept_id": 101,
        "dept_name": "心内科",
        "registrations": 120,
        "revenue": 12000.00
      },
      {
        "rank": 2,
        "minor_dept_id": 102,
        "dept_name": "神经内科",
        "registrations": 110,
        "revenue": 11000.00
      }
      // ... 其他科室
    ]
  }
}
```

### 2.2 获取医生排行榜

**接口**: `GET /admin/statistics/doctors/ranking`

**权限**: 仅管理员

**查询参数**:
- `dept_id` (int, optional): 限定科室ID
- `date` (string, optional): 统计日期，默认为当天
- `order_by` (string, optional): 排序依据，可选值：`registrations`(默认)、`revenue`
- `limit` (int, optional): 返回数量，默认10

**响应示例**:
```json
{
  "code": 0,
  "message": {
    "date": "2025-11-13",
    "order_by": "registrations",
    "ranking": [
      {
        "rank": 1,
        "doctor_id": 301,
        "doctor_name": "张三",
        "title": "主任医师",
        "dept_name": "心内科",
        "registrations": 45,
        "revenue": 4500.00
      },
      {
        "rank": 2,
        "doctor_id": 305,
        "doctor_name": "王五",
        "title": "主任医师",
        "dept_name": "神经内科",
        "registrations": 42,
        "revenue": 4200.00
      }
      // ... 其他医生
    ]
  }
}
```

---

## 三、数据说明

### 统计数据来源

1. **挂号数量**: 统计 `appointments` 表中指定日期的预约记录
2. **收入金额**: 根据预约记录中的 `price` 字段累加
3. **号源类型**: 从 `schedules` 表的 `slot_type` 字段获取（普通/专家/特需）
4. **时间段**: 从 `schedules` 表的 `time_section` 字段获取（上午/下午/晚上）

### 利用率计算公式

```
利用率 = 实际挂号数 / 总号源数 × 100%
```

### 时间范围说明

- `today`: 仅统计当天数据
- `7days`: 统计最近7天数据（包含今天）
- `30days`: 统计最近30天数据（包含今天）

---

## 四、错误码说明

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 403 | 权限不足（非管理员） |
| 400 | 请求参数错误 |
| 404 | 资源不存在（如科室ID、医生ID不存在） |
| 500 | 内部服务异常 |

---

## 五、前端使用建议

### 层级导航结构

```
医院总览
├── 院区统计 (点击院区卡片)
│   └── 科室统计 (点击科室卡片)
│       └── 医生统计 (点击医生卡片)
```

### 推荐图表类型

1. **总量展示**: 大数字卡片 + 增长趋势指示器
2. **分布对比**: 饼图或环形图（号源类型分布、院区分布）
3. **排名对比**: 柱状图（科室排名、医生排名）
4. **时间趋势**: 折线图（7天/30天挂号趋势）
5. **利用率**: 进度条或仪表盘

### 交互建议

- 支持点击图表元素进行下钻
- 提供面包屑导航返回上级
- 支持日期选择器切换统计日期
- 支持时间范围切换（今日/7天/30天）
