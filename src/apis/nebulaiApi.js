const axios = require('axios')

async function submitTask(result1, result2, taskId, token) {
    const url = 'https://nebulai.network/open_compute/finish/task'

    const headers = {
        Referer: 'https://nebulai.network/_next/static/chunks/7611.48499b61fe0d9727.js',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        token: token,
    }

    const data = {
        result_1: result1,
        result_2: result2,
        task_id: taskId,
    }

    try {
        const response = await axios.post(url, data, { headers })
        if (response.status === 200) {
            return response.data.data
        } else {
            throw new Error('failed to call api')
        }
    } catch (error) {
        throw error
    }
}

async function queryUserInfo(token) {
    const url = 'https://nebulai.network/open_compute/get/user_info'

    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        token: token,
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        priority: 'u=1, i',
        referer: 'https://nebulai.network/opencompute',
        'sec-ch-ua': '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
    }


    try {
        const response = await axios.get(url, { headers })
        if (response.status === 200) {
            return response.data.data
        } else {
            throw new Error('failed to call api')
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    submitTask,
    queryUserInfo
}
