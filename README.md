# React Super Mask

A modern React input mask library inspired by jQuery Mask Plugin, but without jQuery dependencies.

## 🚀 Features

- ⚡ **Zero dependencies** - No jQuery needed
- 🎯 **TypeScript** - Fully typed
- 📦 **Lightweight** - Less than 2KB minified
- 🔄 **Reverse mask** - Perfect for monetary values
- 🎨 **Callbacks** - onChange, onComplete, onInvalid
- 🔧 **Customizable** - Define your own mask rules
- ♿ **Accessible** - Compatible with screen readers
- 🌐 **Universal** - Works with SSR

## 📦 Installation

```bash
npm install react-super-mask
# or
yarn add react-super-mask
```

## 🎯 Basic Usage

### With Hook `useMask`

```tsx
import { useMask } from 'react-super-mask';

function PhoneInput() {
  const phoneRef = useMask({
    mask: '(00) 00000-0000',
    placeholder: 'Enter your phone'
  });

  return <input ref={phoneRef.inputRef} />;
}
```

### With Component `MaskedInput`

```tsx
import { MaskedInput } from 'react-super-mask';

function App() {
  return (
    <MaskedInput
      mask="(00) 00000-0000"
      placeholder="Enter your phone"
      onComplete={(value) => console.log('Complete:', value)}
    />
  );
}
```

## 📚 Mask Examples

### Brazilian Phone

```tsx
const phoneRef = useMask({
  mask: '(00) 00000-0000'
});
```

### CPF (Brazilian ID)

```tsx
const cpfRef = useMask({
  mask: '000.000.000-00',
  clearIfNotMatch: true
});
```

### CNPJ (Brazilian Company ID)

```tsx
const cnpjRef = useMask({
  mask: '00.000.000/0000-00'
});
```

### ZIP Code

```tsx
const zipRef = useMask({
  mask: '00000-000',
  selectOnFocus: true
});
```

### Date

```tsx
const dateRef = useMask({
  mask: '00/00/0000',
  placeholder: 'DD/MM/YYYY'
});
```

### Credit Card

```tsx
const cardRef = useMask({
  mask: '0000 0000 0000 0000'
});
```

### Currency (Reverse Mask)

```tsx
const moneyRef = useMask({
  mask: '#.##0,00',
  reverse: true
});
```

### Car License Plate (Mercosur)

```tsx
const plateRef = useMask({
  mask: 'AAA-0A00',
  translation: {
    'A': { pattern: /[A-Z]/ },
    '0': { pattern: /[0-9]/ }
  }
});
```

## 🎨 `useMask` Hook API

### Options

```typescript
interface MaskOptions {
  // Mask pattern (e.g., '(00) 00000-0000')
  mask: string;
  
  // Apply mask from right to left
  reverse?: boolean;
  
  // Input placeholder
  placeholder?: string;
  
  // Clear field if it doesn't match the mask
  clearIfNotMatch?: boolean;
  
  // Select all text on focus
  selectOnFocus?: boolean;
  
  // Custom translations
  translation?: Record<string, {
    pattern: RegExp;
    optional?: boolean;
    recursive?: boolean;
  }>;
  
  // Callbacks
  onChange?: (value: string, event?: Event) => void;
  onComplete?: (value: string, event?: Event) => void;
  onInvalid?: (value: string, event?: Event) => void;
  onKeyPress?: (value: string, event?: Event) => void;
}
```

### Default Translations

| Character | Description | Regex |
|-----------|-------------|-------|
| `0` | Required digit | `/\d/` |
| `9` | Optional digit | `/\d/` |
| `#` | Optional recursive digit | `/\d/` |
| `A` | Alphanumeric | `/[a-zA-Z0-9]/` |
| `S` | Letter | `/[a-zA-Z]/` |
| `X` | Optional alphanumeric | `/[a-zA-Z0-9]/` |

### Literal Characters

Any character that is not in the translations is considered literal and will be inserted automatically.

