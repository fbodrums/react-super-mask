import { useEffect, useRef, useCallback } from 'react';

export interface MaskOptions {
  mask: string;
  reverse?: boolean;
  placeholder?: string;
  clearIfNotMatch?: boolean;
  selectOnFocus?: boolean;
  translation?: Record<string, {
    pattern: RegExp;
    optional?: boolean;
    recursive?: boolean;
    fallback?: string;
  }>;
  onChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onComplete?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onInvalid?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (value: string, event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export interface Translation {
  pattern: RegExp;
  optional?: boolean;
  recursive?: boolean;
  fallback?: string;
}

const DEFAULT_TRANSLATION: Record<string, Translation> = {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, optional: true, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
  'X': { pattern: /[a-zA-Z0-9]/, optional: true }
};
export const useMask = (options: MaskOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  const parseMask = useCallback((mask: string) => {
    const translation = { ...DEFAULT_TRANSLATION, ...options.translation };
    const maskArray: Array<{ char: string; type: 'literal' | 'pattern'; pattern?: RegExp; optional?: boolean; recursive?: boolean }> = [];

    let isEscaped = false;

    for (let i = 0; i < mask.length; i++) {
      const char = mask[i];

      if (char === '\\' && !isEscaped) {
        isEscaped = true;
        continue;
      }

      if (isEscaped || !translation[char]) {
        maskArray.push({ char, type: 'literal' });
        isEscaped = false;
      } else {
        maskArray.push({
          char,
          type: 'pattern',
          pattern: translation[char].pattern,
          optional: translation[char].optional,
          recursive: translation[char].recursive
        });
      }
    }

    return maskArray;
  }, [options.translation]);
  const extractValidChars = useCallback((value: string, maskArray: any[]): string => {
    const translation = { ...DEFAULT_TRANSLATION, ...options.translation };
    const allPatterns = maskArray
      .filter(item => item.type === 'pattern')
      .map(item => item.pattern)
      .filter(Boolean);

    if (allPatterns.length === 0) return '';

    const combinedPattern = new RegExp(allPatterns.map(p => p.source).join('|'), 'g');
    const matches = value.match(combinedPattern);
    return matches ? matches.join('') : '';
  }, [options.translation]);
  const applyMask = useCallback((value: string, mask: string, reverse = false): { masked: string; isComplete: boolean } => {
    if (!mask) return { masked: '', isComplete: false };
    if (!value) return { masked: '', isComplete: false };

    const maskArray = parseMask(mask);

    if (reverse) {
      return applyReverseMask(value, maskArray);
    }

    const validChars = extractValidChars(value, maskArray);
    let valueIndex = 0;
    let maskedValue = '';
    let requiredChars = 0;
    let filledChars = 0;
    let recursiveItem: any = null;

    for (const item of maskArray) {
      if (item.recursive) {
        recursiveItem = item;
        break;
      }
    }

    for (let i = 0; i < maskArray.length; i++) {
      const maskItem = maskArray[i];

      if (maskItem.type === 'literal') {
        maskedValue += maskItem.char;
      } else if (maskItem.pattern) {
        if (!maskItem.optional) {
          requiredChars++;
        }

        if (maskItem.recursive) {

          while (valueIndex < validChars.length && maskItem.pattern.test(validChars[valueIndex])) {
            maskedValue += validChars[valueIndex];
            valueIndex++;
            filledChars++;
          }
        } else if (valueIndex < validChars.length) {
          const char = validChars[valueIndex];
          if (maskItem.pattern.test(char)) {
            maskedValue += char;
            valueIndex++;
            filledChars++;
          } else if (!maskItem.optional) {
            break;
          }
        } else if (!maskItem.optional) {
          break;
        }
      }
    }

    const isComplete = filledChars >= requiredChars && valueIndex >= validChars.length;

    return { masked: maskedValue, isComplete };
  }, [parseMask, extractValidChars]);

  const applyReverseMask = useCallback((value: string, maskArray: any[]): { masked: string; isComplete: boolean } => {
    const validChars = extractValidChars(value, maskArray);
    if (!validChars) return { masked: '', isComplete: false };

    let maskedValue = '';
    let valueIndex = validChars.length - 1;
    let requiredChars = 0;
    let filledChars = 0;
    let digitCount = 0;
    for (const item of maskArray) {
      if (item.type === 'pattern' && !item.optional) {
        requiredChars++;
      }
    }

    // Identifica se é máscara monetária (tem vírgula como separador decimal)
    const isMoneyMask = maskArray.some(item => item.type === 'literal' && item.char === ',');
    const decimalIndex = isMoneyMask ? maskArray.findIndex(item => item.type === 'literal' && item.char === ',') : -1;

    if (isMoneyMask && decimalIndex >= 0) {
      let cents = '';
      const centsCount = maskArray.length - 1 - decimalIndex;

      for (let i = 0; i < centsCount && valueIndex >= 0; i++) {
        const char = validChars[valueIndex];
        if (/\d/.test(char)) {
          cents = char + cents;
          valueIndex--;
          filledChars++;
        }
      }

      while (cents.length < centsCount) {
        cents = '0' + cents;
      }

      maskedValue = ',' + cents;

      let integerDigits = '';
      for (let i = decimalIndex - 1; i >= 0; i--) {
        const maskItem = maskArray[i];

        if (maskItem.type === 'literal' && maskItem.char === '.') {
          continue;
        }

        if (maskItem.type === 'pattern') {
          if (maskItem.recursive) {
            while (valueIndex >= 0 && maskItem.pattern.test(validChars[valueIndex])) {
              integerDigits = validChars[valueIndex] + integerDigits;
              valueIndex--;
              filledChars++;
            }
          } else if (valueIndex >= 0 && maskItem.pattern.test(validChars[valueIndex])) {
            integerDigits = validChars[valueIndex] + integerDigits;
            valueIndex--;
            filledChars++;
          }
        }
      }

      if (integerDigits === '') {
        integerDigits = '0';
      } else {
        integerDigits = integerDigits.replace(/^0+/, '') || '0';
      }

      let formattedInteger = '';
      for (let i = integerDigits.length - 1; i >= 0; i--) {
        if (formattedInteger.length > 0 && (integerDigits.length - 1 - i) % 3 === 0) {
          formattedInteger = '.' + formattedInteger;
        }
        formattedInteger = integerDigits[i] + formattedInteger;
      }

      maskedValue = formattedInteger + maskedValue;
    } else {
      for (let i = maskArray.length - 1; i >= 0; i--) {
        const maskItem = maskArray[i];

        if (maskItem.type === 'literal') {
          if (maskItem.char === '.' && digitCount > 0 && digitCount % 3 === 0) {
            maskedValue = maskItem.char + maskedValue;
            digitCount = 0;
          } else if (maskItem.char !== '.') {
            maskedValue = maskItem.char + maskedValue;
          }
        } else if (maskItem.pattern) {
          if (maskItem.recursive) {
            while (valueIndex >= 0 && maskItem.pattern.test(validChars[valueIndex])) {
              if (digitCount > 0 && digitCount % 3 === 0) {
                maskedValue = '.' + maskedValue;
              }
              maskedValue = validChars[valueIndex] + maskedValue;
              valueIndex--;
              filledChars++;
              digitCount++;
            }
          } else if (valueIndex >= 0) {
            const char = validChars[valueIndex];
            if (maskItem.pattern.test(char)) {
              if (digitCount > 0 && digitCount % 3 === 0) {
                maskedValue = '.' + maskedValue;
              }
              maskedValue = char + maskedValue;
              valueIndex--;
              filledChars++;
              digitCount++;
            } else if (!maskItem.optional) {
              break;
            }
          } else if (!maskItem.optional) {
            break;
          }
        }
      }
    }

    if (maskedValue.startsWith('.')) {
      maskedValue = maskedValue.substring(1);
    }

    const isComplete = filledChars >= requiredChars && valueIndex < 0;
    return { masked: maskedValue, isComplete };
  }, [extractValidChars]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const { mask, reverse, clearIfNotMatch, onChange, onComplete, onInvalid } = optionsRef.current;

    const { masked, isComplete } = applyMask(value, mask, reverse);

    if (inputRef.current) {
      inputRef.current.value = masked;
    }

    if (clearIfNotMatch && !isComplete && value.length > 0) {
      if (onInvalid) {
        onInvalid(masked, event);
      }
    }

    if (onChange) {
      onChange(masked, event);
    }

    if (isComplete && onComplete) {
      onComplete(masked, event);
    }
  }, [applyMask]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const { selectOnFocus } = optionsRef.current;

    if (selectOnFocus && inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyPress } = optionsRef.current;

    if (onKeyPress) {
      onKeyPress(event.currentTarget.value, event);
    }
  }, []);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const { mask, reverse, placeholder } = optionsRef.current;

