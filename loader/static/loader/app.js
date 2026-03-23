/* loader/static/loader/app.js */

const API_BASE = '/api';
let selectedLoaderId = null;

// Get CSRF token from cookie
function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Panel resize functionality
let isResizing = false;
let currentWidth = 400;
let startX = 0;
let startWidth = 0;

function initResizer() {
    const resizer = document.getElementById('resizer');
    const sidePanel = document.getElementById('sidePanel');
    
    if (!resizer || !sidePanel) return;

    // Load saved width from localStorage
    const savedWidth = localStorage.getItem('sidePanelWidth');
    if (savedWidth && window.innerWidth > 768) {
        currentWidth = parseInt(savedWidth);
        sidePanel.style.width = currentWidth + 'px';
    }

    // Mouse events
    resizer.addEventListener('mousedown', initResize);
    resizer.addEventListener('touchstart', initResize, { passive: false });

    function initResize(e) {
        isResizing = true;
        resizer.classList.add('dragging');
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startX = clientX;
        startWidth = sidePanel.offsetWidth;

        const onMouseMove = (moveEvent) => {
            if (!isResizing) return;
            moveEvent.preventDefault();

            const moveX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const deltaX = startX - moveX;
            let newWidth = startWidth + deltaX;

            // Constrain width
            const minWidth = 250;
            const maxWidth = Math.min(800, window.innerWidth - 400);
            newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

            sidePanel.style.width = newWidth + 'px';
            currentWidth = newWidth;
        };

        const onMouseUp = () => {
            isResizing = false;
            resizer.classList.remove('dragging');
            
            // Restore cursor and selection
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            localStorage.setItem('sidePanelWidth', currentWidth);
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
        document.addEventListener('touchend', onMouseUp);
    }
}

// Theme management
const THEMES = {
    SYSTEM: 'system',
    LIGHT: 'light',
    DARK: 'dark'
};

function getThemeLabel(theme) {
    const labels = {
        [THEMES.SYSTEM]: '🖥️ Системная',
        [THEMES.LIGHT]: '☀️ Светлая',
        [THEMES.DARK]: '🌙 Тёмная'
    };
    return labels[theme] || labels[THEMES.SYSTEM];
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || THEMES.SYSTEM;
    applyTheme(savedTheme);
    updateThemeButton();
}

function applyTheme(theme) {
    if (theme === THEMES.SYSTEM) {
        const systemDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemDarkTheme ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || THEMES.SYSTEM;
    let newTheme;
    
    if (currentTheme === THEMES.SYSTEM) {
        newTheme = THEMES.LIGHT;
    } else if (currentTheme === THEMES.LIGHT) {
        newTheme = THEMES.DARK;
    } else {
        newTheme = THEMES.SYSTEM;
    }
    
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const theme = localStorage.getItem('theme') || THEMES.SYSTEM;
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
        btn.textContent = getThemeLabel(theme);
        btn.setAttribute('data-theme', theme);
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme || savedTheme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
    }
});

// Mobile menu toggle
window.toggleMobileMenu = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// Close sidebar when clicking outside on mobile (fallback)
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('mobileMenuToggle');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !overlay.contains(e.target)) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    }
});

// Load loaders on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initResizer();
    checkMobileView();
    loadLoaders();
});

// Check if mobile view and hide sidebar
function checkMobileView() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
    }
}

// Listen for viewport changes
window.addEventListener('resize', checkMobileView);

// Load all loaders
async function loadLoaders(search = '') {
    try {
        const url = search ? `${API_BASE}/loaders/?search=${encodeURIComponent(search)}` : `${API_BASE}/loaders/`;
        const response = await fetch(url);
        const loaders = await response.json();
        renderLoaders(loaders);
    } catch (error) {
        console.error('Error loading loaders:', error);
    }
}

