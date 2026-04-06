/**
 * copilot-panel.js — CoLab Copilot AI Assistant Panel
 * Floating chat panel with mock AI responses for CTO demo.
 */

import { html, raw } from '../../utils/safe-html.js';
import { findResponse, SUGGESTIONS } from '../../mock/copilot-responses.js';
import { appStore } from '../../store.js';

let isOpen = false;
let panelEl = null;
let fabEl = null;
let escapeHandler = null;

const WELCOME_MSG = {
  type: 'ai',
  html: 'Hola! Soy <span class="copilot-msg__highlight">CoLab Copilot</span>, tu asistente de talento. Puedo ayudarte a encontrar técnicos, analizar oportunidades, generar borradores, y conectarte con cursos de <span class="copilot-msg__highlight">PLE</span> y tu <span class="copilot-msg__highlight">Growth Path</span>. ¿En qué te ayudo?',
};

let messages = [WELCOME_MSG];

/**
 * Initialize the Copilot FAB and panel.
 * Call once from app.js.
 */
export function initCopilot() {
  // Create FAB
  const container = document.createElement('div');
  container.id = 'copilot-root';
  document.body.appendChild(container);

  renderFab(container);
}

function renderFab(container) {
  container.innerHTML = html`
    <button class="copilot-fab" data-action="toggle-copilot" aria-label="Abrir CoLab Copilot">
      <span class="copilot-fab__pulse"></span>
      <img src="img/copilot.svg" alt="Copilot" class="copilot-fab__icon" />
    </button>
  `;
  fabEl = container.querySelector('.copilot-fab');
  fabEl.addEventListener('click', togglePanel);
}

function togglePanel() {
  if (isOpen) {
    closePanel();
  } else {
    openPanel();
  }
}

function openPanel() {
  isOpen = true;
  fabEl.style.display = 'none';

  panelEl = document.createElement('div');
  panelEl.className = 'copilot-panel';
  panelEl.innerHTML = buildPanelHTML();
  document.body.appendChild(panelEl);

  setupPanelEvents();
  scrollToBottom();

  // Focus input
  const input = panelEl.querySelector('.copilot-panel__input');
  if (input) setTimeout(() => input.focus(), 100);
}

function closePanel() {
  isOpen = false;
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
  }
  fabEl.style.display = 'flex';
  if (escapeHandler) {
    document.removeEventListener('keydown', escapeHandler);
    escapeHandler = null;
  }
}

function buildPanelHTML() {
  const user = appStore.get('user');
  const initials = user.name.split(' ').map(n => n[0]).join('');

  return `
    <div class="copilot-panel__header">
      <div class="copilot-panel__brand">
        <div class="copilot-panel__logo">
          <img src="img/copilot.svg" alt="Copilot" style="width: 20px; height: 20px;" />
        </div>
        <div>
          <div class="copilot-panel__title">CoLab Copilot</div>
          <div class="copilot-panel__subtitle">AI Assistant \u00b7 Online</div>
        </div>
      </div>
      <button class="copilot-panel__close" data-action="close-copilot" aria-label="Cerrar Copilot">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="copilot-panel__messages" id="copilot-messages">
      ${renderMessages(initials)}
    </div>
    <div class="copilot-panel__suggestions" id="copilot-suggestions">
      ${SUGGESTIONS.map(s => `<button class="copilot-suggestion" data-action="suggestion">${escapeText(s)}</button>`).join('')}
    </div>
    <div class="copilot-panel__input-area">
      <input
        type="text"
        class="copilot-panel__input"
        id="copilot-input"
        placeholder="Pregunta algo..."
        autocomplete="off"
      />
      <button class="copilot-panel__send" data-action="send-copilot" aria-label="Enviar">
        <span class="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  `;
}

