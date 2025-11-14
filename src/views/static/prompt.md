提示词1:

```
下面你将要开发科室信息统计页面.
你需要将医院的统计信息绘制成图表,进行可视化的分析.
请你至少提供下面的统计图. 
1.整个医院当天总的挂号数量.
2.每个分院当天总的挂号数量.
3.每个科室当天总的挂号数量.
4.每个医生当天总的挂号数量.
5.医院-科室最近7(30)天的挂号数量折线图.
其中上面的结构应该是层级式的. (因为分类越来越细), 比如点击医院, 获取有哪几个分院, 并且显示他们的总计图.
点击医院就进入科室选择页面(没有院区选择)
点击科室,就进入医生选择页面......具体请你合理的进行布局设计.
下面提供一些基础的接口:
参见"管理API文档"
-----
当前没有关于统计图API相关的文档.请你写好对应的接口,和接口说明.
请分组件来进行设计页面. 

```


提示词2:
```
补充一下,现在请你使用mock数据进行演示. 
请创建一个mock.js文件来存放生成的mock数据. 可以通过bool值自由切换使用mock还是真实的api接口.
```

提示词3:
```
1.为什么没有科室,和医生对应的统计?
2.没有适配暗色主题
```

提示词4:
```
1.平均挂号量删掉. 增加 --> 已经就诊完成的数量 (记得更新一下接口和对应的文档)不需要总结文档 
```




提示词5:









```
1.将快速导航的医院概览删去.
点击科室统计的时候,应该调用接口2.6 获取小科室列表
GET /minor-departments?major_dept_id={major_dept_id}
参数 major_dept_id 可选，用于按大科室过滤
响应（包含价格信息）：

{
    "code": 0,
    "message": {
        "departments": [
            {
                "minor_dept_id": 1,
                "major_dept_id": 1,
                "name": "心内科",
                "description": "心脏内科",
                "default_price_normal": 60.00,
                "default_price_expert": null,
                "default_price_special": 550.00,
                "create_time": "2024-01-01T10:00:00"
            },
            // ... 其他小科室
        ]
    }
}

获取科室的列表,然后呈现.
医生的话, 则应该点击医生统计:
调用这个接口. 来获取全部的医生(params,直接获取全部医生)
3.2 获取医生列表
GET /doctors?dept_id={dept_id}&name={name}
参数：
dept_id (可选)：按科室 ID 过滤
name (可选)：按医生姓名模糊搜索
请求示例：

GET /doctors?name=张
GET /doctors?dept_id=1&name=王
响应（包含价格信息）：

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
                "is_registered": true,
                "default_price_normal": 80.00,
                "default_price_expert": null,
                "default_price_special": 888.00,
                "create_time": "2024-01-01T10:00:00"
            },
            // ... 其他医生
        ]
    }
}
字段说明：

is_registered：布尔值，表示该医生是否已在系统中有可用的用户账号。严格判定规则为：
doctor.user_id 不为空且能在 User 表中找到对应记录；
对应的 User.is_active 为 True；
对应的 User.is_deleted 为 False（即未被软删除）。
default_price_normal/expert/special：三种号源的价格配置，null 表示该层级未配置
示例中 is_registered: true 表示张三已有激活且未删除的用户账号；若医生档案存在但未创建账号或账号被停用/删除，则该字段为 false。


```





```
1.快速导航中的内容"选择科室""选择医生", 应该是在进入页面的时候就开始加载的,这两个的地方的数据应该是持续存储的,而不是每次点击都重新请求. 
2.这个快速导航页面的选择有bug,当点击医生统计的时候,显示选中的是"科室统计".
3.需要支持空的返回内容. 当返回的请求code为0的时候,说明正常请求了. 但是数据可能为空的.
4.请你根据所给的统计相关的api和样例数据,重新整理一下前端的展示页面.
```