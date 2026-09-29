export const MASKS = {
  cpf: {
    pattern: /\d/,
    format: (value) => {
      const nums = value.replace(/\D/g, '').slice(0, 11);
      if (nums.length <= 3) return nums;
      if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
      if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
      return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
    },
    validate: (value) => {
      const nums = value.replace(/\D/g, '');
      if (nums.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(nums)) return false;
      let sum = 0;
      for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
      let rev = (sum * 10) % 11;
      if (rev === 10 || rev === 11) rev = 0;
      if (rev !== parseInt(nums[9])) return false;
      sum = 0;
      for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
      rev = (sum * 10) % 11;
      if (rev === 10 || rev === 11) rev = 0;
      return rev === parseInt(nums[10]);
    },
    placeholder: '000.000.000-00',
  },
  cnpj: {
    pattern: /\d/,
    format: (value) => {
      const nums = value.replace(/\D/g, '').slice(0, 14);
      if (nums.length <= 2) return nums;
      if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
      if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
      if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
      return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
    },
    validate: (value) => {
      const nums = value.replace(/\D/g, '');
      if (nums.length !== 14) return false;
      if (/^(\d)\1{13}$/.test(nums)) return false;
      let sum = 0;
      let pos = 5;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(nums[i]) * pos;
        pos = pos === 2 ? 9 : pos - 1;
      }
      let rev = sum % 11;
      rev = rev < 2 ? 0 : 11 - rev;
      if (rev !== parseInt(nums[12])) return false;
      sum = 0;
      pos = 6;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(nums[i]) * pos;
        pos = pos === 2 ? 9 : pos - 1;
      }
      rev = sum % 11;
      rev = rev < 2 ? 0 : 11 - rev;
      return rev === parseInt(nums[13]);
    },
    placeholder: '00.000.000/0000-00',
  },
  phone: {
    pattern: /\d/,
    format: (value) => {
      const nums = value.replace(/\D/g, '').slice(0, 11);
      if (nums.length <= 2) return `(${nums}`;
      if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
      if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    },
    validate: (value) => {
      const nums = value.replace(/\D/g, '');
      return nums.length >= 10 && nums.length <= 11;
    },
    placeholder: '(00) 0000-0000',
  },
  cep: {
    pattern: /\d/,
    format: (value) => {
      const nums = value.replace(/\D/g, '').slice(0, 8);
      if (nums.length <= 5) return nums;
      return `${nums.slice(0, 5)}-${nums.slice(5)}`;
    },
    validate: (value) => value.replace(/\D/g, '').length === 8,
    placeholder: '00000-000',
  },
  currency: {
    pattern: /[\d,]/,
    format: (value) => {
      const nums = value.replace(/[^\d,]/g, '').replace(/,{2,}/g, ',');
      const parts = nums.split(',');
      if (parts.length > 2) return `${parts[0]},${parts.slice(1).join('')}`;
      if (parts[0]) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return parts.join(',');
    },
    parse: (value) => parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0,
    placeholder: '0,00',
  },
  date: {
    pattern: /\d/,
    format: (value) => {
      const nums = value.replace(/\D/g, '').slice(0, 8);
      if (nums.length <= 2) return nums;
      if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
      return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4)}`;
    },
    validate: (value) => {
      const nums = value.replace(/\D/g, '');
      if (nums.length !== 8) return false;
      const day = parseInt(nums.slice(0, 2));
      const month = parseInt(nums.slice(2, 4));
      const year = parseInt(nums.slice(4));
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    },
    placeholder: 'DD/MM/AAAA',
  },
  number: {
    pattern: /\d/,
    format: (value) => value.replace(/\D/g, ''),
    placeholder: '',
  },
  decimal: {
    pattern: /[\d.,]/,
    format: (value) => {
      let nums = value.replace(/[^\d.,]/g, '');
      const parts = nums.split(/[.,]/);
      if (parts.length > 2) nums = parts[0] + ',' + parts.slice(1).join('');
      return nums.replace(/\./g, ',');
    },
    placeholder: '0,00',
  },
};

export function applyMask(value, maskType) {
  const mask = MASKS[maskType];
  if (!mask) return value;
  return mask.format(value);
}

export function validateMask(value, maskType) {
  const mask = MASKS[maskType];
  if (!mask) return true;
  return mask.validate(value);
}

export function getMaskPlaceholder(maskType) {
  const mask = MASKS[maskType];
  return mask?.placeholder || '';
}

export function unmaskCurrency(value) {
  return MASKS.currency.parse(value);
}

export function unmaskValue(value, maskType) {
  switch (maskType) {
    case 'currency':
      return MASKS.currency.parse(value);
    case 'cpf':
    case 'cnpj':
    case 'phone':
    case 'cep':
      return value.replace(/\D/g, '');
    default:
      return value.replace(/\D/g, '');
  }
}