To use a translation character as literal, escape it with `\`:

```tsx
const ref = useMask({
  mask: '\\A000' // Displays "A" followed by 3 digits
});
```

## 🔧 Helper Functions

### `unmask(value: string): string`

Removes the mask from the value:

```tsx
import { unmask } from 'react-super-mask';

const masked = '(11) 98765-4321';
const unmasked = unmask(masked); // '11987654321'
```

### `isComplete(value: string, mask: string): boolean`

Checks if the value is complete:

```tsx
import { isComplete } from 'react-super-mask';

isComplete('(11) 98765-4321', '(00) 00000-0000'); // true
isComplete('(11) 9876', '(00) 00000-0000'); // false
```

### `mask(value: string, mask: string, options?: { reverse?: boolean; translation?: Record<string, Translation> }): string`

Applies a mask to any string, returning the formatted value. This function is useful for formatting values that are not in inputs, such as display in tables, cards, static text, etc.

**Parameters:**
- `value`: The value to be formatted (string)
- `mask`: The mask to be applied (e.g., `"(00) 00000-0000"`, `"000.000.000-00"`)
- `options` (optional):
  - `reverse`: If `true`, applies reverse mask (useful for monetary values)
  - `translation`: Custom translations for mask characters

**Returns:** The formatted value with the mask applied (string)

**Examples:**

```tsx
import { mask } from 'react-super-mask';

// Format phone
mask('11987654321', '(00) 00000-0000'); // "(11) 98765-4321"

// Format CPF
mask('12345678900', '000.000.000-00'); // "123.456.789-00"

// Format ZIP code
mask('01310100', '00000-000'); // "01310-100"

// Format credit card
mask('1234567890123456', '0000 0000 0000 0000'); // "1234 5678 9012 3456"
```

**Using Options:**

```tsx
import { mask } from 'react-super-mask';

// Reverse mask for monetary values
mask('123456', '#.##0,00', { reverse: true }); // "1.234,56"
mask('75', '#.##0,00', { reverse: true }); // "0,75"
mask('1000000', '#.##0,00', { reverse: true }); // "10.000,00"

// Custom translation for license plates
mask('ABC1234', 'AAA-0A00', {
  translation: {
    'A': { pattern: /[A-Z]/ },
    '0': { pattern: /[0-9]/ }
  }
}); // "ABC-1234"

// Custom translation for alphanumeric codes
mask('AB12CD34', 'XX-00-XX-00', {
  translation: {
    'X': { pattern: /[A-Z]/ },
    '0': { pattern: /[0-9]/ }
  }
}); // "AB-12-CD-34"

// Combining reverse and custom translation
mask('123456789', '#.##0,00', {
  reverse: true,
  translation: {
    '#': { pattern: /\d/, optional: true, recursive: true },
    '0': { pattern: /\d/ }
  }
}); // "1.234.567,89"
```

**Usage in JSX/HTML:**

```tsx
import { mask } from 'react-super-mask';

function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>Phone: {mask(user.phone, '(00) 00000-0000')}</p>
      <p>CPF: {mask(user.cpf, '000.000.000-00')}</p>
      <p>Balance: $ {mask(user.balance.toString(), '#.##0,00', { reverse: true })}</p>
    </div>
  );
}
```

**Usage in tables:**

```tsx
import { mask } from 'react-super-mask';

