let { contas, depositos, saques, transferencias } = require('../bancodedados');
const { format } = require('date-fns');

const depositar = (req, res) => {
    const { valor, numero_conta } = req.body;

    if (valor === undefined || !numero_conta) {
        return res.json({ mensagem: 'O numero da conta e o valor devem ser informados!' });
    }

    const contaEncontrada = contas.find(conta => conta.numero === Number(numero_conta));

    if (!contaEncontrada) {
        return res.status(404).json({ mensagem: 'Conta inexistente' });
    }

    if (isNaN(valor) || valor <= 0) {
        return res.status(400).json({ mensagem: 'O valor deve ser um número maior que 0' });
    }

    contaEncontrada.saldo += valor

    const registro = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta,
        valor
    }

    depositos.push(registro);

    return res.status(201).send();
}

const sacar = (req, res) => {
    const {numero_conta, valor, senha } = req.body;
    
    if (!numero_conta || !valor || !senha) {
        return res.json({mensagem: "O numero da conta, a senha e o valor são obrigatórios!"});
    }

    const contaExistente = contas.find(conta => conta.numero === Number(numero_conta));

    if (!contaExistente) {
        return res.status(404).json({mensagem: "conta não encontrada"});
    }

    if (contaExistente.usuario.senha !== senha) {
        return res.status(400).json({mensagem: "Senha incorreta"});
    }

    if (contaExistente.saldo < valor) {
        return res.status(403).json({mensagem: "Saldo insuficiente"});
    }

    contaExistente.saldo -= valor;

    const registro = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta,
        valor
    }

    saques.push(registro);

    return res.status(201).send();
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino | !valor || !senha) {
        return res.status(400).json({mensagem: "O numero da conta, a senha e o valor são obrigatórios"});
    }

    const contaOrigem = contas.find(conta => conta.numero === Number(numero_conta_origem));

    if (!contaOrigem) {
        return res.staus(404).json({mensagem: "Conta de Origem não encontrada"})
    }

    const contaDestino = contas.find(conta => conta.numero === Number(numero_conta_destino));

    if (!contaDestino) {
        return res.staus(404).json({mensagem: "Conta de Destino não encontrada"});
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(400).json({mensagem: "Senha incorreta"});
    }

    if (contaOrigem.saldo < valor) {
        return res.status(403).json({mensagem: "Saldo insuficiente"});
    }

    contaOrigem.saldo -= valor;

    contaDestino.saldo += valor;

    const registro = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    transferencias.push(registro);

    return res.status(201).send();

}

module.exports = {
    depositar,
    sacar,
    transferir
}