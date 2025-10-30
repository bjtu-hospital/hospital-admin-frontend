提示词1

```
下面将开发排班管理模块.我先向你介绍业务流程.
# 1.整体布局
首先是一个科室列表, 可以选择一个科室. 
点击后会加载这个科室的医生列表. (只需要名字即可)
然后在这个列表下面会显示,这个科室总的一个排班表. 

下面是分成三个小的页面(还是在本页中)
a. 科室排班表预览
n个下面的数据
星期x(年月日)(分成上下午和晚上三块. 每一块后面填入人员的名称.)
点击上面人员姓名时. 表中对应的人员名称颜色改变.

b. 门诊管理
可以新增一个门诊. 门诊需要选择类型 type(特需,国疗,普通)
并且加载每个门诊加载一个视图,显示最近1个月,每个门诊, 医生的排班情况

c. 医生数据
当点击上面的医生的名称的时候,这里会显示医生个人的排班信息(展示近一个月的).
在这个页面提供两个按钮, 新增和修改
修改可以修改某条记录的数据.
新增可以新增一条排班日程.
其中需要补全以下的字段:
日期(给一个日历选择)(最多只能排往后一个月的) 选择clinic(从当前科室已有的clinic中选择) 时段(上午下午晚上) 状态(默认正常,可选停诊) 选择类型(专家,普通) 价格(大于0小于10000) 
其中当clinic的type为特需的时候,医生type只能选特需
当clinic为国疗或者普通的时候, 可以选普通或者专家


下面我将为你提供数据库中,数据的表结构.
minor_department 表:
minor_dept_id major_dept_id name description create_time
1	1	心血管内科	负责高血压、冠心病、心力衰竭、心律失常等心血管疾病的诊疗与随访。	2025-10-16 08:24:36

doctor表:
doctor_id user_id dept_id name title specialty introduction photo_path original_photo_url create_time
1		1	陈明哲	教授、主任医师	冠心病，高血压病，心力衰竭，介入性心脏病学和激光医学的临床和研究工作。	陈明哲 基本情况 姓名：陈明哲 性别：男 学位：医学博士 毕业院校：北京医学院 专业：心血管内科 技术职称：教授、主任医师 导师资格：博士研究生导师 专业特长...	/static/images/doctor/doctor_1.jpg	https://puh3.net.cn/__local/7/E2/49/FA8BA1516AF62B02ED6A08CD96C_E9727E6B_8502.jpg?e=.jpg	2025-10-16 11:12:59


clinic表:
clinic_id area_id name address create_time minor_dept_id type ('门诊类型: 0-普通, 1-国疗, 2-特需';)
7	1	中央党校院区心血管内科门诊		2025-10-17 00:51:23	1 0

schedule表:
schedule_id doctor_id clinic_id date week_day time_section slot_type total_slots remaining_slots status create_time price
1	115	75	2025-10-26	7	上午	特需	0	0	停诊	2025-10-20 23:44:28	500.00


------------------------
由于当前没有后端的接口.和返回的数据
请你设计好需要的api接口,并且设计一下其返回的数据格式.
总的遵循一下的 数据填写在message中
{
    code: 0,
    message: {

    }
}

当code不为0时,表示错误(具体的错误码不需要定义了)
此时返回必为, 你只需要在代码中简单处理错误情况即可,不需要定义相关的内容了.
{
    code: code,
    message: {
        msg: string,
        error: string
    }
}

由于这个页面的功能比较复杂,我希望你可以分组件来写, 所有的内容位于schedule文件夹下. 
接口写在api文件夹下.

数据请你先试用mock数据. 单独创建一个schedule-mock.js用来加载测试数据.
```