    if (placeholder) {
      input.placeholder = placeholder;
    }

    if (input.value) {
      const { masked } = applyMask(input.value, mask, reverse);
      input.value = masked;
    }

    input.addEventListener('input', handleChange as any);
    input.addEventListener('focus', handleFocus as any);
    input.addEventListener('keypress', handleKeyPress as any);

    return () => {
      input.removeEventListener('input', handleChange as any);
      input.removeEventListener('focus', handleFocus as any);
      input.removeEventListener('keypress', handleKeyPress as any);
    };
  }, [applyMask, handleChange, handleFocus, handleKeyPress]);

  return { inputRef };
};

export const unmask = (value: string, mask?: string): string => {
  if (!mask) {
    return value.replace(/[^\w]/g, '');
  }
  const translation = { ...DEFAULT_TRANSLATION };
  let cleanValue = value;
  let isEscaped = false;

  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];
    if (char === '\\' && !isEscaped) {
      isEscaped = true;
      continue;
    }
    if (isEscaped || !translation[char]) {
      cleanValue = cleanValue.replace(new RegExp(`\\${char}`, 'g'), '');
    }
    isEscaped = false;
  }

  return cleanValue;
};

export const isComplete = (value: string, mask: string, translation?: Record<string, { pattern: RegExp; optional?: boolean }>): boolean => {
  if (!mask || !value) return false;

  const trans = translation || DEFAULT_TRANSLATION;
  let requiredChars = 0;
  let filledChars = 0;
  let isEscaped = false;
  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];
    if (char === '\\' && !isEscaped) {
      isEscaped = true;
      continue;
    }
    if (isEscaped || !trans[char]) {
      isEscaped = false;
      continue;
    }
    if (!trans[char].optional) {
      requiredChars++;
    }
  }
  const cleanValue = unmask(value, mask);
  filledChars = cleanValue.length;

  return filledChars >= requiredChars;
};