// Render loaders table
function renderLoaders(loaders) {
    const tbody = document.getElementById('loadersTable');
    tbody.innerHTML = loaders.map(loader => `
        <tr onclick="selectLoader(${loader.id}, '${escapeHtml(loader.number)}')" style="cursor: pointer;">
            <td>${loader.code || ''}</td>
            <td>${escapeHtml(loader.brand)}</td>
            <td>${escapeHtml(loader.number)}</td>
            <td>${parseFloat(loader.capacity).toFixed(3)}</td>
            <td><input type="checkbox" class="checkbox" ${loader.is_active ? 'checked' : ''} onclick="event.stopPropagation(); toggleActive(${loader.id}, this.checked)"></td>
            <td>${formatDateTime(loader.updated_at)}</td>
            <td>${loader.created_by_name || ''}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="event.stopPropagation(); editLoader(${loader.id})">✏️</button>
                <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteLoader(${loader.id})">❌</button>
            </td>
        </tr>
    `).join('');
}

// Select loader and load downtimes
async function selectLoader(loaderId, loaderNumber) {
    selectedLoaderId = loaderId;
    document.getElementById('selectedLoaderNumber').textContent = loaderNumber;
    
    // Highlight selected row
    document.querySelectorAll('#loadersTable tr').forEach(row => {
        row.classList.remove('selected-row');
    });
    event.currentTarget.classList.add('selected-row');

    await loadDowntimes(loaderId);
}

// Load downtimes for selected loader
async function loadDowntimes(loaderId) {
    try {
        const response = await fetch(`${API_BASE}/downtimes/?loader_id=${loaderId}`);
        const downtimes = await response.json();
        renderDowntimes(downtimes);
    } catch (error) {
        console.error('Error loading downtimes:', error);
    }
}

// Render downtimes table
function renderDowntimes(downtimes) {
    const tbody = document.getElementById('downtimesTable');
    tbody.innerHTML = downtimes.map(downtime => `
        <tr>
            <td>${downtime.id}</td>
            <td>${formatDateTime(downtime.start_time)}</td>
            <td>${formatDateTime(downtime.end_time)}</td>
            <td>${downtime.duration}</td>
            <td>${escapeHtml(downtime.reason)}</td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editDowntime(${downtime.id})">✏️</button>
                <button class="action-btn delete-btn" onclick="deleteDowntime(${downtime.id})">❌</button>
            </td>
        </tr>
    `).join('');
}

// Search loader
function searchLoader() {
    const number = document.getElementById('searchNumber').value.trim();
    console.log('Searching for:', number);
    loadLoaders(number);
}

// Reset filter
function resetFilter() {
    document.getElementById('searchNumber').value = '';
    loadLoaders();
}

