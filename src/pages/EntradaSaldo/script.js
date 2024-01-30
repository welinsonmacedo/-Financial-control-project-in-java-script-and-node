async function lancarEntrada() {
    const valorEntrada = document.getElementById('valorEntrada').value;
    const descricaoEntrada = document.getElementById('descricaoEntrada').value;
    const dataEntrada = document.getElementById('dataEntrada').value;
  
    if (!valorEntrada || isNaN(valorEntrada)) {
        alert('Por favor, insira um valor válido de entrada.');
        return;
    }
    if (!descricaoEntrada) {
        alert('Por favor, insira uma descrição válida de entrada.');
        return;
    }
    if (!dataEntrada) {
        alert('Por favor, insira uma descrição válida de entrada.');
        return;
    }

    try {
       
        const resposta = await fetch('http://localhost:3000/lancar-entrada', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ valorEntrada, descricaoEntrada,dataEntrada })
        });

        const resultado = await resposta.json();

       
        alert(resultado.status);

      
        carregarSaldos();

    } catch (error) {
        console.error('Erro ao lançar entrada:', error);
    }
}





let saldosExistente;



async function editarSaldo(index) {
    try {
        // Certifique-se de que o índice seja um número e esteja dentro dos limites do array
        if (!isNaN(index) && index >= 0 && index < saldosExistente.length) {
            const saldoParaEditar = saldosExistente[index];



            const novaData = prompt('Informe uma nova data:', saldoParaEditar.data);
            if (novaData === null) {
                // O usuário cancelou a operação
                return;
            }
            // Abra prompts ou modais para que o usuário possa inserir os novos valores do saldo
            const novoValor = prompt('Informe o novo valor do saldo:', saldoParaEditar.valor);
            if (novoValor === null) {
                // O usuário cancelou a operação
                return;
            }
            const novaDescricao = prompt('Informe a nova descrição do saldo:', saldoParaEditar.descricao);
            if (novaDescricao === null) {
                // O usuário cancelou a operação
                return;
            }

            // Faça a solicitação para o servidor atualizar o saldo
            const resposta = await fetch(`http://localhost:3000/saldos/${index}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data:novaData,descricao: novaDescricao, valor: parseFloat(novoValor) }),
            });

            const resultado = await resposta.json();
            alert(resultado.status);

            // Atualize a tabela de saldos após a edição
            carregarSaldos();
        } else {
            console.error('Índice de saldo inválido para edição.');
        }
    } catch (error) {
        console.error('Erro ao editar saldo:', error);
    }
}

// Função para carregar e exibir os saldos na tabela
async function carregarSaldos() {
    try {
        const resposta = await fetch('http://localhost:3000/saldos');
        saldosExistente = await resposta.json();

        const tabelaSaldos = document.getElementById('tabelaSaldos');
        tabelaSaldos.innerHTML = ''; // Limpar conteúdo anterior

        // Cabeçalho da tabela
        const cabecalho = tabelaSaldos.createTHead();
        const linhaCabecalho = cabecalho.insertRow();
        const celulaCabecalhoData = linhaCabecalho.insertCell(0);
        const celulaCabecalhoDescricao = linhaCabecalho.insertCell(1);
        const celulaCabecalhoValor = linhaCabecalho.insertCell(2);
        const celulaCabecalhoAcao = linhaCabecalho.insertCell(3);
        celulaCabecalhoData.textContent='Data'
        celulaCabecalhoDescricao.textContent = 'Descrição';
        celulaCabecalhoValor.textContent = 'Valor (R$)';
        celulaCabecalhoAcao.textContent = 'Ação';

        // Corpo da tabela
        const corpoTabela = tabelaSaldos.createTBody();

        saldosExistente.forEach((saldo, index) => {
            const linha = corpoTabela.insertRow();

            // Certifique-se de que os valores necessários estejam presentes antes de acessá-los
            const descricao = saldo.descricao || '';
            const valor = typeof saldo.valor === 'number' ? saldo.valor.toFixed(2) : 0;
            const data = saldo.data || '';
            // Preencher as células da linha
            const celulaData = linha.insertCell(0)
            const celulaDescricao = linha.insertCell(1);
            const celulaValor = linha.insertCell(2);
            const celulaAcao = linha.insertCell(3);
            celulaData.textContent=data
            celulaDescricao.textContent = descricao;
            celulaValor.textContent = valor;

            // Adicionar botões de editar e deletar
            const botaoEditar = document.createElement('button');
            botaoEditar.textContent = 'Editar';
            botaoEditar.addEventListener('click', () => editarSaldo(index));
            celulaAcao.appendChild(botaoEditar);

            const botaoDeletar = document.createElement('button');
            botaoDeletar.textContent = 'Deletar';
            botaoDeletar.addEventListener('click', () => deletarSaldo(index));
            celulaAcao.appendChild(botaoDeletar);
        });

    } catch (error) {
        console.error('Erro ao carregar os saldos:', error);
    }
}

// Função para deletar um saldo
async function deletarSaldo(index) {
    try {
        const resposta = await fetch(`http://localhost:3000/saldos/${index}`, {
            method: 'DELETE',
        });

        const resultado = await resposta.json();
        alert(resultado.status);

        // Atualize a tabela de saldos após a remoção
        carregarSaldos();
    } catch (error) {
        console.error('Erro ao deletar saldo:', error);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
      const resposta = await fetch('http://localhost:3000/saldo-atual');
      const resultado = await resposta.json();

      const saldoAtualElemento = document.getElementById('saldo-atual');
      saldoAtualElemento.innerHTML = resultado.saldoAtual.toFixed(2); // Formatando como número de ponto flutuante com 2 casas decimais
    } catch (error) {
      console.error('Erro ao obter o saldo atual:', error);
    }
  });

// Chame a função para carregar os saldos ao carregar a página
carregarSaldos();



