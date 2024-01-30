async function carregarDados() {
  try {
    const resposta = await fetch("http://localhost:3000/dados");
    const dados = await resposta.json();

    const tabelaDados = document.getElementById("tabela-dados");
    const tbody = tabelaDados.querySelector("tbody");
    tbody.innerHTML = "";

    if (Array.isArray(dados)) {
      dados.forEach((dado, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${dado.descricao}</td>
                    <td>${
                      Array.isArray(dado.categoria)
                        ? dado.categoria[1]
                        : dado.categoria
                    }</td>
                    <td>${dado.dataVencimento}</td>
                    <td> ${formatarDinheiro(dado.valor)}</td>
                    <td>
                    ${dado.pago
                      ? `<button onclick="desfazerPagamento(${index})">Desfazer Pagamento</button>`
                      : `<button onclick="pagarDespesa(${index})">Pagar</button>`}
                    <button onclick="apagarDespesa(${index})">Delete</button>
  
</td>
                `;
        tbody.appendChild(tr);
      });
    } else {
      // Se não for um array, exiba uma mensagem ou lide com os dados de outra maneira
      console.error("Os dados não são um array:", dados);
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  }
}
carregarDados();
function formatarDinheiro(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

async function pagarDespesa(index) {
  try {
    const resposta = await fetch("http://localhost:3000/dados");
    const dados = await resposta.json();
    const tabelaDados = document.getElementById("tabela-dados");
    const tbody = tabelaDados.querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");

    // Verifique se o índice está dentro dos limites do array
    if (index >= 0 && index < dados.length) {
      const despesaPaga = dados[index];

      // Adicione uma verificação para garantir que a despesa não foi paga anteriormente
      if (!despesaPaga.pago) {
        // Marque a despesa como paga
        despesaPaga.pago = true;

        // Atualize a entrada no servidor
        await fetch(`http://localhost:3000/dados/${index}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(despesaPaga),
        });

        // Atualize a tabela no front-end
        const despesaPagatext = "Pago";
        const row = rows[index];
        row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${despesaPaga.descricao}</td>
                    <td>${
                      Array.isArray(despesaPaga.categoria)
                        ? despesaPaga.categoria[1]
                        : despesaPaga.categoria
                    }</td>
                    <td>${despesaPaga.dataVencimento}</td>
                    <td>${formatarDinheiro(despesaPaga.valor)}</td>
                    <td>${despesaPagatext}</td>
                `;
      } else {
        // Se a despesa já foi paga, alerta o usuário
        alert("Esta despesa já foi paga.");
      }
    } else {
      // Se o índice da despesa é inválido, alerta o usuário
      alert("Índice de despesa inválido.");
    }
  } catch (error) {
    console.error("Erro ao pagar despesa:", error);
  }
}

async function desfazerPagamento(index) {
    try {
        const resposta = await fetch('http://localhost:3000/dados');
        const dados = await resposta.json();
        const tabelaDados = document.getElementById('tabela-dados');
        const tbody = tabelaDados.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        // Verifique se o índice está dentro dos limites do array
        if (index >= 0 && index < dados.length) {
            const despesa = dados[index];

            // Verifique se a despesa está marcada como paga
            if (despesa.pago) {
                // Desfaça o pagamento
                despesa.pago = false;

                // Atualize o status no servidor
                await fetch(`http://localhost:3000/dados/${index}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(despesa)
                });

                // Atualize a tabela no front-end
                const row = rows[index];
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${despesa.descricao}</td>
                    <td>${Array.isArray(despesa.categoria) ? despesa.categoria[1] : despesa.categoria}</td>
                    <td>${despesa.dataVencimento}</td>
                    <td>${formatarDinheiro(despesa.valor)}</td>
                    <td>
                        <button onclick="pagarDespesa(${index})">Pagar</button>
                    </td>
                `;
            } else {
                // Se a despesa não estiver paga, alerta o usuário
                alert('Esta despesa ainda não foi paga.');
            }
        } else {
            // Se o índice da despesa é inválido, alerta o usuário
            alert('Índice de despesa inválido.');
        }
    } catch (error) {
        console.error('Erro ao desfazer pagamento:', error);
    }
}

async function apagarDespesa(index) {
  try {
    const resposta = await fetch(`http://localhost:3000/dados/${index}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (resposta.ok) {
      // Atualize a tabela no front-end
      carregarDados();
    } else {
      // Se houver um erro ao apagar a despesa, alerta o usuário
      alert('Erro ao apagar despesa.');
    }
  } catch (error) {
    console.error('Erro ao apagar despesa:', error);
  }
}

function abrirDados() {
  window.location.href = '../EntradaSaldo/index.html';
}
