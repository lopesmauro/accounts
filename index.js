import inquirer from 'inquirer'
import chalk from 'chalk'
import fs from 'fs'

function operation(){
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Criar Conta','Consultar Saldo','Depositar', 'Sacar','Sair']
        },
    ])
    .then(answer => {
        const action = answer['action']
        if(action === 'Criar Conta'){
            createAccount()
        } else if(action === 'Consultar Saldo'){
            getAccountBalance()
        } else if(action === 'Depositar'){
            deposit()
        } else if(action === 'Sacar'){
            withdraw()
        } else if(action === 'Sair'){
            exit()
        }
    })
    .catch(err => console.log(err))
}

function createAccount(){
    console.log(chalk.bgGreen.black('Obrigado por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:'
        }
    ]).then(answer => {
        const accountName = answer['accountName']
        console.log(accountName)

        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts')
        }
        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome!'))
            buildAccount()
            return
        }
        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}')

        console.log(chalk.green('Conta criada com sucesso!'))
        operation()

    }).catch(err => console.log(err))
}

function exit(){
    console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
    process.exit()
}

function deposit(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then(answer => {
        const accountName = answer['accountName']
        if(!checkAccount(accountName)){
            deposit()
            return
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ]).then(answer => {
            const amount = answer['amount']

            addAmount(accountName, amount)

            operation()
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))
}

function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Esta conta não existe, tente novamente!'))
        return false
    }
    return true
}
function addAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log('Ocorreu um erro!')
        deposit()
        return
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)  
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => console.log(err))
    console.log(chalk.green(`Foi depositado o valor de $${amount} em sua conta!`))
}
function getAccount(accountName){
    const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })
    return JSON.parse(accountJson)
}

function getAccountBalance(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Deseja consultar o saldo de qual conta?'
        }
    ]).then(answer =>{
        const accountName = answer['accountName']
        if(!checkAccount(accountName)){
            getAccountBalance()
            return
        }
        const accountData = getAccount(accountName)
        console.log(chalk.bgBlue.black(`Seu saldo atual é $${accountData.balance}`))
        operation()
    })
    .catch(err => console.log(err))
}

function withdraw(){

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Deseja efetuar o saque de qual conta da sua conta?'
        }
    ]).then(answer => {
        const accountName = answer['accountName']
        if(!checkAccount(accountName)){
            deposit()
            return
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ]).then(answer => {
            const amount = answer['amount']

            removeAmount(accountName, amount)

            operation()
        }).catch(err => console.log(err))

    }).catch(err => console.log(err))

}
function removeAmount(accountName, amount){

    const accountData = getAccount(accountName)
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro!'))
        withdraw()
        return
    }
    if(amount > accountData.balance){
        console.log(chalk.bgRed.black('Valor inválido!'))
        withdraw()
        return
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount) 
    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), (err) => console.log(err))
    console.log(chalk.green(`Foi efetuado saque no valor de $${amount}!`))

}
operation()