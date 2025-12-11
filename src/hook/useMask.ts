import { useEffect, useRef, useCallback } from 'react';

interface MaskOptions {
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

// Definições padrão de máscara
const DEFAULT_TRANSLATION: Record<string, { pattern: RegExp; optional?: boolean }> = {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, optional: true, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
  'X': { pattern: /[a-zA-Z0-9]/, optional: true }
};

/**
 * Hook personalizado para aplicar máscaras em inputs
 * 
 * @example
 * const inputRef = useMask({
 *   mask: '(00) 00000-0000',
 *   placeholder: '(00) 00000-0000'
 * });
 */
export const useMask = (options: MaskOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef(options);

  // Atualiza as opções sem recriar o hook
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Parser de máscara
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

  // Aplica a máscara ao valor
  const applyMask = useCallback((value: string, mask: string, reverse = false): { masked: string; isComplete: boolean } => {
    if (!mask || !value) return { masked: '', isComplete: false };

    const maskArray = parseMask(mask);
    const cleanValue = value.replace(/\D/g, '');

    if (reverse) {
      return applyReverseMask(cleanValue, maskArray);
    }

    let maskedValue = '';
    let valueIndex = 0;
    let isComplete = true;

    for (let i = 0; i < maskArray.length && valueIndex < cleanValue.length; i++) {
      const maskItem = maskArray[i];

      if (maskItem.type === 'literal') {
        maskedValue += maskItem.char;
      } else if (maskItem.pattern) {
        const char = cleanValue[valueIndex];

        if (maskItem.pattern.test(char)) {
          maskedValue += char;
          valueIndex++;
        } else if (!maskItem.optional) {
          isComplete = false;
          break;
        }
      }
    }

    // Verifica se todos os caracteres obrigatórios foram preenchidos
    if (valueIndex < cleanValue.length || valueIndex === 0) {
      isComplete = false;
    }

    return { masked: maskedValue, isComplete };
  }, [parseMask]);

  // Aplica máscara reversa (útil para valores monetários)
  const applyReverseMask = useCallback((value: string, maskArray: any[]): { masked: string; isComplete: boolean } => {
    let maskedValue = '';
    let valueIndex = value.length - 1;

    for (let i = maskArray.length - 1; i >= 0 && valueIndex >= 0; i--) {
      const maskItem = maskArray[i];

      if (maskItem.type === 'literal') {
        maskedValue = maskItem.char + maskedValue;
      } else if (maskItem.pattern) {
        const char = value[valueIndex];

        if (maskItem.pattern.test(char)) {
          maskedValue = char + maskedValue;
          valueIndex--;
        }
      }
    }

    return { masked: maskedValue, isComplete: valueIndex < 0 };
  }, []);

  // Handler de mudança de valor
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

  // Handler de foco
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const { selectOnFocus } = optionsRef.current;

    if (selectOnFocus && inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  // Handler de tecla pressionada
  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const { onKeyPress } = optionsRef.current;

    if (onKeyPress) {
      onKeyPress(event.currentTarget.value, event);
    }
  }, []);

  // Aplica eventos ao input
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const { mask, reverse, placeholder } = optionsRef.current;

    // Define placeholder se fornecido
    if (placeholder) {
      input.placeholder = placeholder;
    }

    // Aplica máscara inicial se houver valor
    if (input.value) {
      const { masked } = applyMask(input.value, mask, reverse);
      input.value = masked;
    }

    // Adiciona event listeners
    input.addEventListener('input', handleChange as any);
    input.addEventListener('focus', handleFocus as any);
    input.addEventListener('keypress', handleKeyPress as any);

    return () => {
      input.removeEventListener('input', handleChange as any);
      input.removeEventListener('focus', handleFocus as any);
      input.removeEventListener('keypress', handleKeyPress as any);
    };
  }, [applyMask, handleChange, handleFocus, handleKeyPress]);

  return inputRef;
};

/**
 * Função auxiliar para obter o valor sem máscara
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Função auxiliar para validar se um valor está completo de acordo com a máscara
 */
export const isComplete = (value: string, mask: string): boolean => {
  const cleanValue = value.replace(/\D/g, '');
  const maskDigits = mask.replace(/[^\d#0]/g, '').length;
  return cleanValue.length >= maskDigits;
};

export default useMask;