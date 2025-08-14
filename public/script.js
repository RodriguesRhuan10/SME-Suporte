// Variáveis globais
let currentTicketId = null;
let currentFilter = 'todos';
let allTickets = [];
let isAuthenticated = false;
const modal = document.getElementById('ticketModal');

// Senha de acesso (você pode alterar para a senha desejada)
const ACCESS_PASSWORD = 'cpdpmisme';

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    startServiceStatusTimer(); // Inicializar status do serviço
    setupStatusOptions(); // Configurar opções de status
    
    // Sempre mostrar tela de acesso ao carregar a página
    isAuthenticated = false;
    hideTicketsSection();
});

function setupEventListeners() {
    // Formulário de ticket
    document.getElementById('ticketForm').addEventListener('submit', createTicket);
    
    // Formulário de log
    document.getElementById('logForm').addEventListener('submit', addLog);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Verificar autenticação (não usado mais, mas mantido para compatibilidade)
function checkAuthentication() {
    // Sempre começar sem autenticação
    isAuthenticated = false;
    hideTicketsSection();
}

// Mostrar seção de tickets
function showTicketsSection() {
    document.getElementById('accessSection').style.display = 'none';
    document.getElementById('ticketsSection').style.display = 'block';
}

// Ocultar seção de tickets
function hideTicketsSection() {
    document.getElementById('accessSection').style.display = 'block';
    document.getElementById('ticketsSection').style.display = 'none';
}

// Mostrar modal de senha
function showPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('accessPassword').focus();
}

// Fechar modal de senha
function closePasswordModal() {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('accessPassword').value = '';
}

// Verificar senha
function verifyPassword() {
    const password = document.getElementById('accessPassword').value;
    
    if (password === ACCESS_PASSWORD) {
        isAuthenticated = true;
        showNotification('Acesso autorizado!', 'success');
        closePasswordModal();
        showTicketsSection();
        loadTickets();
    } else {
        showNotification('Senha incorreta!', 'error');
        document.getElementById('accessPassword').value = '';
        document.getElementById('accessPassword').focus();
    }
}

// Manipular tecla Enter no campo de senha
function handlePasswordKeyPress(event) {
    if (event.key === 'Enter') {
        verifyPassword();
    }
}

// Carregar tickets
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        if (!response.ok) throw new Error('Erro ao carregar chamados');
        
        allTickets = await response.json();
        // Ordenar por data de criação (mais recente primeiro)
        allTickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Aplicar filtro atual
        applyCurrentFilter();
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao carregar chamados', 'error');
    }
}

// Exibir tickets
function displayTickets(tickets) {
    const container = document.getElementById('tickets');
    container.innerHTML = '';

    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Nenhum chamado encontrado</h3>
                <p>Comece criando o primeiro chamado de suporte</p>
            </div>
        `;
        return;
    }

    tickets.forEach(ticket => {
        const ticketCard = createTicketCard(ticket);
        container.appendChild(ticketCard);
    });
}

// Criar card de ticket
function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    
    const statusClass = `status-${ticket.status.replace(' ', '')}`;
    const formattedDate = new Date(ticket.created_at).toLocaleDateString('pt-BR');
    const priority = ticket.priority || 'media';
    const priorityIcon = getPriorityIcon(priority);
    const priorityClass = `priority-${priority}`;
    
    card.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-title">
                <span class="ticket-number">#${ticket.id}</span>
                ${ticket.title}
            </div>
            <div class="ticket-meta">
                <span class="ticket-status ${statusClass}">${getStatusText(ticket.status)}</span>
                <span class="ticket-priority ${priorityClass}">
                    ${priorityIcon} ${getPriorityText(priority)}
                </span>
            </div>
        </div>
        <div class="ticket-info">
            <p><strong>Solicitante:</strong> ${ticket.requester || 'Não informado'}</p>
            <p><strong>Descrição:</strong> ${ticket.description}</p>
            <p><strong>Aberto em:</strong> ${formattedDate}</p>
        </div>
        <div class="ticket-actions">
            <button onclick="viewTicketDetails(${ticket.id})" class="btn-secondary">
                <i class="fas fa-eye"></i>
                Ver Detalhes
            </button>
            <button onclick="changeTicketStatus(${ticket.id})" class="btn-secondary">
                <i class="fas fa-edit"></i>
                Alterar Status
            </button>
        </div>
    `;
    
    return card;
}

