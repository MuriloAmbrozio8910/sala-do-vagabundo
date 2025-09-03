(() => {
  // Alvos: textareas, inputs de texto e contenteditable
  const targetsSelector = [
    'textarea',
    'input[type="text"]',
    'input[type="search"]',
    'input[type="url"]',
    'input[type="email"]',
    'input[type="number"]',
    'input[type="password"]',
    'input[type="tel"]',
    '[contenteditable=""], [contenteditable="true"]'
  ].join(',');

  const unlockEl = (el) => {
    // 1) Remover atributos inline bloqueadores
    ['oncopy', 'onpaste', 'oncut', 'oncontextmenu', 'onkeydown', 'onkeyup'].forEach(a => {
      if (el.hasAttribute(a)) el.removeAttribute(a);
      el[a] = null;
    });

    // 2) Reabilitar seleção/menus
    const st = el.style;
    st.userSelect = 'text';
    st.webkitUserSelect = 'text';
    st.msUserSelect = 'text';

    // 3) Interceptar no capture e impedir handlers bloqueadores seguintes
    const stopIfClipboard = (e) => {
      // Permite default, mas impede outros handlers de cancelarem
      e.stopImmediatePropagation();
      // NÃO chamar e.preventDefault() — queremos permitir a ação nativa
    };

    // Evita bloqueio por keydown (Ctrl/Cmd + C/X/V)
    const keydownFix = (e) => {
      const k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v', 'insert'].includes(k)) {
        e.stopImmediatePropagation();
        // Não chame preventDefault
      }
    };

    ['copy', 'cut', 'paste', 'contextmenu'].forEach(type => {
      el.addEventListener(type, stopIfClipboard, { capture: true });
    });
    el.addEventListener('keydown', keydownFix, { capture: true });
  };

  // Inicial
  document.querySelectorAll(targetsSelector).forEach(unlockEl);

  // Reaplica em elementos renderizados depois (React/MUI)
  const mo = new MutationObserver((muts) => {
    for (const mut of muts) {
      mut.addedNodes && mut.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches && node.matches(targetsSelector)) unlockEl(node);
        node.querySelectorAll && node.querySelectorAll(targetsSelector).forEach(unlockEl);
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  alert('Proteção desativada, copia/colar liberado');
})();
