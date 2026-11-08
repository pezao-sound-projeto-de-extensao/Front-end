// Regras de senha usadas no checklist visual e na validação dos formulários.
// O back-end aceita de 5 a 20 caracteres; o front exige uma senha mais forte dentro desse limite.
export const PASSWORD_MAX_LENGTH = 20;

export const PASSWORD_RULES = [
  { text: 'Pelo menos 8 caracteres', test: (s) => s.length >= 8 },
  { text: `No máximo ${PASSWORD_MAX_LENGTH} caracteres`, test: (s) => s.length <= PASSWORD_MAX_LENGTH },
  { text: 'Uma letra maiúscula', test: (s) => /[A-Z]/.test(s) },
  { text: 'Uma letra minúscula', test: (s) => /[a-z]/.test(s) },
  { text: 'Um número', test: (s) => /[0-9]/.test(s) },
  { text: 'Um caractere especial (!@#$%^&*)', test: (s) => /[!@#$%^&*]/.test(s) },
];

/** Mensagem com as regras não atendidas, ou '' quando a senha é válida. */
export function validatePassword(password) {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.text).join(', ');
}