function UsersTable({ users }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>CPF</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{mask(user.phone, '(00) 00000-0000')}</td>
            <td>{mask(user.cpf, '000.000.000-00')}</td>
            <td>$ {mask(user.balance.toString(), '#.##0,00', { reverse: true })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Advanced usage with options:**

```tsx
import { mask } from 'react-super-mask';

function ProductCard({ product }) {
  // Format price with reverse mask
  const formattedPrice = mask(
    product.price.toString(), 
    '#.##0,00', 
    { reverse: true }
  );

  // Format SKU with custom translation (only uppercase letters and numbers)
  const formattedSKU = mask(
    product.sku, 
    'XXX-0000', 
    {
      translation: {
        'X': { pattern: /[A-Z0-9]/ },
        '0': { pattern: /\d/ }
      }
    }
  );

  return (
    <div>
      <h3>{product.name}</h3>
      <p>SKU: {formattedSKU}</p>
      <p>Price: ${formattedPrice}</p>
    </div>
  );
}

// Format different currency formats
function formatCurrency(value, locale = 'pt-BR') {
  if (locale === 'pt-BR') {
    // Brazilian format: 1.234,56
    return mask(value.toString(), '#.##0,00', { reverse: true });
  } else {
    // US format: 1,234.56
    return mask(value.toString(), '#,##0.00', { reverse: true });
  }
}

formatCurrency('123456', 'pt-BR'); // "1.234,56"
formatCurrency('123456', 'en-US'); // "1,234.56"
```

**Difference between `useMask` and `mask()`:**

- **`useMask`**: React hook for inputs (with events, validation, callbacks, etc.)
- **`mask()`**: Pure utility function to format any string (can be used anywhere, not just in inputs)

## 🎯 Callbacks

### onChange

Triggered on every input change:

```tsx
const ref = useMask({
  mask: '(00) 00000-0000',
  onChange: (value) => {
    console.log('Current value:', value);
  }
});
```

### onComplete

Triggered when the mask is complete:

```tsx
const ref = useMask({
  mask: '000.000.000-00',
  onComplete: (value) => {
    console.log('Complete CPF:', value);
    // Send to API, validate, etc.
  }
});
```

### onInvalid

Triggered when the value doesn't match the mask:

```tsx
const ref = useMask({
  mask: '00000-000',
  clearIfNotMatch: true,
  onInvalid: (value) => {
    console.log('Invalid ZIP code:', value);
  }
});
```

## 🌟 Advanced Examples

### Dynamic Mask

```tsx
function DynamicPhone() {
  const [mask, setMask] = useState('(00) 0000-00009');
  
  const phoneRef = useMask({
    mask,
    onChange: (value) => {
      // Switch to mobile if it starts with 9
      if (value.length > 5 && value[5] === '9') {
        setMask('(00) 00000-0000');
      } else {
        setMask('(00) 0000-0000');
      }
    }
  });

  return <input ref={phoneRef.inputRef} />;
}
```

### Real-time Validation

```tsx
function ValidatedCPF() {
  const [isValid, setIsValid] = useState(false);
  
  const cpfRef = useMask({
    mask: '000.000.000-00',
    onComplete: (value) => {
      const valid = validateCPF(unmask(value));
      setIsValid(valid);
    }
  });

  return (
    <div>
      <input 
        ref={cpfRef.inputRef}
        style={{ borderColor: isValid ? 'green' : 'red' }}
      />
      {isValid && <span>✓ Valid CPF</span>}
    </div>
  );
}
```

### Currency Formatting

```tsx
function MoneyInput() {
  const moneyRef = useMask({
    mask: '#.##0,00',
    reverse: true,
    onChange: (value) => {
      const numericValue = parseFloat(
        value.replace(/\./g, '').replace(',', '.')
      );
      console.log('Numeric value:', numericValue);
    }
  });

  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, top: 10 }}>$</span>
      <input 
        ref={moneyRef.inputRef}
        style={{ paddingLeft: 35 }}
      />
    </div>
  );
}
```

## 🔍 Comparison with jQuery Mask Plugin

| Feature | jQuery Mask | React Super Mask |
|---------|-------------|------------------|
| Dependencies | jQuery | None |
| TypeScript | ❌ | ✅ |
| Size | ~2KB | ~2KB |
| Reverse masks | ✅ | ✅ |
| Callbacks | ✅ | ✅ |
| SSR | ❌ | ✅ |
| React Hooks | ❌ | ✅ |

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT © [Fabio Rafael]

## 🙏 Acknowledgments

Inspired by the excellent [jQuery Mask Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin) by Igor Escobar.
