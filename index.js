const fs = require('fs')
// const axios = require('axios')

fs.readFile('./full-bkp.txt', (err, data) => {
    const dataWithText = data.toString()

    const allLines = dataWithText.split('\n')

    const listCallIdLines = allLines.filter(l => l.includes("Call ID: ["))
    const listVerboses = listCallIdLines.map(l => l.substring(30, 37))

    console.log(`${listCallIdLines.length} ligações encontradas`)

    listVerboses.forEach(verbose => {
        // console.log(`---=== VERBOSE ${verbose} ===---`)

        let interaction = {
            uniqueid: '', // id da chamada
            date: '', // data e hora da chamada
            clientNumber: '', // numero de telefono do cliente
            cpf: '', // documento do cliente
            cardNumber: '', // numero do cartão do cliente se informado
            cardType: '', // tipo do cartão VT ou EXPRESSO
            protocol: '', // numero de protocolo caso gerado
            type: '' // tipo de fila na qual o usuario entrou
        }

        // BUSCANDO HISTORICO DE LIGAÇÃO ATRAVEZ DO VERBOSE
        const historic = allLines.filter(l => l.includes(verbose))

        // BUSCANDO UNIQUEID
        const uniqueIdLine = historic.find(h => h.includes('Call ID: ['))
        if (uniqueIdLine != null) {
            const [first, secound] = uniqueIdLine.split('"-- ')
            interaction.uniqueid = secound.replace('Call ID: [', '').replace('] --") in new stack', '')
        }

        // BUSCANDO DATA DA CHAMADA
        const callDateLine = historic.length > 0 ? historic[0] : null
        if (callDateLine != null) {
            interaction.date = callDateLine.substring(1, 20)
        }

        // BUSCANDO NUMERO DE TELEFONE DO CLIENTE
        const clientNumberLine = historic.find(h => h.includes('-- From: ["" <'))
        if (clientNumberLine != null) {
            const [first, secound] = clientNumberLine.split('"-- ')
            interaction.clientNumber = secound.replace('From: ["" <', '').replace('>] --") in new stack', '')
        }

        // BUSCANDO DOCUMENTO DO CLIENTE
        const indexAudioDocumentLine = historic.findIndex(h => h.includes("Playing 'ivr/Riocard//ura_VALORADO/ValidadorCPF_01CPFDigitado_02.slin' (language 'pt-BR')"))
        if (indexAudioDocumentLine >= 0) {
            for (let index = indexAudioDocumentLine; index <= historic.length; index++) {
                if (interaction.cpf)
                    continue;

                let line = historic[index]

                if (line != null && line.includes("app_read.c: User entered '")) {
                    const [first, secound] = line.split("'")
                    if (secound != null) {
                        interaction.cpf = secound.replace("'", "")
                    }
                }
            }
        }
        
        if (!interaction.cpf)
            interaction.cpf = '---'
        
        // BUSCANDO CARTAO DO CLIENTE
        // CHAMAR API DA EVALIZE PASSANDO O CPF COLETADO NA URA CASO ENCONTRADO
        // ATRAVEZ DA API DA VOCE CONSEGUIRA O NUMERO DE CARTÃO DO CLIENTE
        // O ENDPOINT SE CHAMA CHECKCLIENT

        // BUSCANDO TIPO DO CARTAO
        if (interaction.cardNumber && interaction.cardNumber != "---") {
            const firstDigits = interaction.cardNumber.substring(0, 4)

            if (firstDigits === "0104" || firstDigits === "0117")
                interaction.cardType = "VT"
            else
                interaction.cardType = "EXPRESSO"
        }

        if (!interaction.cardNumber)
            interaction.cardType = "---"

        // VER COM OS MENINOS (TIME DE DELIVERY) COMO CAPURAMOS O NUMERO DE PROTOCOLO NO LOG DO ASTERISK

        const isValorado = historic.filter(h => h.includes("ivr-riocard-valorado"))
        const isGratuidade = historic.filter(h => h.includes("ivr-riocard-gratuidade"))

        if(isValorado.length > 0) {
            interaction.type = "RCardCRRValorado"
        } else if (isGratuidade.length > 0) {
            interaction.type = "RCardCRRGratuidade"
        } else {
            interaction.type = "RCardFaleOnibus"
        }

        console.log(interaction)

        // APOS BUSCAR TODOS OS DADOS REALIZAR A CHAMADA DA API DE CREATE INTEGRACTION DA API DE REPORTS
        // axios.post("REPORT URL API" + "/interaction", interaction, {
        //     header: {
        //         'Authorization': 'Bearer TOKEN'
        //     }
        // })


    });

})