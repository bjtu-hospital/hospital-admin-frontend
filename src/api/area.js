import axios from "./axios"

/**
 * 获取全部院区信息或根据ID获取单个院区
 * GET /admin/hospital-areas
 * GET /admin/hospital-areas?area_id={id}
 * @param {Object} params - 查询参数
 * @param {number} params.area_id - 院区ID（可选）
 * @returns {Promise}
 * Response: { code: 0, message: { areas: [...] } }
 */
export const getHospitalAreas = (params = {}) => {
    return axios.get("/admin/hospital-areas", { params })
}