// Obter ícone de prioridade
function getPriorityIcon(priority) {
    const icons = {
        'baixa': '<i class="fas fa-arrow-down" style="color: #10b981;"></i>',
        'media': '<i class="fas fa-minus" style="color: #f59e0b;"></i>',
        'alta': '<i class="fas fa-arrow-up" style="color: #ef4444;"></i>',
        'urgente': '<i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i>'
    };
    return icons[priority] || icons['media'];
}

// Obter texto de prioridade
function getPriorityText(priority) {
    const texts = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    return texts[priority] || 'Média';
}

// Obter texto de status
function getStatusText(status) {
    const texts = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Análise',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado'
    };
    return texts[status] || status;
}

// Criar ticket
async function createTicket(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const ticketData = {
        title: formData.get('title') || document.getElementById('title').value,
        description: formData.get('description') || document.getElementById('description').value,
        requester: formData.get('requester') || document.getElementById('requester').value,
        priority: formData.get('priority') || document.getElementById('priority').value
    };

    try {
        const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
    });

        if (!response.ok) throw new Error('Erro ao criar chamado');
        
        const result = await response.json();
        showNotification('Chamado criado com sucesso!', 'success');
        e.target.reset();
        
        // Recarregar tickets e aplicar filtro de "aberto"
        currentFilter = 'aberto';
        await loadTickets();
        
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao criar chamado', 'error');
    }
}

// Visualizar detalhes do ticket
async function viewTicketDetails(ticketId) {
    try {
        const [ticketResponse, logsResponse] = await Promise.all([
            fetch(`/api/tickets/${ticketId}`),
            fetch(`/api/tickets/${ticketId}/logs`)
        ]);

        if (!ticketResponse.ok || !logsResponse.ok) throw new Error('Erro ao carregar dados');

        const ticket = await ticketResponse.json();
        const logs = await logsResponse.json();
        
        currentTicketId = ticketId;
        displayTicketModal(ticket, logs);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao carregar detalhes do chamado', 'error');
    }
}

// Exibir modal do ticket
function displayTicketModal(ticket, logs) {
    const detailsContainer = document.getElementById('ticketDetails');
    const formattedDate = new Date(ticket.created_at).toLocaleDateString('pt-BR');
    const priority = ticket.priority || 'media';
    
    detailsContainer.innerHTML = `
        <div class="ticket-detail-header">
            <div class="ticket-detail-title">
                <div class="ticket-number-section">
                    <h2>Chamado #${ticket.id}</h2>
                    <div class="ticket-meta-info">
                        <span class="ticket-date">
                            <i class="fas fa-calendar-alt"></i>
                            Aberto em ${formattedDate}
                        </span>
                    </div>
                </div>
                <div class="ticket-priority-section">
                    <span class="ticket-detail-priority priority-${priority}">
                        ${getPriorityIcon(priority)} ${getPriorityText(priority)}
                    </span>
                </div>
            </div>
        </div>
        
        <div class="ticket-detail-content">
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-icon">
                        <i class="fas fa-heading"></i>
                    </div>
                    <div class="detail-content">
                        <label>Assunto</label>
                        <span class="detail-value">${ticket.title}</span>
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="detail-content">
                        <label>Solicitante</label>
                        <span class="detail-value">${ticket.requester || 'Não informado'}</span>
                    </div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="detail-content">
                        <label>Status Atual</label>
                        <span class="detail-value">
                            <span class="ticket-status status-${ticket.status.replace(' ', '')}">${getStatusText(ticket.status)}</span>
                        </span>
                    </div>
                </div>
                
                <div class="detail-item full-width">
                    <div class="detail-icon">
                        <i class="fas fa-align-left"></i>
                    </div>
                    <div class="detail-content">
                        <label>Descrição</label>
                        <span class="detail-value description-text">${ticket.description}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="status-controls">
            <div class="status-selector-wrapper">
                <label for="statusSelector">Novo Status:</label>
                <select id="statusSelector" class="status-selector">
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em Análise</option>
                    <option value="resolvido">Resolvido</option>
                    <option value="fechado">Fechado</option>
                </select>
            </div>
            <div class="ticket-actions">
                <button class="btn-primary" onclick="changeTicketStatus(${ticket.id})">
                    <i class="fas fa-edit"></i>
                    Alterar Status
                </button>
                <button class="btn-danger" onclick="deleteTicket(${ticket.id})">
                    <i class="fas fa-trash"></i>
                    Excluir Chamado
                </button>
            </div>
        </div>
    `;
    
    // Atualizar contador de logs
    updateLogsCount(logs.length);
    displayLogs(logs);
}