type MaskArrayItem = {
  char: string;
  type: 'literal' | 'pattern';
  pattern?: RegExp;
  optional?: boolean;
  recursive?: boolean;
};

const parseMaskPure = (mask: string, translation: Record<string, Translation> = DEFAULT_TRANSLATION): MaskArrayItem[] => {
  const maskArray: MaskArrayItem[] = [];
  let isEscaped = false;

  for (let i = 0; i < mask.length; i++) {
    const char = mask[i];

    if (char === '\\' && !isEscaped) {
      isEscaped = true;
      continue;
    }

    if (isEscaped || !translation[char]) {
      maskArray.push({ char, type: 'literal' });
      isEscaped = false;
    } else {
      maskArray.push({
        char,
        type: 'pattern',
        pattern: translation[char].pattern,
        optional: translation[char].optional,
        recursive: translation[char].recursive
      });
    }
  }

  return maskArray;
};

const extractValidCharsPure = (value: string, maskArray: MaskArrayItem[]): string => {
  const allPatterns = maskArray
    .filter(item => item.type === 'pattern')
    .map(item => item.pattern)
    .filter(Boolean) as RegExp[];

  if (allPatterns.length === 0) return '';

  const combinedPattern = new RegExp(allPatterns.map(p => p.source).join('|'), 'g');
  const matches = value.match(combinedPattern);
  return matches ? matches.join('') : '';
};

