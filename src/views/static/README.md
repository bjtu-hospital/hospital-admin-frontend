# 统计分析页面开发文档

## 概述

统计分析页面提供了医院挂号数据的多层级可视化分析，支持从医院全局到具体医生的层级化数据查询和时间序列分析。

## 功能特性

### 1. 层级化导航
- **医院总览** → **科室统计** → **医生统计**
- 支持面包屑导航，可快速返回上级
- 点击图表元素实现下钻分析

### 2. 多维度统计
- 总挂号数量统计
- 收入统计
- 号源类型分布（普通号、专家号、特需号）
- 时间段分布
- 排行榜展示

### 3. 时间范围选择
- 今日数据
- 近7天趋势
- 近30天趋势
- 自定义日期选择

### 4. 可视化图表
- **饼图**: 号源类型分布
- **柱状图**: 院区/科室/医生排名对比
- **折线图**: 时间序列趋势分析
- **统计卡片**: 关键指标展示

## 文件结构

```
src/
├── api/
│   ├── statistics.js                 # 统计API接口
│   └── statistics-api-spec.md        # API文档说明
├── components/
│   └── charts/
│       ├── PieChart.vue              # 饼图组件
│       ├── BarChart.vue              # 柱状图组件
│       └── LineChart.vue             # 折线图组件
└── views/
    └── static/
        ├── StaticView.vue            # 主统计页面
        ├── StatsCard.vue             # 统计卡片组件
        └── BreadcrumbNav.vue         # 面包屑导航组件
```

## 组件说明

### StaticView.vue - 主统计页面

主要功能：
- 管理三个层级的视图切换（医院、科室、医生）
- 处理日期和时间范围选择
- 加载和展示统计数据
- 管理导航栈和面包屑

关键方法：
- `loadHospitalStats()`: 加载医院总体统计
- `loadDepartmentStats(deptId)`: 加载科室统计
- `loadDoctorStats(doctorId)`: 加载医生统计
- `handleDepartmentClick()`: 处理科室点击，导航到科室详情
- `handleDoctorClick()`: 处理医生点击，导航到医生详情

### 图表组件

#### PieChart.vue
- 展示数据分布比例
- 支持环形图样式
- 自适应尺寸

#### BarChart.vue
- 展示数据对比
- 支持点击交互
- 渐变色柱状图

#### LineChart.vue
- 展示时间序列趋势
- 标注最大值、最小值、平均值
- 区域填充

#### StatsCard.vue
- 展示关键指标
- 支持图标和颜色主题
- 支持点击交互

#### BreadcrumbNav.vue
- 面包屑导航
- 支持点击返回上级

## API接口

所有统计接口详见 `src/api/statistics-api-spec.md`

主要接口：
1. `GET /admin/statistics/hospital/registrations` - 医院总体统计
2. `GET /admin/statistics/areas/{area_id}/registrations` - 院区统计
3. `GET /admin/statistics/departments/{minor_dept_id}/registrations` - 科室统计
4. `GET /admin/statistics/doctors/{doctor_id}/registrations` - 医生统计
5. `GET /admin/statistics/departments/ranking` - 科室排行榜
6. `GET /admin/statistics/doctors/ranking` - 医生排行榜

## 使用指南

### 1. 查看医院总览
- 默认进入医院总览页面
- 显示总挂号数、总收入、院区数量等关键指标
- 查看号源类型分布饼图
- 查看院区挂号分布柱状图
- 查看科室排行榜

### 2. 查看科室统计
- 点击科室排行榜中的柱状图
- 或通过面包屑导航进入
- 显示科室的挂号数、收入、医生数量
- 查看号源类型分布
- 查看医生挂号分布
- 查看科室挂号趋势（7天/30天）

### 3. 查看医生统计
- 在科室统计页面点击医生柱状图
- 显示医生的挂号数、收入、排班数量
- 查看号源类型分布
- 查看时段分布（上午/下午/晚上）
- 查看医生挂号趋势（7天/30天）
- 查看详细的排班信息表格

### 4. 时间范围切换
- 点击顶部"今日"、"近7天"、"近30天"按钮
- 或使用日期选择器选择特定日期
- 数据会自动刷新

## 技术栈

- **Vue 3**: 组合式API
- **ECharts**: 数据可视化库
- **Tailwind CSS**: 样式框架
- **Axios**: HTTP请求

## 开发建议

### 1. 性能优化
- 使用 `computed` 缓存图表数据转换
- 图表组件在销毁时正确清理资源
- 避免不必要的API重复调用

### 2. 错误处理
- 所有API调用都有try-catch
- 使用Toast提示用户错误信息
- 加载状态显示

### 3. 响应式设计
- 使用Grid布局适配不同屏幕
- 图表自动响应窗口大小变化
- 移动端友好

### 4. 扩展性
- 组件高度可复用
- 易于添加新的统计维度
- API接口设计统一

## 后端开发注意事项

### 数据格式要求
1. 日期格式: `YYYY-MM-DD`
2. 金额保留两位小数
3. 百分比以小数形式返回（0.75表示75%）

### 必需字段
- 所有统计接口必须返回 `code` 和 `message`
- `code=0` 表示成功
- 时间序列数据必须按日期升序排列

### 性能考虑
- 建议对统计查询添加索引
- 考虑使用Redis缓存热点数据
- 大范围时间查询建议分页或限制

## Mock数据开发

如果后端接口尚未就绪，可以在 `src/views/static/` 目录下创建 `statistics-mock.js` 文件提供模拟数据：

```javascript
export const mockHospitalStats = {
  date: "2025-11-13",
  total_registrations: 1250,
  by_slot_type: {
    "普通": 800,
    "专家": 350,
    "特需": 100
  },
  total_revenue: 125000.00,
  areas: [
    {
      area_id: 1,
      area_name: "东院区",
      registrations: 650,
      revenue: 65000.00
    }
  ]
}
```

## 常见问题

### Q1: 图表不显示？
- 检查数据格式是否正确
- 确保ECharts已正确安装
- 查看浏览器控制台错误信息

### Q2: 点击图表没有反应？
- 确保图表组件设置了 `:clickable="true"`
- 检查是否绑定了 `@chartClick` 事件
- 确认emit事件正确触发

### Q3: 时间序列图显示异常？
- 确保日期格式统一
- 检查数据是否按日期排序
- 确认日期范围选择正确

## 未来改进方向

1. **导出功能**: 支持导出统计报表为Excel/PDF
2. **对比分析**: 支持多个时间段对比
3. **自定义指标**: 允许用户自定义统计维度
4. **实时更新**: WebSocket实时推送最新数据
5. **权限控制**: 不同角色查看不同统计范围
6. **数据钻取**: 支持更深层次的数据探索
7. **预测分析**: 基于历史数据的趋势预测

## 联系方式

如有问题或建议，请联系开发团队。
