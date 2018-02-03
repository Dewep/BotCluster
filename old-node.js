function req(path, data) {
    return new Promise(resolve => {
        let body = data && JSON.stringify(data)
        let options = {
            hostname: 'ks.dewep.net',
            port: 1423,
            path: path
        }
        let callback = (res) => {
            let data = ''
            res.on('data', (chunk) => { data += chunk })
            res.on('end', () => {
                resolve(JSON.parse(data))
            })
        }
        if (data) {
            options['method'] = 'POST'
            options['headers'] = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
            let request = require('http').request(options, callback)
            request.write(body)
            request.end()
        } else {
            require('http').get(options, callback)
        }
    })
}

let project = process.argv.length > 2 && process.argv[2]

if (!project) {

    req('/').then(data => {
        console.log(JSON.stringify(data, true, 2))
    })

} else if (process.argv.length > 3 && process.argv[3] == "retry") {

    req('/script/' + project).then(data => {
        eval(data.script)

        req('/').then(data => {
            Promise.all(data[project].good.map(script)).then(res => {
                let workRes = {good: [], bad: []}
                for (let i = 0; i < data[project].good.length; i++) {
                    if (res[i] === true) {
                        workRes.good.push(data[project].good[i])
                    } else {
                        workRes.bad.push(data[project].good[i])
                    }
                }
                req('/work/' + project, workRes).then(() => {
                    process.exit()
                })
            }).catch(err => {
                console.error('ERROR', err)
            })
        })
    })

} else {

    req('/script/' + project).then(data => {
        eval(data.script)

        function newWork() {
            req('/work/' + project).then(codes => {
                if (codes.length == 0) {
                    process.exit()
                }
                Promise.all(codes.map(script)).then(res => {
                    let workRes = {good: [], bad: []}
                    for (let i = 0; i < codes.length; i++) {
                        if (res[i] === true) {
                            workRes.good.push(codes[i])
                        } else {
                            workRes.bad.push(codes[i])
                        }
                    }
                    req('/work/' + project, workRes).then(newWork)
                }).catch(err => {
                    console.error('ERROR', err)
                })
            })
        }
        newWork()
    })

}
