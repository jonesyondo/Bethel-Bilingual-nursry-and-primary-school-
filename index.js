// Updated index.js with localStorage, full interactivity, and UI bug fixes

let uploadedFiles = {};
let chatOpen = false;

// === HEADER SCROLL EFFECT ===
window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    header.classList.toggle('scrolled', window.scrollY > 100);
});

// === SMOOTH SCROLLING ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// === STATS COUNTER ===
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 20);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-number').forEach(stat => {
                animateCounter(stat, parseInt(stat.dataset.target));
            });
            statsObserver.unobserve(entry.target);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.getElementById('stats');
    if (statsSection) statsObserver.observe(statsSection);
    restoreFormInputs();
    restoreChatMessages();
});

// === FILE UPLOAD ===
function handleFileUpload(input, containerId) {
    const container = document.getElementById(containerId);
    const files = Array.from(input.files);
    if (files.length === 0) return;

    container.style.display = 'block';
    container.innerHTML = '';

    files.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size should not exceed 5MB', 'error');
            return;
        }
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div><strong>${file.name}</strong><small>${(file.size / 1024 / 1024).toFixed(2)} MB</small></div>
            <span class="file-remove" onclick="removeFile('${input.id}', '${containerId}')">×</span>`;
        container.appendChild(fileItem);
    });

    uploadedFiles[input.id] = files;
    simulateUploadProgress();
}

function removeFile(inputId, containerId) {
    const input = document.getElementById(inputId);
    input.value = '';
    document.getElementById(containerId).style.display = 'none';
    document.getElementById(containerId).innerHTML = '';
    delete uploadedFiles[inputId];
}

function simulateUploadProgress() {
    const bar = document.getElementById('progressBar');
    const container = document.getElementById('uploadProgress');
    container.style.display = 'block';
    bar.style.width = '0%';
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => container.style.display = 'none', 500);
        }
        bar.style.width = progress + '%';
    }, 200);
}

// === FORM SAVE TO LOCAL STORAGE ===
function saveFormInputs() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                localStorage.setItem(input.name, input.value);
            });
        });
    });
}

function restoreFormInputs() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (localStorage.getItem(input.name)) {
                input.value = localStorage.getItem(input.name);
            }
        });
    });
}

// === NOTIFICATION ===
function showNotification(message, type = 'success') {
    const n = document.getElementById('notification');
    n.textContent = message;
    n.className = `notification show ${type}`;
    setTimeout(() => n.classList.remove('show'), 4000);
}

// === CHAT SYSTEM ===
function toggleChat() {
    const popup = document.getElementById('chatPopup');
    const button = document.getElementById('chatButton');
    chatOpen = !chatOpen;
    popup.style.display = chatOpen ? 'flex' : 'none';
    button.textContent = chatOpen ? '×' : '💬';
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const msg = input.value.trim();
    if (!msg) return;

    const userMsg = document.createElement('div');
    userMsg.textContent = msg;
    userMsg.className = 'user-message';
    messages.appendChild(userMsg);

    storeChat(msg, 'user');
    input.value = '';
    setTimeout(() => respondToChat(), 800);
}

function respondToChat() {
    const messages = document.getElementById('chatMessages');
    const botMsg = document.createElement('div');
    const response = [
        "Thanks for contacting us!",
        "We will get back to you shortly.",
        "Can I help with something else?"
    ][Math.floor(Math.random() * 3)];
    botMsg.textContent = response;
    botMsg.className = 'bot-message';
    messages.appendChild(botMsg);

    storeChat(response, 'bot');
    messages.scrollTop = messages.scrollHeight;
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function storeChat(message, role) {
    let logs = JSON.parse(localStorage.getItem('chatLog') || '[]');
    logs.push({ message, role });
    localStorage.setItem('chatLog', JSON.stringify(logs));
}

function restoreChatMessages() {
    const messages = document.getElementById('chatMessages');
    const logs = JSON.parse(localStorage.getItem('chatLog') || '[]');
    logs.forEach(({ message, role }) => {
        const msg = document.createElement('div');
        msg.className = role === 'user' ? 'user-message' : 'bot-message';
        msg.textContent = message;
        messages.appendChild(msg);
    });
}

// === FORM SUBMISSIONS ===
['studentForm', 'parentForm', 'contactForm', 'loginForm'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const loading = form.querySelector('.loading');
        const success = form.querySelector('.success-message');
        loading.style.display = 'block';
        setTimeout(() => {
            loading.style.display = 'none';
            success.style.display = 'block';
            form.reset();
            setTimeout(() => success.style.display = 'none', 4000);
        }, 1500);
    });
});

// === TABS ===
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// === IMAGE MODAL ===
function openImageModal(type) {
    const modal = document.getElementById('imageModal');
    const content = document.getElementById('imageModalContent');
    const data = {
        classroom: { title: 'Modern Classrooms', desc: 'Equipped for learning.', icon: '📚' },
        playground: { title: 'Playground', desc: 'Fun space.', icon: '⚽' },
        library: { title: 'Library', desc: 'Reading zone.', icon: '📖' },
        lab: { title: 'Science Lab', desc: 'Hands-on discovery.', icon: '🔬' },
        uniform: { title: 'Uniforms', desc: 'Black & Pink.', icon: '👔' },
        activities: { title: 'Activities', desc: 'Art, music, fun.', icon: '🎨' }
    };
    const d = data[type];
    content.innerHTML = `<h2>${d.icon} ${d.title}</h2><p>${d.desc}</p>`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) closeModal(e.target.id);
});

// === REVEAL ON SCROLL ===
function reveal() {
    document.querySelectorAll('.reveal').forEach(e => {
        const top = e.getBoundingClientRect().top;
        if (top < window.innerHeight - 150) e.classList.add('active');
    });
}

window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);

// === MOBILE NAV ===
document.querySelector('.mobile-menu').addEventListener('click', function () {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
});

saveFormInputs();
