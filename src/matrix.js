function genereateMatrix(seed, size) {
    let m = Array(size),
        n = new Float64Array(size)
    for (let r = 0; r < size; r++) {
        m[r] = n
        for (let n = 0; n < size; n++)
            (m[r][n] = (function (t) {
                let e = BigInt(0x4b72e682d),
                    a = BigInt(0x2675dcd22)
                return Number((e * BigInt(t) + a) % BigInt(1e3))
            })(seed)),
                (seed = m[r][n])
    }
    return m
}

async function calculateHash(t, e) {
    let a = ''
    for (let n = 0; n < e; n++) for (let r = 0; r < e; r++) a += t[n][r]
    return await n(a, 1e7)
}

async function n(t, e) {
    let a = new TextEncoder().encode(t)
    return Number(
        BigInt(
            '0x' +
                Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', a)))
                    .map((t) => t.toString(16).padStart(2, '0'))
                    .join('')
        ) % BigInt(e)
    )
}

function multiple(t, e, a) {
    let n = Array(a),
        r = new Float64Array(a)
    for (let s = 0; s < a; s++) {
        n[s] = r
        for (let r = 0; r < a; r++) {
            let o = 0
            for (let n = 0; n < a; n++) o += t[s][n] * e[n][r]
            n[s][r] = o
        }
    }
    return n
}

async function calculateResult(seed1, seed2, seedSize) {
    const startDate = Date.now()
    const martix1 = genereateMatrix(seed1, seedSize)
    const martix2 = genereateMatrix(seed2, seedSize)
    const res = multiple(martix1, martix2, seedSize)

    const hash = await calculateHash(res, seedSize)

    const endDate = Date.now()
    const result1 = startDate / hash 
    const result2 = hash / (endDate - startDate)

    return [result1, result2]
}

module.exports = {
    calculateResult
}