function escapeText(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMessages(initials) {
  return messages.map(msg => {
    if (msg.type === 'ai') {
      return `
        <div class="copilot-msg copilot-msg--ai">
          <div class="copilot-msg__avatar">
            <img src="img/copilot.svg" alt="Copilot" style="width: 18px; height: 18px;" />
          </div>
          <div class="copilot-msg__bubble">
            ${msg.html}
            ${msg.dataCard ? renderDataCard(msg.dataCard) : ''}
            ${msg.longText ? `<div class="copilot-msg__data-card" style="border-left-color: var(--tertiary); font-style: italic; line-height: 1.6;">${escapeText(msg.longText)}</div>` : ''}
            ${msg.followUp ? `<p style="margin-top: var(--space-2); color: white; font-weight: 500;">${escapeText(msg.followUp)}</p>` : ''}
          </div>
        </div>
      `;
    }
    return `
      <div class="copilot-msg copilot-msg--user">
        <div class="copilot-msg__avatar">${initials}</div>
        <div class="copilot-msg__bubble">${escapeText(msg.text)}</div>
      </div>
    `;
  }).join('');
}

function renderDataCard(rows) {
  if (!rows || !rows.length) return '';
  return `
    <div class="copilot-msg__data-card">
      ${rows.map(r => `
        <div class="copilot-msg__data-row">
          <span>${escapeText(r.label)}</span>
          <span class="copilot-msg__data-value">${escapeText(r.value)}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function setupPanelEvents() {
  // Close button
  panelEl.querySelector('[data-action="close-copilot"]').addEventListener('click', closePanel);

  // Send button
  panelEl.querySelector('[data-action="send-copilot"]').addEventListener('click', handleSend);

  // Input enter key
  panelEl.querySelector('#copilot-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Suggestion chips
  panelEl.querySelectorAll('[data-action="suggestion"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent.trim();
      const input = panelEl.querySelector('#copilot-input');
      input.value = text;
      handleSend();
    });
  });

  // Close on Escape — listener stored at module level so closePanel() can remove it
  escapeHandler = (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  };
  document.addEventListener('keydown', escapeHandler);
}

function handleSend() {
  const input = panelEl.querySelector('#copilot-input');
  const text = input.value.trim();
  if (!text) return;

  // Add user message
  messages.push({ type: 'user', text });
  input.value = '';

  // Hide suggestions after first message
  const suggestionsEl = panelEl.querySelector('#copilot-suggestions');
  if (suggestionsEl) suggestionsEl.style.display = 'none';

  // Re-render messages
  updateMessages();

  // Show typing indicator
  showTyping();

  // Find mock response
  const response = findResponse(text);

  // Simulate AI delay
  setTimeout(() => {
    hideTyping();

    messages.push({
      type: 'ai',
      html: response.text,
      dataCard: response.dataCard,
      longText: response.longText,
      followUp: response.followUp,
    });

    updateMessages();
  }, response.delay);
}

function updateMessages() {
  if (!panelEl) return;
  const container = panelEl.querySelector('#copilot-messages');
  const user = appStore.get('user');
  const initials = user.name.split(' ').map(n => n[0]).join('');
  container.innerHTML = renderMessages(initials);
  scrollToBottom();
}

function showTyping() {
  if (!panelEl) return;
  const container = panelEl.querySelector('#copilot-messages');
  const typingEl = document.createElement('div');
  typingEl.id = 'copilot-typing';
  typingEl.className = 'copilot-typing';
  typingEl.innerHTML = `
    <div class="copilot-msg__avatar" style="background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
      <img src="img/copilot.svg" alt="Copilot" style="width: 18px; height: 18px;" />
    </div>
    <div class="copilot-typing__dots">
      <div class="copilot-typing__dot"></div>
      <div class="copilot-typing__dot"></div>
      <div class="copilot-typing__dot"></div>
    </div>
  `;
  container.appendChild(typingEl);
  scrollToBottom();
}

function hideTyping() {
  if (!panelEl) return;
  const typing = panelEl.querySelector('#copilot-typing');
  if (typing) typing.remove();
}

function scrollToBottom() {
  if (!panelEl) return;
  const container = panelEl.querySelector('#copilot-messages');
  if (container) {
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }
}
