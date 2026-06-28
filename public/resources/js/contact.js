(function () {
  const form = document.getElementById('adf-contact-form');
  if (!form) return;

  const fields = {
    name: document.getElementById('adf-name'),
    mobile: document.getElementById('adf-mobile'),
    email: document.getElementById('adf-email'),
    message: document.getElementById('adf-message'),
  };
  const note = document.getElementById('adf-form-note');
  const whatsappBtn = document.getElementById('adf-send-whatsapp');
  const emailBtn = document.getElementById('adf-send-email');

  const emailPattern = /^([a-zA-Z0-9_.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,})+$/;

  function wrapField(input) {
    return input ? input.closest('.adf-form-field') : null;
  }

  function clearErrors() {
    Object.values(fields).forEach((input) => {
      const wrap = wrapField(input);
      if (wrap) wrap.classList.remove('has-error');
    });
    if (note) {
      note.hidden = true;
      note.textContent = '';
    }
  }

  function validate() {
    clearErrors();
    let valid = true;

    const name = fields.name.value.trim();
    const mobile = fields.mobile.value.trim();
    const email = fields.email.value.trim();
    const message = fields.message.value.trim();

    if (name.length < 2) {
      wrapField(fields.name).classList.add('has-error');
      valid = false;
    }
    if (mobile.length < 9) {
      wrapField(fields.mobile).classList.add('has-error');
      valid = false;
    }
    if (!emailPattern.test(email)) {
      wrapField(fields.email).classList.add('has-error');
      valid = false;
    }
    if (!message) {
      wrapField(fields.message).classList.add('has-error');
      valid = false;
    }

    if (!valid && note) {
      note.hidden = false;
      note.textContent = 'Please fill in all required fields correctly.';
    }

    return valid
      ? { name, mobile, email, message }
      : null;
  }

  function buildWhatsAppText(data) {
    return [
      'Hi Adfinity,',
      '',
      `Name: ${data.name}`,
      `Phone: ${data.mobile}`,
      `Email: ${data.email}`,
      '',
      'Message:',
      data.message,
    ].join('\n');
  }

  function buildMailto(data) {
    const subject = encodeURIComponent(`Enquiry from ${data.name} — Adfinity Website`);
    const body = encodeURIComponent(buildWhatsAppText(data));
    return `mailto:adfinity.vja@gmail.com?subject=${subject}&body=${body}`;
  }

  whatsappBtn.addEventListener('click', () => {
    const data = validate();
    if (!data) return;

    const text = encodeURIComponent(buildWhatsAppText(data));
    const url = `https://wa.me/918886464646?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  emailBtn.addEventListener('click', () => {
    const data = validate();
    if (!data) return;

    window.location.href = buildMailto(data);
  });

  Object.values(fields).forEach((input) => {
    input.addEventListener('focus', () => {
      const wrap = wrapField(input);
      if (wrap) wrap.classList.remove('has-error');
    });
  });
})();
