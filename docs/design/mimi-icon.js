(function () {
  if (customElements.get('mimi-icon')) return;
  const pending = new Set();
  const pascal = n => n.split('-').map(s => s ? s[0].toUpperCase() + s.slice(1) : '').join('');
  class MimiIcon extends HTMLElement {
    static get observedAttributes() { return ['name', 'size', 'stroke']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { this.render(); }
    render() {
      if (!this.isConnected) return;
      const size = this.getAttribute('size') || 16;
      this.style.display = 'inline-flex';
      this.style.flexShrink = '0';
      this.style.width = this.style.height = size + 'px';
      if (!window.lucide) { pending.add(this); return; }
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      let node = window.lucide.icons[pascal(this.getAttribute('name') || '')];
      if (!node) { root.innerHTML = ''; return; }
      if (typeof node[0] === 'string') node = node[2] || [];
      const inner = node.map(([t, a]) => '<' + t + ' ' + Object.entries(a).map(([k, v]) => k + '="' + v + '"').join(' ') + '/>').join('');
      root.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (this.getAttribute('stroke') || 2) + '" stroke-linecap="round" stroke-linejoin="round" style="display:block">' + inner + '</svg>';
    }
  }
  customElements.define('mimi-icon', MimiIcon);
  // lucide.min.js se carga localmente (script en <head>); esperamos a que esté listo.
  const flush = () => { pending.forEach(el => el.render()); pending.clear(); };
  if (!window.lucide) {
    const t = setInterval(() => { if (window.lucide) { clearInterval(t); flush(); } }, 30);
  }
})();
