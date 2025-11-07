3. 审核管理
所有审核接口均需管理员权限，请求头需包含：

Authorization: Bearer <token>
A. 排班审核（Schedule Audit）
3.1 获取排班审核列表
GET /audit/schedule
说明：获取所有排班审核申请列表（无分页），按提交时间倒序排列
响应示例：

{
    "code": 0,
    "message": {
        "audits": [
            {
                "id": 1,
                "department_id": 1,
                "department_name": "心内科",
                "clinic_id": 56,
                "clinic_name": "心血管科门诊",
                "submitter_id": 10,
                "submitter_name": "李医生",
                "submit_time": "2025-11-01T10:30:00",
                "week_start": "2025-11-04",
                "week_end": "2025-11-10",
                "remark": "下周排班申请",
                "status": "pending",
                "auditor_id": null,
                "audit_time": null,
                "audit_remark": null,
                "schedule": [[...], [...], ...] // 7x3 排班数据
            }
        ]
    }
}
3.2 获取排班审核详情
GET /audit/schedule/{audit_id}
说明：获取指定排班审核申请的详细信息
响应格式同上列表项，包含完整排班 JSON 数据。

3.3 通过排班审核
POST /audit/schedule/{audit_id}/approve
说明：管理员审核通过排班申请，系统会将排班数据写入 Schedule 表，生成实际排班记录
请求体：

{
    "comment": "审核通过，排班合理"
}
响应示例：

{
    "code": 0,
    "message": {
        "audit_id": 1,
        "status": "approved",
        "auditor_id": 5,
        "audit_time": "2025-11-01T14:30:00"
    }
}
业务逻辑：

更新审核表状态为 approved
记录审核人和审核时间
解析排班 JSON 数据，为每个时间段生成 Schedule 记录（包括医生、门诊、日期、时段等）
事务提交，确保数据一致性
3.4 拒绝排班审核
POST /audit/schedule/{audit_id}/reject
说明：管理员拒绝排班申请
请求体：

{
    "comment": "排班冲突，请重新提交"
}
响应格式同通过审核。

B. 请假审核（Leave Audit）
3.5 获取请假审核列表
GET /audit/leave
说明：获取所有请假审核申请列表（无分页），按提交时间倒序排列
响应示例：

{
    "code": 0,
    "message": {
        "audits": [
            {
                "id": 1,
                "doctor_id": 10,
                "doctor_name": "李医生",
                "doctor_title": "主治医师",
                "department_name": "心内科",
                "leave_start_date": "2025-11-05",
                "leave_end_date": "2025-11-07",
                "leave_days": 3,
                "reason": "因个人原因需要请假三天...",
                "reason_preview": "因个人原因需要请假三天...",
                "attachments": [
                    "/static/audit/leave_20251101_123456.jpg"
                ],
                "submit_time": "2025-11-01T09:00:00",
                "status": "pending",
                "auditor_id": null,
                "audit_time": null,
                "audit_remark": null
            }
        ]
    }
}
字段说明：

leave_days：自动计算的请假天数（包含起止日期）
reason_preview：原因前 50 字符的预览（若超出则添加 ...）
attachments：附件文件路径列表（可用于后续获取附件内容）
3.6 获取请假审核详情
GET /audit/leave/{audit_id}
说明：获取指定请假审核申请的详细信息
响应格式同上列表项，包含完整请假原因和附件列表。

3.7 通过请假审核
POST /audit/leave/{audit_id}/approve
说明：管理员审核通过请假申请，系统会自动删除医生在请假期间的所有排班记录
请求体：

{
    "comment": "同意请假申请"
}
响应示例：

{
    "code": 0,
    "message": {
        "audit_id": 1,
        "status": "approved",
        "auditor_id": 5,
        "audit_time": "2025-11-01T14:45:00"
    }
}
业务逻辑：

删除医生在请假期间（leave_start_date 至 leave_end_date）的所有排班记录
更新审核表状态为 approved
记录审核人和审核时间
事务提交，确保数据一致性
⚠️ 重要提示：通过请假审核后，该医生在请假期间的排班将被清空，患者无法再预约这些时段。请谨慎操作。

3.8 拒绝请假审核
POST /audit/leave/{audit_id}/reject
说明：管理员拒绝请假申请，不会影响现有排班
请求体：

{
    "comment": "请假理由不充分，建议协调其他时间"
}
响应格式同通过审核。

