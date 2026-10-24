const form = document.querySelector("#auth-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmInput = document.querySelector("#confirm-password");
const confirmField = document.querySelector("#confirm-field");
const rememberRow = document.querySelector("#remember-row");
const formMessage = document.querySelector("#form-message");
const modeButtons = document.querySelectorAll(".mode-button");

let mode = "login";
let submitted = false;
const touchedFields = new Set();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(input, message) {
  const error = document.querySelector(`#${input.id}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  error.textContent = message;
}

function validateEmail() {
  const value = emailInput.value.trim();
  const message = !value
    ? "Enter your email address."
    : !emailPattern.test(value)
      ? "Enter a valid email address."
      : "";

  setFieldError(emailInput, message);
  return !message;
}

function validatePassword() {
  let message = "";

  if (!passwordInput.value) {
    message = "Enter your password.";
  } else if (passwordInput.value.length < 8) {
    message = "Use at least 8 characters.";
  }

  setFieldError(passwordInput, message);
  return !message;
}

function validateConfirmPassword() {
  if (mode !== "register") {
    setFieldError(confirmInput, "");
    return true;
  }

  let message = "";
  if (!confirmInput.value) {
    message = "Confirm your password.";
  } else if (confirmInput.value !== passwordInput.value) {
    message = "Passwords do not match.";
  }

  setFieldError(confirmInput, message);
  return !message;
}

function validateForm() {
  const emailIsValid = validateEmail();
  const passwordIsValid = validatePassword();
  const confirmationIsValid = validateConfirmPassword();
  return emailIsValid && passwordIsValid && confirmationIsValid;
}

function clearFormMessage() {
  formMessage.textContent = "";
  formMessage.classList.remove("is-error");
}

function updateMode(nextMode) {
  if (mode !== nextMode) {
    passwordInput.value = "";
    confirmInput.value = "";
    document.querySelectorAll(".visibility-toggle").forEach((button) => {
      const input = document.querySelector(`#${button.dataset.target}`);
      input.type = "password";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute(
        "aria-label",
        input.id === "confirm-password" ? "Show confirm password" : "Show password",
      );
    });
  }

  mode = nextMode;
  submitted = false;
  touchedFields.clear();
  clearFormMessage();

  const isRegister = mode === "register";
  document.querySelector("#form-eyebrow").textContent = isRegister
    ? "A FRESH START BEGINS HERE"
    : "NICE TO SEE YOU AGAIN";
  document.querySelector("#page-title").textContent = isRegister
    ? "Create your account"
    : "Welcome back";
  document.querySelector("#form-description").textContent = isRegister
    ? "Sign up to make space for what matters."
    : "Sign in to pick up where you left off.";
  document.querySelector("#submit-label").textContent = isRegister
    ? "Create account"
    : "Sign in";
  confirmField.classList.toggle("is-hidden", !isRegister);
  confirmInput.disabled = !isRegister;
  confirmInput.required = isRegister;
  rememberRow.classList.toggle("is-hidden", isRegister);
  document.querySelector(".forgot-link").classList.toggle("is-hidden", isRegister);
  passwordInput.autocomplete = isRegister ? "new-password" : "current-password";

  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  [emailInput, passwordInput, confirmInput].forEach((input) => {
    setFieldError(input, "");
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => updateMode(button.dataset.mode));
});

document.querySelector("#forgot-button").addEventListener("click", () => {
  formMessage.classList.remove("is-error");
  formMessage.textContent =
    "Password reset is available after connecting an authentication service.";
});

modeButtons.forEach((button, index) => {
  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + modeButtons.length) % modeButtons.length;
    modeButtons[nextIndex].focus();
    updateMode(modeButtons[nextIndex].dataset.mode);
  });
});

emailInput.addEventListener("input", () => {
  if (submitted || touchedFields.has(emailInput)) validateEmail();
  clearFormMessage();
});

passwordInput.addEventListener("input", () => {
  if (submitted || touchedFields.has(passwordInput)) {
    validatePassword();
    if (mode === "register" && touchedFields.has(confirmInput)) validateConfirmPassword();
  }
  clearFormMessage();
});

confirmInput.addEventListener("input", () => {
  if (submitted || touchedFields.has(confirmInput)) {
    validateConfirmPassword();
  }
  clearFormMessage();
});

[
  [emailInput, validateEmail],
  [passwordInput, validatePassword],
  [confirmInput, validateConfirmPassword],
].forEach(([input, validate]) => {
  input.addEventListener("blur", () => {
    touchedFields.add(input);
    if (mode === "register" || input !== confirmInput) validate();
  });
});

document.querySelectorAll(".visibility-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.querySelector(`#${button.dataset.target}`);
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    button.setAttribute("aria-pressed", String(!isVisible));
    button.setAttribute(
      "aria-label",
      `${isVisible ? "Show" : "Hide"} ${input.id === "confirm-password" ? "confirm password" : "password"}`,
    );
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitted = true;

  if (!validateForm()) {
    formMessage.textContent = "Please correct the highlighted fields.";
    formMessage.classList.add("is-error");
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  formMessage.classList.remove("is-error");
  formMessage.textContent =
    "Your details look good. This demo does not create an account or sign you in.";
});

updateMode("login");
