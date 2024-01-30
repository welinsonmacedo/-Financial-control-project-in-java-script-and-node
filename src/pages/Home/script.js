async function carregarGrafico() {
    try {
        const resposta = await fetch('http://localhost:3000/saldo-com-pagamentos');
        const dadosGrafico = await resposta.json();

        const textSaldo=document.getElementById('saldoAtual')
        textSaldo.innerHTML=dadosGrafico[0].saldoResultanteNumber.toFixed(2)

        const saldoAtual = dadosGrafico[0].saldoResultanteNumber;
        const saldoGasto = dadosGrafico[0].somaItensPagosNumber;
        const saldoLancado = dadosGrafico[0].somaEntradasNumber;

        
        const ctx = document.getElementById('meuGrafico').getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Saldo Atual', 'Saldo Gasto', 'Saldo Lançado'],
                datasets: [{
                    label: 'Valores',
                    data: [saldoAtual, saldoGasto, saldoLancado],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.5)',  // Cor para Saldo Atual
                        'rgba(255, 99, 132, 0.5)', // Cor para Saldo Gasto
                        'rgba(255, 206, 86, 0.5)'  // Cor para Saldo Lançado
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar o gráfico:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregarGrafico);