C. 附件管理
3.9 获取审核附件（二进制数据）
GET /audit/attachment/raw?path={file_path}
说明：根据附件的相对路径返回文件二进制数据，用于查看请假申请等审核中的附件（图片/文件）
参数：

path（查询参数）：附件的相对路径（存储在 LeaveAudit.attachment_data_json 中）
示例：/static/audit/leave_20251101_123456.jpg 或 static/audit/leave_20251101_123456.jpg
响应：

成功时返回文件二进制流（StreamingResponse），Content-Type 自动根据文件扩展名推断
示例：image/jpeg、image/png、application/pdf 等
失败时返回统一错误格式：
{
    "code": 106,
    "message": {
        "error": "资源错误",
        "msg": "附件文件不存在或路径错误"
    }
}
安全性说明：

路径会经过规范化处理，防止 ../ 等目录遍历攻击
强制校验文件路径必须在应用基础目录内
仅管理员可访问
4. 系统配置管理
所有系统配置接口均需管理员权限，请求头需包含：

Authorization: Bearer <token>
4.1 获取系统配置
GET /config
说明：获取系统所有配置信息，包括挂号配置和排班配置
响应示例：

{
    "code": 0,
    "message": {
        "registration": {
            "advanceBookingDays": 14,
            "sameDayDeadline": "08:00",
            "noShowLimit": 3,
            "cancelHoursBefore": 24,
            "sameClinicInterval": 7
        },
        "schedule": {
            "maxFutureDays": 60,
            "morningStart": "08:00",
            "morningEnd": "12:00",
            "afternoonStart": "14:00",
            "afternoonEnd": "18:00",
            "eveningStart": "18:30",
            "eveningEnd": "21:00",
            "consultationDuration": 15,
            "intervalTime": 5
        }
    }
}
registration (挂号配置) 字段说明
字段名	类型	说明	范围
advanceBookingDays	number	提前挂号天数	1-90
sameDayDeadline	string	当日挂号截止时间，格式: HH:mm	例: "08:00"
noShowLimit	number	爽约次数限制	1-10
cancelHoursBefore	number	退号提前时间（小时）	1-72
sameClinicInterval	number	同科室挂号间隔（天）	1-30
schedule (排班配置) 字段说明
字段名	类型	说明	范围
maxFutureDays	number	最多排未来天数	7-180
morningStart	string	上午班开始时间，格式: HH:mm	例: "08:00"
morningEnd	string	上午班结束时间，格式: HH:mm	例: "12:00"
afternoonStart	string	下午班开始时间，格式: HH:mm	例: "14:00"
afternoonEnd	string	下午班结束时间，格式: HH:mm	例: "18:00"
eveningStart	string	晚班开始时间，格式: HH:mm	例: "18:30"
eveningEnd	string	晚班结束时间，格式: HH:mm	例: "21:00"
consultationDuration	number	单次就诊时长（分钟）	5-60
intervalTime	number	就诊间隔时间（分钟）	0-30
4.2 更新系统配置
PUT /config
说明：更新系统配置信息，可选择性更新挂号配置和/或排班配置
请求体（所有字段可选，只需传递需要更新的字段）：

{
    "registration": {
        "advanceBookingDays": 30,
        "noShowLimit": 5
    },
    "schedule": {
        "maxFutureDays": 90,
        "morningStart": "07:30"
    }
}
响应示例：

{
    "code": 0,
    "message": {
        "detail": "配置更新成功"
    }
}
数据验证规则
数值范围验证：

advanceBookingDays: 1 ≤ value ≤ 90
noShowLimit: 1 ≤ value ≤ 10
cancelHoursBefore: 1 ≤ value ≤ 72
sameClinicInterval: 1 ≤ value ≤ 30
maxFutureDays: 7 ≤ value ≤ 180
consultationDuration: 5 ≤ value ≤ 60
intervalTime: 0 ≤ value ≤ 30
时间格式验证：

所有时间字段必须符合 HH:mm 格式（24小时制）
例如: "08:00", "14:30", "23:59"
逻辑验证：

上午班: morningStart < morningEnd
下午班: afternoonStart < afternoonEnd
晚班: eveningStart < eveningEnd
错误响应示例：

{
    "code": 99,
    "message": {
        "error": "请求参数错误",
        "msg": "上午班开始时间必须小于结束时间"
    }
}