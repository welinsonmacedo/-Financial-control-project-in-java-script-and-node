const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('data'));


function readJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.trim() !== '' ? JSON.parse(content) : [];
  } catch (error) {
    console.error(`Error reading JSON file at ${filePath}:`, error);
    return [];
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/salvar', (req, res) => {
  const dadosLancamento = req.body;
  const caminhoArquivo = './src/data/DataExpense.json';
  
  let dadosExistente = readJSONFile(caminhoArquivo);

  dadosExistente.push(dadosLancamento);
  
  fs.writeFileSync(caminhoArquivo, JSON.stringify(dadosExistente, null, 2));
  
  res.json({ status: 'Dados salvos com sucesso.' });
});

app.get('/dados', (req, res) => {
  const caminhoArquivo = './src/data/DataExpense.json';
  
  try {
    const dados = readJSONFile(caminhoArquivo);
    res.json(dados);
  } catch (error) {
    console.error('Erro ao ler o arquivo JSON:', error);
    res.status(500).json({ error: 'Erro ao obter os dados.' });
  }
});

app.post('/lancar-entrada', (req, res) => {
  const valorEntrada = parseFloat(req.body.valorEntrada);
  const descricaoEntrada = req.body.descricaoEntrada;
  const dataEntrada = req.body.dataEntrada;

  if (isNaN(valorEntrada) || valorEntrada <= 0 || !descricaoEntrada || !dataEntrada) {
    res.status(400).json({ error: 'Entrada inválida. Certifique-se de fornecer uma data, um valor e uma descrição válidos.' });
    return;
  }

  const caminhoSaldos = './src/data/Saldo.json';

  try {
    let saldos = readJSONFile(caminhoSaldos);
    saldos.push({ data: dataEntrada, descricao: descricaoEntrada, valor: valorEntrada });
    const novoSaldo = saldos.reduce((total, entrada) => total + entrada.valor, 0);
    fs.writeFileSync(caminhoSaldos, JSON.stringify(saldos, null, 2));
    res.json({ status: 'Lançamento de entrada realizado com sucesso.', novoSaldo: novoSaldo });
  } catch (error) {
    console.error('Erro ao lançar entrada:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.get('/saldos', (req, res) => {
  const caminhoSaldo = './src/data/Saldo.json';

  try {
    let saldos = readJSONFile(caminhoSaldo);
    res.json(saldos);
  } catch (error) {
    console.error('Erro ao obter os saldos:', error);
    res.status(500).json({ error: 'Erro ao obter os saldos.' });
  }
});

const caminhoArquivo = './src/data/DataExpense.json';

app.put('/pagar-despesa/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let dadosExistente = readJSONFile(caminhoArquivo);

  if (dadosExistente[index]) {
    dadosExistente[index].pago = true;
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dadosExistente, null, 2));
    res.json({ status: 'Despesa paga com sucesso.' });
  } else {
    res.status(404).json({ error: 'Despesa não encontrada.' });
  }
});

app.get('/saldo-com-pagamentos', (req, res) => {
  try {
    const caminhoSaldos = './src/data/Saldo.json';
    const caminhoPagamentos = './src/data/DataExpense.json';

    let saldos = readJSONFile(caminhoSaldos);
    let pagamentos = readJSONFile(caminhoPagamentos);

    const somaEntradas = saldos.reduce((total, entrada) => total + Number(entrada.valor), 0);
    const somaItensPagos = pagamentos.reduce((total, pagamento) => (pagamento.pago ? total + Number(pagamento.valor) : total), 0);

    const saldoResultanteNumber = somaEntradas - somaItensPagos;
    res.json([{ somaEntradas, somaItensPagos, saldoResultanteNumber }]);
  } catch (error) {
    console.error('Erro ao calcular o saldo com pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.put('/dados/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const novaDespesa = req.body;
  let dadosExistente = readJSONFile(caminhoArquivo);

  if (index >= 0 && index < dadosExistente.length) {
    dadosExistente[index] = novaDespesa;
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dadosExistente, null, 2));
    res.json({ status: 'Despesa marcada como paga com sucesso.' });
  } else {
    res.status(400).json({ error: 'Índice de despesa inválido.' });
  }
});

app.post('/dados', (req, res) => {
  const novosDados = req.body;
  let dadosExistente = readJSONFile(caminhoArquivo);

  dadosExistente.push(novosDados);
  fs.writeFileSync(caminhoArquivo, JSON.stringify(dadosExistente, null, 2));
  res.json({ status: 'Dados salvos com sucesso.' });
});

app.delete('/dados/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let dadosExistente = readJSONFile(caminhoArquivo);

  if (index >= 0 && index < dadosExistente.length) {
    dadosExistente.splice(index, 1);
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dadosExistente, null, 2));
    res.json({ status: 'Despesa removida com sucesso.' });
  } else {
    res.status(400).json({ error: 'Índice de despesa inválido.' });
  }
});

const caminhoArquivoSaldos = './src/data/Saldo.json';

app.delete('/saldos/:index', (req, res) => {
  const index = parseInt(req.params.index);
  let saldosExistente = readJSONFile(caminhoArquivoSaldos);

  if (isNaN(index) || index < 0 || index >= saldosExistente.length) {
    res.status(400).json({ error: 'Índice de saldo inválido.' });
    return;
  }

  if (index >= 0 && index < saldosExistente.length) {
    saldosExistente.splice(index, 1);
    fs.writeFileSync(caminhoArquivoSaldos, JSON.stringify(saldosExistente, null, 2));
    res.json({ status: 'Saldo deletado com sucesso.' });
  } else {
    res.status(400).json({ error: 'Índice de saldo inválido.' });
  }
});

app.put('/saldos/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const novoSaldo = req.body;
  let saldosExistente = readJSONFile(caminhoArquivoSaldos);

  if (index >= 0 && index < saldosExistente.length) {
    saldosExistente[index] = novoSaldo;
    fs.writeFileSync(caminhoArquivoSaldos, JSON.stringify(saldosExistente, null, 2));
    res.json({ status: 'Saldo editado com sucesso.' });
  } else {
    res.status(400).json({ error: 'Índice de saldo inválido.' });
  }
});

app.get('/saldo-atual', (req, res) => {
  try {
    const caminhoSaldos = './src/data/Saldo.json';
    const caminhoPagamentos = './src/data/DataExpense.json';

    let saldos = readJSONFile(caminhoSaldos);
    let pagamentos = readJSONFile(caminhoPagamentos);

    const somaEntradas = saldos.reduce((total, entrada) => total + Number(entrada.valor), 0);
    const somaItensPagos = pagamentos.reduce((total, pagamento) => (pagamento.pago ? total + Number(pagamento.valor) : total), 0);

    const saldoResultanteNumber = somaEntradas - somaItensPagos;

    res.json({ saldoAtual: saldoResultanteNumber });
  } catch (error) {
    console.error('Erro ao calcular o saldo atual:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
