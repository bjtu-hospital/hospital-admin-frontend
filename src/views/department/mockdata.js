export const useMockData = (bool) => {
    if (!bool) return;
    // 模拟更多数据以测试分页效果
    majorDepartments.value = [
        { major_dept_id: 1, name: '内科', description: '内科相关科室，包括心血管、呼吸、消化等' },
        { major_dept_id: 2, name: '外科', description: '外科相关科室，包括普外、骨科、神外等' },
        { major_dept_id: 3, name: '妇产科', description: '妇产科相关科室，提供妇科和产科服务' },
        { major_dept_id: 4, name: '儿科', description: '儿科相关科室，专注儿童健康' },
        { major_dept_id: 5, name: '五官科', description: '五官科相关科室，包括眼科、耳鼻喉等' },
        { major_dept_id: 6, name: '急诊科', description: '急诊相关科室，提供急救服务' },
        { major_dept_id: 7, name: '中医科', description: '中医相关科室，提供传统中医服务' }
    ]

    minorDepartments.value = [
        // 内科
        { minor_dept_id: 1, major_dept_id: 1, name: '心血管内科', description: '诊治各种心血管疾病，如高血压、冠心病、心律失常等' },
        { minor_dept_id: 2, major_dept_id: 1, name: '呼吸内科', description: '诊治呼吸系统疾病，如哮喘、慢阻肺、肺炎等' },
        { minor_dept_id: 3, major_dept_id: 1, name: '消化内科', description: '诊治消化系统疾病，如胃炎、肝炎、胰腺炎等' },
        { minor_dept_id: 4, major_dept_id: 1, name: '神经内科', description: '诊治神经系统疾病，如脑卒中、癫痫、帕金森等' },
        { minor_dept_id: 5, major_dept_id: 1, name: '内分泌科', description: '诊治内分泌疾病，如糖尿病、甲状腺疾病等' },
        { minor_dept_id: 6, major_dept_id: 1, name: '肾内科', description: '诊治肾脏疾病，如肾炎、肾衰竭等' },
        { minor_dept_id: 7, major_dept_id: 1, name: '血液内科', description: '诊治血液系统疾病，如贫血、白血病等' },
        { minor_dept_id: 8, major_dept_id: 1, name: '风湿免疫科', description: '诊治风湿免疫性疾病，如类风湿、红斑狼疮等' },

        // 外科
        { minor_dept_id: 9, major_dept_id: 2, name: '普通外科', description: '提供普通外科手术，如阑尾炎、疝气等' },
        { minor_dept_id: 10, major_dept_id: 2, name: '骨科', description: '诊治骨骼及关节相关疾病，提供骨折、关节置换等手术' },
        { minor_dept_id: 11, major_dept_id: 2, name: '神经外科', description: '提供神经外科手术，如脑肿瘤、脑出血等' },
        { minor_dept_id: 12, major_dept_id: 2, name: '心胸外科', description: '提供心脏和胸部手术，如心脏搭桥、肺癌等' },
        { minor_dept_id: 13, major_dept_id: 2, name: '泌尿外科', description: '诊治泌尿系统疾病，如肾结石、前列腺疾病等' },
        { minor_dept_id: 14, major_dept_id: 2, name: '肝胆外科', description: '提供肝胆手术，如胆囊炎、肝癌等' },
        { minor_dept_id: 15, major_dept_id: 2, name: '血管外科', description: '诊治血管疾病，如静脉曲张、动脉瘤等' },

        // 妇产科
        { minor_dept_id: 16, major_dept_id: 3, name: '妇科', description: '诊治妇科疾病，如妇科炎症、肿瘤等' },
        { minor_dept_id: 17, major_dept_id: 3, name: '产科', description: '提供产前产后护理，孕期检查和分娩服务' },
        { minor_dept_id: 18, major_dept_id: 3, name: '计划生育科', description: '提供计划生育相关服务' },
        { minor_dept_id: 19, major_dept_id: 3, name: '生殖医学科', description: '诊治不孕不育，提供辅助生殖技术' },

        // 儿科
        { minor_dept_id: 20, major_dept_id: 4, name: '儿内科', description: '诊治儿童内科疾病，如感冒、肺炎等' },
        { minor_dept_id: 21, major_dept_id: 4, name: '儿外科', description: '提供儿童外科手术服务' },
        { minor_dept_id: 22, major_dept_id: 4, name: '新生儿科', description: '专注新生儿护理和疾病治疗' },
        { minor_dept_id: 23, major_dept_id: 4, name: '儿童保健科', description: '提供儿童健康检查和预防接种服务' },

        // 五官科
        { minor_dept_id: 24, major_dept_id: 5, name: '眼科', description: '诊治眼部疾病，如白内障、青光眼、近视等' },
        { minor_dept_id: 25, major_dept_id: 5, name: '耳鼻喉科', description: '诊治耳鼻喉疾病，如中耳炎、鼻炎、咽炎等' },
        { minor_dept_id: 26, major_dept_id: 5, name: '口腔科', description: '诊治口腔疾病，提供牙科服务' },
        { minor_dept_id: 27, major_dept_id: 5, name: '皮肤科', description: '诊治皮肤疾病，如湿疹、痤疮等' },

        // 急诊科
        { minor_dept_id: 28, major_dept_id: 6, name: '急诊内科', description: '提供内科急救服务' },
        { minor_dept_id: 29, major_dept_id: 6, name: '急诊外科', description: '提供外科急救服务' },
        { minor_dept_id: 30, major_dept_id: 6, name: 'ICU重症监护', description: '提供重症患者监护和治疗' },

        // 中医科
        { minor_dept_id: 31, major_dept_id: 7, name: '中医内科', description: '提供中医内科诊疗服务' },
        { minor_dept_id: 32, major_dept_id: 7, name: '针灸科', description: '提供针灸、推拿等中医理疗服务' },
        { minor_dept_id: 33, major_dept_id: 7, name: '中医康复科', description: '提供中医康复治疗服务' }
    ]
}
