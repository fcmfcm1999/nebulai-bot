const {submitTask, queryUserInfo} = require('./apis/nebulaiApi.js')
const {calculateResult} = require('./matrix.js')

async function main() {
    const token = process.env.NEBULAI_TOKEN
    console.log(token)
    return 
    let result1 = ''
    let result2 = ''
    let taskId = ''
    let count = 0
    while (true) {
        const data = await submitTask(result1, result2, taskId, token)
        if (data.calc_status) {
            console.log('Submit task successfully / 任务计算提交成功')
            console.log('Start to calculate next task / 开始下一轮计算')
            if (count % 10 === 0) {
                const userInfo = await queryUserInfo(token)
                console.log(`Account ${userInfo.email} has mined ${finish_point} now`)
            }
            count = count + 1
        }
        
        const res = await calculateResult(data.seed1, data.seed2, data.matrix_size)
        result1 = res[0] + ""
        result2 = res[1] + ""
        taskId = data.task_id
    }
}

main()
