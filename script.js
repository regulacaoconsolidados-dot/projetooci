// Configuração
const SHEET_ID = 'SEU_ID_AQUI'; // ID da sua planilha
const API_KEY = 'SUA_API_KEY'; // Criar em console.cloud.google.com
const RANGE = 'BASE_CONSOLIDADA!A:N';

async function carregarDados() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const dados = data.values.slice(1); // Pular cabeçalho
    atualizarTabela(dados);
    atualizarFiltros(dados);
}

function atualizarTabela(dados) {
    const tbody = document.getElementById('corpoTabela');
    tbody.innerHTML = '';
    
    dados.forEach(linha => {
        const progresso = parseInt(linha[13]) || 0; // Coluna N
        const statusInicio = linha[6]; // Coluna G
        
        let statusClass = '';
        if (progresso >= 100) statusClass = 'status-verde';
        else if (progresso >= 50) statusClass = 'status-amarelo';
        else statusClass = 'status-vermelho';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${linha[0]}</td>
            <td>${linha[1]}</td>
            <td>${linha[2]}</td>
            <td>${linha[3]}</td>
            <td>${linha[5]}</td>
            <td>
                <div class="progress-cell">
                    <div class="progress-fill" style="width: ${progresso}%"></div>
                    <span class="progress-text">${progresso}%</span>
                </div>
            </td>
            <td>
                <span title="Consulta: ${statusInicio}">📋</span>
                <span title="Exame1: ${linha[9] || '⏳'}">🔬</span>
                <span title="Exame2: ${linha[12] || '⏳'}">🧪</span>
            </td>
            <td class="${statusClass}">${calcularPrevisao(linha)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function calcularPrevisao(linha) {
    const prazoMax = linha[3].includes('ONCO') ? 30 : 60;
    const dataInicio = new Date(linha[5]);
    const diasCorridos = Math.floor((new Date() - dataInicio) / (1000*60*60*24));
    
    if (linha[13] >= 100) return "✅ CONCLUÍDO";
    if (diasCorridos > prazoMax) return "🔴 ATRASADO";
    if (diasCorridos > prazoMax * 0.8) return "🟡 ATENÇÃO";
    return "🟢 DENTRO PRAZO";
}

// Atualizar a cada 30 minutos
setInterval(carregarDados, 1800000);
carregarDados();