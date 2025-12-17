// Access Check (Bloqueio por Senha) - DESABILITADO TEMPORARIAMENTE
// if (!sessionStorage.getItem('edip_access') && !window.location.href.includes('password.html')) {
//     window.location.href = 'password.html';
// }

function updateTime() {
    const now = new Date();

    // Configurações para Fuso de SP, Formato 24h
    const options = {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false // Formato 24h solicitado
    };

    // Usando pt-BR para garantir ordem DD/MM/AAAA natural
    const formatter = new Intl.DateTimeFormat('pt-BR', options);

    // FormatToParts é mais seguro
    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;

    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    const hour = getPart('hour');
    const minute = getPart('minute');

    // Montando: DD/MM/YYYY HH:MM BRT
    // Exemplo: 05/12/2025 20:30 BRT
    // Correção: GMT seria o horário de Londres. SP é GMT-3. 
    // O correto visivelmente para SP é "BRT" ou apenas a hora.
    const timeString = `${day}/${month}/${year} ${hour}:${minute} BRT`;

    const displayElement = document.getElementById('datetime');
    if (displayElement) {
        displayElement.textContent = timeString;
    }
}

updateTime();
setInterval(updateTime, 1000);

// Shrinking Header Logic
window.addEventListener('scroll', () => {
    const header = document.querySelector('.shop-header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});
