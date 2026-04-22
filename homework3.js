/*
Program name: homework3.js
Author: David Boggs
Date created: 2026-04-11
Date last edited: 2026-04-21
Version: Homework 3 (Refined)
Description: On-the-fly validation and review logic for MIS3371 Homework 3.
*/

(() => {
  const byId = (id) => document.getElementById(id);
  const form = byId('patientForm');
  if (!form) return;

  const validateBtn = byId('validateBtn');
  const submitBtn = byId('realSubmitBtn');
  const reviewBtn = byId('reviewBtn');
  const reviewContent = byId('reviewContent');
  const clearBtn = byId('clearBtn');
  const wellnessSlider = byId('wellnessSlider') || byId('salarySlider');
  const sliderValue = byId('sliderValue');
  const contactArea = byId('contactArea');
  const contactBtn = byId('contactBtn');

  const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayText = byId('todayText');
  if (todayText) todayText.textContent = new Date().toLocaleDateString('en-US', dateOpts);

  const regex = {
    name: /^[A-Za-z'-]{1,30}$/,
    mi: /^[A-Za-z]$/,
    addr: /^[A-Za-z0-9#.,'\-\s]{2,30}$/,
    city: /^[A-Za-z .'-]{2,30}$/,
    zip: /^\d{5}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    username: /^[A-Za-z_\-][A-Za-z0-9_\-]{4,19}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/
  };

  const digits = (v) => (v || '').replace(/\D/g, '');

  const setMsg = (errorId, msg) => {
    const err = byId(errorId);
    if (err) err.textContent = msg || '';
  };

  const markField = (id, ok) => {
    const field = byId(id)?.closest('.field');
    if (!field) return;
    field.classList.remove('is-valid', 'is-invalid');
    field.classList.add(ok ? 'is-valid' : 'is-invalid');
  };

  const clearMark = (id) => {
    const field = byId(id)?.closest('.field');
    field?.classList.remove('is-valid', 'is-invalid');
  };

  const namedInputs = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]`));
  const checkedAny = (name) => namedInputs(name).some((el) => el.checked);

  const validators = {
    firstName() {
      const v = byId('firstName').value.trim();
      const ok = regex.name.test(v);
      setMsg('firstNameError', ok ? '' : 'First name is required (1-30 letters, apostrophe, dash only).');
      markField('firstName', ok);
      return ok;
    },
    mi() {
      const v = byId('mi').value.trim();
      const ok = v === '' || regex.mi.test(v);
      setMsg('miError', ok ? '' : 'Middle initial must be a single letter or blank.');
      markField('mi', ok);
      return ok;
    },
    lastName() {
      const v = byId('lastName').value.trim();
      const ok = regex.name.test(v);
      setMsg('lastNameError', ok ? '' : 'Last name is required (1-30 letters, apostrophe, dash only).');
      markField('lastName', ok);
      return ok;
    },
    ssn() {
      const raw = digits(byId('ssn').value).slice(0, 9);
      const pretty = raw.replace(/^(\d{0,3})(\d{0,2})(\d{0,4}).*$/, (_, a, b, c) => [a, b, c].filter(Boolean).join('-'));
      byId('ssn').value = pretty;
      const ok = raw.length === 9;
      setMsg('ssnError', ok ? '' : 'SSN / ID must contain exactly 9 digits.');
      markField('ssn', ok);
      return ok;
    },
    dob() {
      let v = byId('dob').value.replace(/[^\d]/g, '').slice(0, 8);
      if (v.length > 4) v = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4)}`;
      else if (v.length > 2) v = `${v.slice(0,2)}/${v.slice(2)}`;
      byId('dob').value = v;

      const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) {
        setMsg('dobError', 'DOB must be in MM/DD/YYYY format.');
        markField('dob', false);
        return false;
      }

      const mm = Number(m[1]);
      const dd = Number(m[2]);
      const yyyy = Number(m[3]);
      const date = new Date(yyyy, mm - 1, dd);
      const now = new Date();
      const oldest = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

      const isReal = date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd;
      const ok = isReal && date <= now && date >= oldest;
      setMsg('dobError', ok ? '' : 'Enter a valid DOB (not future, not older than 120 years).');
      markField('dob', ok);
      return ok;
    },
    housing() {
      const ok = checkedAny('housing');
      setMsg('housingError', ok ? '' : 'Please choose a housing option.');
      return ok;
    },
    vaccinated() {
      const ok = checkedAny('vaccinated');
      setMsg('vaccinatedError', ok ? '' : 'Please choose a vaccination option.');
      return ok;
    },
    insurance() {
      const ok = checkedAny('insurance');
      setMsg('insuranceError', ok ? '' : 'Please choose an insurance option.');
      return ok;
    },
    addr1() {
      const v = byId('addr1').value.trim();
      const ok = regex.addr.test(v);
      setMsg('addr1Error', ok ? '' : 'Address line 1 is required (2-30 characters).');
      markField('addr1', ok);
      return ok;
    },
    addr2() {
      const v = byId('addr2').value.trim();
      const ok = v === '' || regex.addr.test(v);
      setMsg('addr2Error', ok ? '' : 'Address line 2 must be 2-30 valid characters if entered.');
      markField('addr2', ok);
      return ok;
    },
    city() {
      const v = byId('city').value.trim();
      const ok = regex.city.test(v);
      setMsg('cityError', ok ? '' : 'City is required (2-30 letters and standard punctuation).');
      markField('city', ok);
      return ok;
    },
    state() {
      const ok = byId('state').value !== '';
      setMsg('stateError', ok ? '' : 'Please select a state.');
      markField('state', ok);
      return ok;
    },
    zip() {
      byId('zip').value = digits(byId('zip').value).slice(0, 5);
      const ok = regex.zip.test(byId('zip').value);
      setMsg('zipError', ok ? '' : 'Zip code must be exactly 5 digits.');
      markField('zip', ok);
      return ok;
    },
    phone() {
      const raw = digits(byId('phone').value).slice(0, 10);
      if (raw.length >= 7) byId('phone').value = `(${raw.slice(0,3)}) ${raw.slice(3,6)}-${raw.slice(6)}`;
      else if (raw.length >= 4) byId('phone').value = `(${raw.slice(0,3)}) ${raw.slice(3)}`;
      else if (raw.length > 0) byId('phone').value = `(${raw}`;
      else byId('phone').value = '';

      const ok = raw.length === 0 || raw.length === 10;
      setMsg('phoneError', ok ? '' : 'Phone is optional, but must be 10 digits when entered.');
      markField('phone', ok);
      return ok;
    },
    email() {
      const email = byId('email');
      email.value = email.value.trim().toLowerCase();
      const ok = regex.email.test(email.value);
      setMsg('emailError', ok ? '' : 'Enter a valid email in name@domain.tld format.');
      markField('email', ok);
      return ok;
    },
    username() {
      const v = byId('username').value.trim();
      const ok = regex.username.test(v);
      setMsg('usernameError', ok ? '' : 'User ID: 5-20 chars, cannot start with number, letters/numbers/-/_ only.');
      markField('username', ok);
      return ok;
    },
    password() {
      const p = byId('password').value;
      const user = byId('username').value.trim();
      const ok = regex.password.test(p) && p !== user;
      setMsg('passwordError', ok ? '' : 'Password must be 8+ chars with uppercase, lowercase, digit, and not match user ID.');
      markField('password', ok);
      return ok;
    },
    confirmPassword() {
      const p = byId('password').value;
      const c = byId('confirmPassword').value;
      const ok = c.length > 0 && c === p;
      setMsg('confirmPasswordError', ok ? '' : 'Passwords must match exactly.');
      markField('confirmPassword', ok);
      return ok;
    },
    history() {
      const ok = checkedAny('history');
      setMsg('historyError', ok ? '' : 'Select at least one medical history item.');
      return ok;
    },
    careCoverage() {
      const ok = checkedAny('careCoverage');
      setMsg('careCoverageError', ok ? '' : 'Please choose your primary care coverage.');
      return ok;
    },
    symptoms() {
      const v = byId('symptoms').value.trim();
      const ok = v.length >= 5 && v.length <= 500;
      setMsg('symptomsError', ok ? '' : 'Please describe symptoms (5-500 characters).');
      markField('symptoms', ok);
      return ok;
    },
    agreeTerms() {
      const agree = byId('agreeTerms');
      if (!agree) return true;
      const ok = agree.checked;
      setMsg('agreeTermsError', ok ? '' : 'You must agree to the Terms & Privacy Notice.');
      return ok;
    }
  };

  const setSliderValue = () => {
    if (!sliderValue || !wellnessSlider) return;
    const max = Number(wellnessSlider.max) || 10;
    sliderValue.textContent = `${wellnessSlider.value} / ${max}`;
  };
  setSliderValue();
  wellnessSlider?.addEventListener('input', setSliderValue);

  const bind = (id, fn) => {
    const el = byId(id);
    if (!el) return;
    el.addEventListener('input', fn);
    el.addEventListener('blur', fn);
  };

  bind('firstName', validators.firstName);
  bind('mi', validators.mi);
  bind('lastName', validators.lastName);
  bind('ssn', validators.ssn);
  bind('dob', validators.dob);
  bind('addr1', validators.addr1);
  bind('addr2', validators.addr2);
  bind('city', validators.city);
  bind('zip', validators.zip);
  bind('phone', validators.phone);
  bind('email', validators.email);
  bind('username', () => { validators.username(); validators.password(); validators.confirmPassword(); });
  bind('password', () => { validators.password(); validators.confirmPassword(); });
  bind('confirmPassword', validators.confirmPassword);
  bind('symptoms', validators.symptoms);
  byId('state')?.addEventListener('change', validators.state);

  ['housing', 'vaccinated', 'insurance', 'careCoverage', 'history'].forEach((name) => {
    namedInputs(name).forEach((el) => el.addEventListener('change', validators[name]));
  });
  byId('agreeTerms')?.addEventListener('change', validators.agreeTerms);

  const validateAll = () => {
    const checks = [
      validators.firstName(), validators.mi(), validators.lastName(), validators.ssn(), validators.dob(),
      validators.housing(), validators.vaccinated(), validators.insurance(), validators.addr1(), validators.addr2(),
      validators.city(), validators.state(), validators.zip(), validators.phone(), validators.email(),
      validators.username(), validators.password(), validators.confirmPassword(), validators.history(),
      validators.careCoverage(), validators.symptoms(), validators.agreeTerms()
    ];
    const ok = checks.every(Boolean);
    submitBtn.classList.toggle('hiddenBtn', !ok);
    return ok;
  };

  validateBtn.addEventListener('click', () => {
    if (validateAll()) {
      reviewContent.innerHTML = '<strong>Validation passed.</strong> You can now submit your registration.';
    } else {
      reviewContent.textContent = 'Please fix the highlighted fields before submitting.';
    }
  });

  reviewBtn.addEventListener('click', () => {
    if (!validateAll()) {
      reviewContent.textContent = 'Review unavailable until all required values are valid.';
      return;
    }

    const data = {
      name: `${byId('firstName').value.trim()} ${byId('mi').value.trim()} ${byId('lastName').value.trim()}`.replace(/\s+/g, ' ').trim(),
      dob: byId('dob').value,
      state: byId('state').value,
      email: byId('email').value,
      phone: byId('phone').value || '(not provided)',
      severity: wellnessSlider ? `${wellnessSlider.value} / ${wellnessSlider.max || 10}` : 'N/A',
      symptoms: byId('symptoms').value.trim(),
      housing: document.querySelector('input[name="housing"]:checked')?.value || 'N/A',
      coverage: document.querySelector('input[name="careCoverage"]:checked')?.value || 'N/A',
      history: Array.from(document.querySelectorAll('input[name="history"]:checked')).map((i) => i.value).join(', ')
    };

    reviewContent.innerHTML = `
      <strong>Name:</strong> ${data.name}<br>
      <strong>DOB:</strong> ${data.dob}<br>
      <strong>State:</strong> ${data.state}<br>
      <strong>Email:</strong> ${data.email}<br>
      <strong>Phone:</strong> ${data.phone}<br>
      <strong>Housing:</strong> ${data.housing}<br>
      <strong>Care Coverage:</strong> ${data.coverage}<br>
      <strong>History:</strong> ${data.history}<br>
      <strong>Symptom Severity:</strong> ${data.severity}<br>
      <strong>Symptoms:</strong> ${data.symptoms}
    `;
  });

  clearBtn?.addEventListener('click', () => {
    setTimeout(() => {
      form.querySelectorAll('.msg').forEach((m) => { m.textContent = ''; });
      document.querySelectorAll('.field').forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
      submitBtn.classList.add('hiddenBtn');
      setSliderValue();
      reviewContent.textContent = 'Press Review Data after validation to see your entries.';
    }, 0);
  });

  form.addEventListener('submit', (e) => {
    if (!validateAll()) e.preventDefault();
  });

  if (contactArea && contactBtn) {
    contactBtn.addEventListener('click', () => {
      const isOpen = contactArea.classList.toggle('open');
      contactBtn.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!contactArea.contains(event.target)) {
        contactArea.classList.remove('open');
        contactBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
