import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useMask, unmask, isComplete } from './useMask';
import { MaskedInput } from './MaskedInput';

describe('useMask', () => {
  describe('Phone mask', () => {
    it('should apply Brazilian phone mask', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '(00) 00000-0000' })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '11987654321';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('(11) 98765-4321');
    });

    it('should handle incomplete phone input', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '(00) 00000-0000' })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '119876';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('(11) 9876');
    });
  });

  describe('CPF mask', () => {
    it('should apply CPF mask', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '000.000.000-00' })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '12345678909';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('123.456.789-09');
    });
  });

  describe('CNPJ mask', () => {
    it('should apply CNPJ mask', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '00.000.000/0000-00' })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '12345678000190';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('12.345.678/0001-90');
    });
  });

  describe('Date mask', () => {
    it('should apply date mask', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '00/00/0000' })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '25122024';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('25/12/2024');
    });
  });

  describe('CEP mask', () => {
    it('should apply CEP mask', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '00000-000' })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '01310100';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('01310-100');
    });
  });

  describe('Reverse mask (money)', () => {
    it('should apply reverse mask for currency', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '#.##0,00', reverse: true })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '123456';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('1.234,56');
    });
  });

  describe('Custom translation', () => {
    it('should use custom translation pattern', () => {
      const { result } = renderHook(() =>
        useMask({
          mask: 'AAA-0000',
          translation: {
            'A': { pattern: /[A-Z]/ },
            '0': { pattern: /[0-9]/ }
          }
        })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = 'ABC1234';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(input.value).toBe('ABC-1234');
    });
  });

  describe('Callbacks', () => {
    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useMask({ mask: '00000-000', onChange })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '01310100';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(onChange).toHaveBeenCalledWith('01310-100', expect.any(Object));
    });

    it('should call onComplete callback when mask is complete', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useMask({ mask: '00000-000', onComplete })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '01310100';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(onComplete).toHaveBeenCalledWith('01310-100', expect.any(Object));
    });

    it('should not call onComplete callback when mask is incomplete', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() =>
        useMask({ mask: '00000-000', onComplete })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '0131';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('selectOnFocus option', () => {
    it('should select all text on focus when selectOnFocus is true', () => {
      const { result } = renderHook(() =>
        useMask({ mask: '00000-000', selectOnFocus: true })
      );

      const input = document.createElement('input');
      input.select = jest.fn();
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = '01310-100';
        input.dispatchEvent(new Event('focus', { bubbles: true }));
      });

      expect(input.select).toHaveBeenCalled();
    });
  });

  describe('clearIfNotMatch option', () => {
    it('should call onInvalid when clearIfNotMatch is true and value is invalid', () => {
      const onInvalid = jest.fn();
      const { result } = renderHook(() =>
        useMask({ mask: '00000-000', clearIfNotMatch: true, onInvalid })
      );

      const input = document.createElement('input');
      (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

      act(() => {
        input.value = 'abc';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(onInvalid).toHaveBeenCalled();
    });
  });
});

describe('MaskedInput Component', () => {
  it('should render input with mask', () => {
    render(
      <MaskedInput
        mask="(00) 00000-0000"
        placeholder = "Phone number"
        data - testid="phone-input"
    />
    );

    const input = screen.getByTestId('phone-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.placeholder).toBe('Phone number');
  });

  it('should apply mask on input change', () => {
    render(
      <MaskedInput
        mask="(00) 00000-0000"
        data - testid="phone-input"
    />
    );

    const input = screen.getByTestId('phone-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '11987654321' } });

    expect(input.value).toBe('(11) 98765-4321');
  });

  it('should call onMaskChange callback', () => {
    const handleChange = jest.fn();

    render(
      <MaskedInput
        mask="(00) 00000-0000"
        onMaskChange = { handleChange }
        data - testid="phone-input"
    />
    );

    const input = screen.getByTestId('phone-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '11987654321' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <MaskedInput
        ref={ ref }
        mask = "(00) 00000-0000"
        data - testid="phone-input"
    />
    );

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('Utility functions', () => {
  describe('unmask', () => {
    it('should remove mask from phone number', () => {
      expect(unmask('(11) 98765-4321')).toBe('11987654321');
    });

    it('should remove mask from CPF', () => {
      expect(unmask('123.456.789-09')).toBe('12345678909');
    });

    it('should remove mask from CEP', () => {
      expect(unmask('01310-100')).toBe('01310100');
    });

    it('should return empty string for empty input', () => {
      expect(unmask('')).toBe('');
    });

    it('should handle strings with only non-digits', () => {
      expect(unmask('abc-def')).toBe('');
    });
  });

  describe('isComplete', () => {
    it('should return true for complete phone number', () => {
      expect(isComplete('(11) 98765-4321', '(00) 00000-0000')).toBe(true);
    });

    it('should return false for incomplete phone number', () => {
      expect(isComplete('(11) 9876', '(00) 00000-0000')).toBe(false);
    });

    it('should return true for complete CPF', () => {
      expect(isComplete('123.456.789-09', '000.000.000-00')).toBe(true);
    });

    it('should return false for incomplete CPF', () => {
      expect(isComplete('123.456', '000.000.000-00')).toBe(false);
    });

    it('should return false for empty value', () => {
      expect(isComplete('', '00000-000')).toBe(false);
    });
  });
});

describe('Edge cases', () => {
  it('should handle empty mask', () => {
    const { result } = renderHook(() =>
      useMask({ mask: '' })
    );

    const input = document.createElement('input');
    (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

    act(() => {
      input.value = '12345';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(input.value).toBe('');
  });

  it('should handle empty input value', () => {
    const { result } = renderHook(() =>
      useMask({ mask: '00000-000' })
    );

    const input = document.createElement('input');
    (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

    act(() => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(input.value).toBe('');
  });

  it('should handle mask with escaped characters', () => {
    const { result } = renderHook(() =>
      useMask({ mask: '\\A000' })
    );

    const input = document.createElement('input');
    (result.current.inputRef as React.MutableRefObject<HTMLInputElement>).current = input;

    act(() => {
      input.value = '123';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(input.value).toBe('A123');
  });
});