// Atualizar contador de logs
function updateLogsCount(count) {
    const logsBadge = document.querySelector('.logs-badge');
    if (logsBadge) {
        logsBadge.textContent = `${count} comentário${count !== 1 ? 's' : ''}`;
    }
}

// Exibir logs
function displayLogs(logs) {
    const logsContainer = document.getElementById('logsList');
    logsContainer.innerHTML = '';

    if (logs.length === 0) {
        logsContainer.innerHTML = `
            <div class="empty-logs">
                <i class="fas fa-comment-slash"></i>
                <p>Nenhum comentário registrado</p>
            </div>
        `;
        return;
    }

    logs.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        const formattedDate = new Date(log.created_at).toLocaleString('pt-BR');
        
        logItem.innerHTML = `
            <div class="log-message">${log.message}</div>
            <div class="log-time">
                <i class="fas fa-clock"></i>
                ${formattedDate}
            </div>
        `;
        
        logsContainer.appendChild(logItem);
    });
}

// Adicionar log
async function addLog(e) {
    e.preventDefault();
    
    const message = document.getElementById('logMessage').value;
    if (!message.trim()) return;

    try {
        const response = await fetch(`/api/tickets/${currentTicketId}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message.trim() })
        });

        if (!response.ok) throw new Error('Erro ao adicionar comentário');
        
        showNotification('Comentário adicionado com sucesso!', 'success');
        document.getElementById('logMessage').value = '';
        
        // Recarregar logs
        const logsResponse = await fetch(`/api/tickets/${currentTicketId}/logs`);
        const logs = await logsResponse.json();
        displayLogs(logs);
        
        // Recarregar lista de tickets
        loadTickets();
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao adicionar comentário', 'error');
    }
}

// Função para alterar status do ticket (abrir modal)
function changeTicketStatus(ticketId) {
    currentTicketId = ticketId;
    
    // Buscar dados do ticket para mostrar o status atual
    fetch(`/api/tickets/${ticketId}`)
        .then(response => response.json())
        .then(ticket => {
            // Atualizar o status atual no modal
            const currentStatusBadge = document.getElementById('currentStatusBadge');
            const statusText = currentStatusBadge.querySelector('.status-text');
            statusText.textContent = getStatusText(ticket.status);
            
            // Aplicar classe de status ao badge
            currentStatusBadge.className = `current-status-badge status-${ticket.status.replace(' ', '')}`;
            
            // Marcar o radio button correspondente ao status atual
            const currentRadio = document.querySelector(`input[value="${ticket.status}"]`);
            if (currentRadio) {
                currentRadio.checked = true;
            }
            
            // Abrir o modal
            document.getElementById('statusModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao buscar ticket:', error);
            showNotification('Erro ao carregar dados do chamado', 'error');
        });
}

// Fechar modal de alteração de status
function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
    currentTicketId = null;
}

// Confirmar alteração de status
function confirmStatusChange() {
    const selectedStatus = document.querySelector('input[name="newStatus"]:checked');
    
    if (!selectedStatus) {
        showNotification('Selecione um status para continuar', 'warning');
        return;
    }
    
    if (!currentTicketId) {
        showNotification('Erro: ID do chamado não encontrado', 'error');
        return;
    }
    
    const newStatus = selectedStatus.value;
    
    // Atualizar status via API
    fetch(`/api/tickets/${currentTicketId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return response.json();
    })
    .then(data => {
        showNotification('Status atualizado com sucesso!', 'success');
        closeStatusModal();
        
        // Recarregar tickets mantendo o filtro atual
        loadTickets();
        
        // Se o modal de detalhes estiver aberto, atualizar também
        if (document.getElementById('ticketModal').style.display === 'block') {
            viewTicketDetails(currentTicketId);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        showNotification('Erro ao atualizar status', 'error');
    });
}

// Função para atualizar status (mantida para compatibilidade)
function updateTicketStatus() {
    const statusSelector = document.getElementById('statusSelector');
    const newStatus = statusSelector.value;
    
    if (!currentTicketId) {
        showNotification('Erro: ID do chamado não encontrado', 'error');
        return;
    }
    
    fetch(`/api/tickets/${currentTicketId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return response.json();
    })
    .then(data => {
        showNotification('Status atualizado com sucesso!', 'success');
        
        // Recarregar tickets para mostrar a mudança
loadTickets();
        
        // Atualizar detalhes do ticket
        viewTicketDetails(currentTicketId);
    })
    .catch(error => {
        console.error('Erro:', error);
        showNotification('Erro ao atualizar status', 'error');
    });
}

// Função para recarregar tickets manualmente
function refreshTickets() {
    // Manter o filtro atual ao atualizar
    loadTickets();
    showNotification('Chamados atualizados!', 'success');
}

// Fechar modal
function closeModal() {
    modal.style.display = 'none';
    currentTicketId = null;
}

// Excluir ticket
async function deleteTicket(ticketId) {
    if (!isAuthenticated) {
        showNotification('Acesso negado. Faça login novamente.', 'error');
        return;
    }
    
    // Armazenar o ID do ticket para exclusão
    window.ticketToDelete = ticketId;
    
    // Mostrar modal de confirmação personalizado
    showDeleteConfirmModal();
}

// Mostrar modal de confirmação de exclusão
function showDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'block';
}

// Fechar modal de confirmação de exclusão
function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    window.ticketToDelete = null;
}

// Confirmar exclusão do ticket
async function confirmDeleteTicket() {
    const ticketId = window.ticketToDelete;
    
    if (!ticketId) {
        showNotification('Erro: ID do chamado não encontrado', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir chamado');
        }
        
        showNotification('Chamado excluído com sucesso!', 'success');
        
        // Fechar modal de confirmação
        closeDeleteConfirmModal();
        
        // Fechar modal de detalhes se estiver aberto
        if (document.getElementById('ticketModal').style.display === 'block') {
            closeModal();
        }
        
        // Recarregar tickets
        loadTickets();
        
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao excluir chamado', 'error');
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remover notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Remover ao clicar
    notification.addEventListener('click', () => notification.remove());
}

// Obter ícone da notificação
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Função para verificar se o serviço está ativo baseado no horário
function checkServiceStatus() {
    console.log('🔍 Verificando status do serviço...');
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute;
    
    console.log('⏰ Horário atual:', currentHour + ':' + currentMinute.toString().padStart(2, '0'));
    console.log('📊 Tempo em formato numérico:', currentTime);
    
    // Serviço ativo: 08:00 até 17:00
    // Serviço inativo: 17:01 até 07:59
    const isActive = (currentTime >= 800 && currentTime <= 1700);
    
    console.log('✅ Serviço ativo?', isActive);
    
    const serviceStatusIndicator = document.getElementById('serviceStatusIndicator');
    const serviceStatusIcon = document.getElementById('serviceStatusIcon');
    const serviceStatusText = document.getElementById('serviceStatusText');
    
    if (!serviceStatusIndicator || !serviceStatusIcon || !serviceStatusText) {
        console.error('❌ Elementos do status não encontrados!');
        return;
    }
    
    if (isActive) {
        serviceStatusIndicator.classList.remove('inactive');
        serviceStatusIndicator.classList.add('active');
        serviceStatusText.textContent = 'Serviço Ativo';
        console.log('🟢 Status definido como ATIVO');
    } else {
        serviceStatusIndicator.classList.remove('active');
        serviceStatusIndicator.classList.add('inactive');
        serviceStatusText.textContent = 'Serviço Inativo';
        console.log('🔴 Status definido como INATIVO');
    }
}

// Atualizar status do serviço a cada minuto
function startServiceStatusTimer() {
    console.log('🚀 Iniciando timer do status do serviço...');
    checkServiceStatus(); // Verificar imediatamente
    setInterval(checkServiceStatus, 60000); // Verificar a cada minuto
}

// Testar status imediatamente (para debug)
setTimeout(() => {
    console.log('🧪 Teste automático do status...');
    checkServiceStatus();
}, 1000);

// Configurar opções de status
function setupStatusOptions() {
    const statusOptions = document.querySelectorAll('.status-option');
    
    statusOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover seleção anterior
            statusOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Marcar esta opção como selecionada
            this.classList.add('selected');
            
            // Marcar o radio button correspondente
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
}

// Filtrar tickets por status
function filterTickets(status) {
    currentFilter = status;
    
    // Atualizar botões ativos
    updateFilterButtons();
    
    // Aplicar filtro
    applyCurrentFilter();
}

// Atualizar botões de filtro ativos
function updateFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// Aplicar filtro atual
function applyCurrentFilter() {
    let filteredTickets = allTickets;
    
    if (currentFilter !== 'todos') {
        filteredTickets = allTickets.filter(ticket => ticket.status === currentFilter);
    }
    
    displayTickets(filteredTickets);
    updateFilterInfo(currentFilter, filteredTickets.length);
}

// Atualizar informações do filtro
function updateFilterInfo(status, count) {
    const sectionHeader = document.querySelector('.tickets-section .section-header h2');
    
    let statusText = '';
    switch(status) {
        case 'todos':
            statusText = 'Chamados em Andamento';
            break;
        case 'aberto':
            statusText = 'Chamados Abertos';
            break;
        case 'em_andamento':
            statusText = 'Chamados em Análise';
            break;
        case 'resolvido':
            statusText = 'Chamados Resolvidos';
            break;
        case 'fechado':
            statusText = 'Chamados Fechados';
            break;
    }
    
    sectionHeader.innerHTML = `<i class="fas fa-tasks"></i> ${statusText} <span class="ticket-count">(${count})</span>`;
}

// Adicionar estilos CSS para melhorar a interface
const additionalStyles = `
    .empty-state {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
    }
    
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #374151;
    }
    
    .ticket-number {
        color: #6b7280;
        font-weight: 500;
        margin-right: 0.5rem;
    }
    
    .ticket-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-end;
    }
    
    .ticket-priority {
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .priority-baixa { background: #d1fae5; color: #065f46; }
    .priority-media { background: #fef3c7; color: #92400e; }
    .priority-alta { background: #fee2e2; color: #991b1b; }
    .priority-urgente { background: #fecaca; color: #7f1d1d; }
    
    .ticket-detail-header {
        margin-bottom: 1.5rem;
    }
    
    .ticket-detail-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .ticket-detail-title h3 {
        color: #1f2937;
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    .ticket-detail-priority {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .ticket-detail-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1rem;
    }
    
    .detail-item {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .detail-icon {
        min-width: 40px;
        text-align: center;
    }
    
    .detail-icon i {
        font-size: 1.25rem;
        color: #1e3a8a;
    }
    
    .detail-content label {
        font-weight: 600;
        color: #374151;
        font-size: 0.875rem;
    }
    
    .detail-value {
        color: #1f2937;
        font-size: 1rem;
    }
    
    .detail-value.description-text {
        white-space: pre-wrap; /* Preserva quebras de linha e espaços */
    }
    
    .detail-item.full-width {
        grid-column: 1 / -1; /* Ocupa duas colunas */
    }
    
    .empty-logs {
        text-align: center;
        padding: 2rem;
        color: #9ca3af;
    }
    
    .empty-logs i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        opacity: 0.5;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-content i {
        font-size: 1.125rem;
    }
`;

// Aplicar estilos adicionais
const style = document.createElement('style');
style.textContent = additionalStyles;
document.head.appendChild(style);
