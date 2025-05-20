const { submitTask, queryUserInfo, getComputeToken } = require('./apis/nebulaiApi.js')
const { calculateResult } = require('./matrix.js')
require('dotenv').config()

function isTokenExpired(token) {
    if (!token) {
        return true
    }
    try {
        const payloadBase64 = token.split('.')[1]
        const decodedPayload = Buffer.from(payloadBase64, 'base64').toString()
        const payload = JSON.parse(decodedPayload)
        if (payload.exp) {
            // exp is in seconds, Date.now() is in milliseconds
            return payload.exp * 1000 < Date.now()
        }
        return false // No exp claim, assume not expired or handle as error
    } catch (error) {
        console.error('Error decoding or parsing token:', error)
        return true // Treat errors as expired to be safe
    }
}

async function main() {
    const token = process.env.TOKEN
    let jwtToken = process.env.JWT_TOKEN
    let result1 = ''
    let result2 = ''
    let taskId = ''
    let count = 0
    while (true) {
        if (isTokenExpired(jwtToken)) {
            jwtToken = await getComputeToken(token)
        }
        const data = await submitTask(result1, result2, taskId, jwtToken)
        if (data.calc_status) {
            console.log('Submit task successfully / 任务计算提交成功')
            console.log('Start to calculate next task / 开始下一轮计算')
            if (count % 10 === 0) {
                const userInfo = await queryUserInfo(jwtToken)
                console.log(`Account ${userInfo.email} has mined ${userInfo.finish_point} now`)
            }
            count = count + 1
        }

        const res = await calculateResult(data.seed1, data.seed2, data.matrix_size)
        result1 = res[0] + ''
        result2 = res[1] + ''
        taskId = data.task_id
    }
}

main()
