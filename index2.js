const fs = require('fs')

fs.readFile('./full-bkp.txt', (err, data) => {
    const dataWithText = data.toString()

    const allLines = dataWithText.split('\n')

    const listCallIdLines = allLines.filter(l => l.includes("Call ID: ["))
    const listVerboses = listCallIdLines.map(l => l.substring(30, 37))

    if (listVerboses.length > 0) {
        const verbose = listVerboses[0]

        const historic = allLines.filter(l => l.includes(verbose))
        
        fs.writeFile('out-historic.txt', historic.join('\n\n'), () => {

        })
    }

})