const applyReverseMaskPure = (value: string, maskArray: MaskArrayItem[]): { masked: string; isComplete: boolean } => {
  const validChars = extractValidCharsPure(value, maskArray);
  if (!validChars) return { masked: '', isComplete: false };

  let maskedValue = '';
  let valueIndex = validChars.length - 1;
  let requiredChars = 0;
  let filledChars = 0;
  let digitCount = 0;

  for (const item of maskArray) {
    if (item.type === 'pattern' && !item.optional) {
      requiredChars++;
    }
  }

  // Identifica se é máscara monetária (tem vírgula como separador decimal)
  const isMoneyMask = maskArray.some(item => item.type === 'literal' && item.char === ',');
  const decimalIndex = isMoneyMask ? maskArray.findIndex(item => item.type === 'literal' && item.char === ',') : -1;

  if (isMoneyMask && decimalIndex >= 0) {
    let cents = '';
    const centsCount = maskArray.length - 1 - decimalIndex;

    for (let i = 0; i < centsCount && valueIndex >= 0; i++) {
      const char = validChars[valueIndex];
      if (/\d/.test(char)) {
        cents = char + cents;
        valueIndex--;
        filledChars++;
      }
    }

    while (cents.length < centsCount) {
      cents = '0' + cents;
    }

    maskedValue = ',' + cents;

    let integerDigits = '';
    for (let i = decimalIndex - 1; i >= 0; i--) {
      const maskItem = maskArray[i];

      if (maskItem.type === 'literal' && maskItem.char === '.') {
        continue;
      }

      if (maskItem.type === 'pattern') {
        if (maskItem.recursive) {
          while (valueIndex >= 0 && maskItem.pattern!.test(validChars[valueIndex])) {
            integerDigits = validChars[valueIndex] + integerDigits;
            valueIndex--;
            filledChars++;
          }
        } else if (valueIndex >= 0 && maskItem.pattern!.test(validChars[valueIndex])) {
          integerDigits = validChars[valueIndex] + integerDigits;
          valueIndex--;
          filledChars++;
        }
      }
    }

    if (integerDigits === '') {
      integerDigits = '0';
    } else {
      integerDigits = integerDigits.replace(/^0+/, '') || '0';
    }

    let formattedInteger = '';
    for (let i = integerDigits.length - 1; i >= 0; i--) {
      if (formattedInteger.length > 0 && (integerDigits.length - 1 - i) % 3 === 0) {
        formattedInteger = '.' + formattedInteger;
      }
      formattedInteger = integerDigits[i] + formattedInteger;
    }

    maskedValue = formattedInteger + maskedValue;
  } else {
    for (let i = maskArray.length - 1; i >= 0; i--) {
      const maskItem = maskArray[i];

      if (maskItem.type === 'literal') {
        if (maskItem.char === '.' && digitCount > 0 && digitCount % 3 === 0) {
          maskedValue = maskItem.char + maskedValue;
          digitCount = 0;
        } else if (maskItem.char !== '.') {
          maskedValue = maskItem.char + maskedValue;
        }
      } else if (maskItem.pattern) {
        if (maskItem.recursive) {
          while (valueIndex >= 0 && maskItem.pattern.test(validChars[valueIndex])) {
            if (digitCount > 0 && digitCount % 3 === 0) {
              maskedValue = '.' + maskedValue;
            }
            maskedValue = validChars[valueIndex] + maskedValue;
            valueIndex--;
            filledChars++;
            digitCount++;
          }
        } else if (valueIndex >= 0) {
          const char = validChars[valueIndex];
          if (maskItem.pattern.test(char)) {
            if (digitCount > 0 && digitCount % 3 === 0) {
              maskedValue = '.' + maskedValue;
            }
            maskedValue = char + maskedValue;
            valueIndex--;
            filledChars++;
            digitCount++;
          } else if (!maskItem.optional) {
            break;
          }
        } else if (!maskItem.optional) {
          break;
        }
      }
    }
  }

  if (maskedValue.startsWith('.')) {
    maskedValue = maskedValue.substring(1);
  }

  const isComplete = filledChars >= requiredChars && valueIndex < 0;
  return { masked: maskedValue, isComplete };
};

/**
 * Aplica uma máscara a qualquer string, retornando o valor formatado
 * 
 * @param value - O valor a ser formatado
 * @param mask - A máscara a ser aplicada (ex: "(00) 00000-0000", "000.000.000-00")
 * @param options - Opções adicionais
 * @param options.reverse - Se true, aplica máscara reversa (útil para valores monetários)
 * @param options.translation - Traduções customizadas para caracteres da máscara
 * @returns O valor formatado com a máscara aplicada
 * 
 * @example
 * ```ts
 * import { mask } from 'react-super-mask';
 * 
 * // Formatar telefone
 * mask('11987654321', '(00) 00000-0000'); // "(11) 98765-4321"
 * 
 * // Formatar CPF
 * mask('12345678900', '000.000.000-00'); // "123.456.789-00"
 * 
 * // Formatar valor monetário (reverso)
 * mask('123456', '#.##0,00', { reverse: true }); // "1.234,56"
 * 
 * // Usar em HTML/JSX
 * <span>{mask(userPhone, '(00) 00000-0000')}</span>
 * ```
 */
export const mask = (
  value: string,
  mask: string,
  options?: {
    reverse?: boolean;
    translation?: Record<string, Translation>;
  }
): string => {
  if (!mask) return '';
  if (!value) return '';

  const translation = { ...DEFAULT_TRANSLATION, ...options?.translation };
  const maskArray = parseMaskPure(mask, translation);

  if (options?.reverse) {
    return applyReverseMaskPure(value, maskArray).masked;
  }

  const validChars = extractValidCharsPure(value, maskArray);
  let valueIndex = 0;
  let maskedValue = '';
  let requiredChars = 0;
  let filledChars = 0;

  for (let i = 0; i < maskArray.length; i++) {
    const maskItem = maskArray[i];

    if (maskItem.type === 'literal') {
      maskedValue += maskItem.char;
    } else if (maskItem.pattern) {
      if (!maskItem.optional) {
        requiredChars++;
      }

      if (maskItem.recursive) {
        while (valueIndex < validChars.length && maskItem.pattern.test(validChars[valueIndex])) {
          maskedValue += validChars[valueIndex];
          valueIndex++;
          filledChars++;
        }
      } else if (valueIndex < validChars.length) {
        const char = validChars[valueIndex];
        if (maskItem.pattern.test(char)) {
          maskedValue += char;
          valueIndex++;
          filledChars++;
        } else if (!maskItem.optional) {
          break;
        }
      } else if (!maskItem.optional) {
        break;
      }
    }
  }

  return maskedValue;
};

export default useMask;