// Toggle active status
async function toggleActive(loaderId, isActive) {
    try {
        await fetch(`${API_BASE}/loaders/${loaderId}/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ is_active: isActive })
        });
    } catch (error) {
        console.error('Error updating loader:', error);
    }
}

// Open loader modal
function openLoaderModal(loaderId = null) {
    const modal = document.getElementById('loaderModal');
    const title = document.getElementById('loaderModalTitle');
    const form = document.getElementById('loaderForm');
    
    form.reset();
    
    if (loaderId) {
        title.textContent = 'Редактировать погрузчик';
        fetch(`${API_BASE}/loaders/${loaderId}/`)
            .then(r => r.json())
            .then(loader => {
                document.getElementById('loaderId').value = loader.id;
                document.getElementById('loaderBrand').value = loader.brand;
                document.getElementById('loaderNumber').value = loader.number;
                document.getElementById('loaderCapacity').value = loader.capacity;
                document.getElementById('loaderActive').value = loader.is_active.toString();
            });
    } else {
        title.textContent = 'Добавить погрузчик';
        document.getElementById('loaderId').value = '';
    }
    
    modal.classList.add('active');
}

// Close loader modal
function closeLoaderModal() {
    document.getElementById('loaderModal').classList.remove('active');
}

// Edit loader
function editLoader(loaderId) {
    openLoaderModal(loaderId);
}

// Delete loader
async function deleteLoader(loaderId) {
    if (!confirm('Вы уверены, что хотите удалить этот погрузчик?')) return;
    
    try {
        await fetch(`${API_BASE}/loaders/${loaderId}/`, { 
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() }
        });
        loadLoaders();
        if (selectedLoaderId === loaderId) {
            selectedLoaderId = null;
            document.getElementById('selectedLoaderNumber').textContent = '';
            document.getElementById('downtimesTable').innerHTML = '';
        }
    } catch (error) {
        console.error('Error deleting loader:', error);
    }
}

// Open downtime modal
function openDowntimeModal(downtimeId = null) {
    if (!selectedLoaderId) {
        alert('Сначала выберите погрузчик');
        return;
    }

    const modal = document.getElementById('downtimeModal');
    const form = document.getElementById('downtimeForm');
    
    form.reset();
    document.getElementById('downtimeLoaderId').value = selectedLoaderId;
    
    if (downtimeId) {
        fetch(`${API_BASE}/downtimes/${downtimeId}/`)
            .then(r => r.json())
            .then(downtime => {
                document.getElementById('downtimeId').value = downtime.id;
                document.getElementById('downtimeStart').value = formatDateTimeLocal(downtime.start_time);
                document.getElementById('downtimeEnd').value = formatDateTimeLocal(downtime.end_time);
                document.getElementById('downtimeReason').value = downtime.reason;
            });
    } else {
        document.getElementById('downtimeId').value = '';
        // Set default start time to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('downtimeStart').value = now.toISOString().slice(0, 16);
        
        // Set default end time to 1 hour later
        const endTime = new Date(now.getTime() + 60 * 60 * 1000);
        document.getElementById('downtimeEnd').value = endTime.toISOString().slice(0, 16);
    }
    
    modal.classList.add('active');
}

// Close downtime modal
function closeDowntimeModal() {
    document.getElementById('downtimeModal').classList.remove('active');
}

// Edit downtime
function editDowntime(downtimeId) {
    openDowntimeModal(downtimeId);
}

// Delete downtime
async function deleteDowntime(downtimeId) {
    if (!confirm('Вы уверены, что хотите удалить этот простой?')) return;
    
    try {
        await fetch(`${API_BASE}/downtimes/${downtimeId}/`, { 
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() }
        });
        loadDowntimes(selectedLoaderId);
    } catch (error) {
        console.error('Error deleting downtime:', error);
    }
}

// Format datetime
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format datetime for input
function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Logout
function logout() {
    window.location.href = '/logout/';
}

// Handle loader form submit
document.addEventListener('DOMContentLoaded', () => {
    // Add Enter key handler for search input
    const searchInput = document.getElementById('searchNumber');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchLoader();
            }
        });
    }

    const loaderForm = document.getElementById('loaderForm');
    if (loaderForm) {
        loaderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loaderId = document.getElementById('loaderId').value;
            const data = {
                brand: document.getElementById('loaderBrand').value,
                number: document.getElementById('loaderNumber').value,
                capacity: parseFloat(document.getElementById('loaderCapacity').value),
                is_active: document.getElementById('loaderActive').value === 'true'
            };

            try {
                const url = loaderId ? `${API_BASE}/loaders/${loaderId}/` : `${API_BASE}/loaders/`;
                const method = loaderId ? 'PUT' : 'POST';
                
                await fetch(url, {
                    method,
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken()
                    },
                    body: JSON.stringify(data)
                });
                
                closeLoaderModal();
                loadLoaders();
            } catch (error) {
                console.error('Error saving loader:', error);
                alert('Ошибка при сохранении погрузчика');
            }
        });
    }

    // Handle downtime form submit
    const downtimeForm = document.getElementById('downtimeForm');
    if (downtimeForm) {
        downtimeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const downtimeId = document.getElementById('downtimeId').value;
            const startTime = new Date(document.getElementById('downtimeStart').value);
            const endTime = new Date(document.getElementById('downtimeEnd').value);
            
            // Calculate duration
            const diffMs = endTime - startTime;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const duration = `${diffHours}ч ${diffMinutes} мин`;
            
            const data = {
                loader: parseInt(document.getElementById('downtimeLoaderId').value),
                start_time: document.getElementById('downtimeStart').value,
                end_time: document.getElementById('downtimeEnd').value,
                duration: duration,
                reason: document.getElementById('downtimeReason').value
            };

            try {
                const url = downtimeId ? `${API_BASE}/downtimes/${downtimeId}/` : `${API_BASE}/downtimes/`;
                const method = downtimeId ? 'PUT' : 'POST';

                await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken()
                    },
                    body: JSON.stringify(data)
                });

                closeDowntimeModal();
                loadDowntimes(selectedLoaderId);
            } catch (error) {
                console.error('Error saving downtime:', error);
                alert('Ошибка при сохранении простоя');
            }
        });
    }
});
