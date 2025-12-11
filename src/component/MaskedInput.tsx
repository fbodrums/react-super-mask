import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useMask } from './useMask';

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onKeyPress'> {
  mask: string;
  reverse?: boolean;
  maskPlaceholder?: string;
  clearIfNotMatch?: boolean;
  selectOnFocus?: boolean;
  translation?: Record<string, {
    pattern: RegExp;
    optional?: boolean;
    recursive?: boolean;
    fallback?: string;
  }>;
  onMaskChange?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onComplete?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onInvalid?: (value: string, event?: React.ChangeEvent<HTMLInputElement>) => void;
  onMaskKeyPress?: (value: string, event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Componente de input com máscara
 * 
 * @example
 * <MaskedInput
 *   mask="(00) 00000-0000"
 *   placeholder="Digite seu telefone"
 *   onComplete={(value) => console.log('Completo:', value)}
 * />
 */
export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>((props, forwardedRef) => {
  const {
    mask,
    reverse = false,
    maskPlaceholder,
    clearIfNotMatch = false,
    selectOnFocus = false,
    translation,
    onMaskChange,
    onComplete,
    onInvalid,
    onMaskKeyPress,
    placeholder,
    ...inputProps
  } = props;

  const internalRef = useMask({
    mask,
    reverse,
    placeholder: maskPlaceholder || placeholder,
    clearIfNotMatch,
    selectOnFocus,
    translation,
    onChange: onMaskChange,
    onComplete,
    onInvalid,
    onKeyPress: onMaskKeyPress
  });

  // Combina refs (interno e externo)
  const setRefs = React.useCallback(
    (node: HTMLInputElement) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node;

      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    },
    [forwardedRef, internalRef]
  );

  return (
    <input
      ref={setRefs}
      type="text"
      placeholder={placeholder}
      {...inputProps}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;