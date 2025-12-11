# React Mask Library

Uma biblioteca moderna de máscaras de input para React, inspirada no jQuery Mask Plugin, mas sem dependências do jQuery.

## 🚀 Características

- ⚡ **Zero dependências** - Não precisa do jQuery
- 🎯 **TypeScript** - Totalmente tipado
- 📦 **Leve** - Menos de 2KB minificado
- 🔄 **Máscara reversa** - Perfeito para valores monetários
- 🎨 **Callbacks** - onChange, onComplete, onInvalid
- 🔧 **Customizável** - Defina suas próprias regras de máscara
- ♿ **Acessível** - Compatível com screen readers
- 🌐 **Universal** - Funciona com SSR

## 📦 Instalação

```bash
npm install react-mask-library
# ou
yarn add react-mask-library
```

## 🎯 Uso Básico

### Com Hook `useMask`

```tsx
import { useMask } from 'react-mask-library';

function PhoneInput() {
  const phoneRef = useMask({
    mask: '(00) 00000-0000',
    placeholder: 'Digite seu telefone'
  });

  return <input ref={phoneRef.inputRef} />;
}
```

### Com Componente `MaskedInput`

```tsx
import { MaskedInput } from 'react-mask-library';

function App() {
  return (
    <MaskedInput
      mask="(00) 00000-0000"
      placeholder="Digite seu telefone"
      onComplete={(value) => console.log('Completo:', value)}
    />
  );
}
```

## 📚 Exemplos de Máscaras

### Telefone Brasileiro

```tsx
const phoneRef = useMask({
  mask: '(00) 00000-0000'
});
```

### CPF

```tsx
const cpfRef = useMask({
  mask: '000.000.000-00',
  clearIfNotMatch: true
});
```

### CNPJ

```tsx
const cnpjRef = useMask({
  mask: '00.000.000/0000-00'
});
```

### CEP

```tsx
const cepRef = useMask({
  mask: '00000-000',
  selectOnFocus: true
});
```

### Data

```tsx
const dateRef = useMask({
  mask: '00/00/0000',
  placeholder: 'DD/MM/AAAA'
});
```

### Cartão de Crédito

```tsx
const cardRef = useMask({
  mask: '0000 0000 0000 0000'
});
```

### Moeda (Máscara Reversa)

```tsx
const moneyRef = useMask({
  mask: '#.##0,00',
  reverse: true
});
```

### Placa de Carro (Mercosul)

```tsx
const plateRef = useMask({
  mask: 'AAA-0A00',
  translation: {
    'A': { pattern: /[A-Z]/ },
    '0': { pattern: /[0-9]/ }
  }
});
```

## 🎨 API do Hook `useMask`

### Opções

```typescript
interface MaskOptions {
  // Padrão da máscara (ex: '(00) 00000-0000')
  mask: string;
  
  // Aplica máscara da direita para esquerda
  reverse?: boolean;
  
  // Placeholder do input
  placeholder?: string;
  
  // Limpa o campo se não corresponder à máscara
  clearIfNotMatch?: boolean;
  
  // Seleciona todo o texto ao focar
  selectOnFocus?: boolean;
  
  // Traduções customizadas
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

### Traduções Padrão

| Caractere | Descrição | Regex |
|-----------|-----------|-------|
| `0` | Dígito obrigatório | `/\d/` |
| `9` | Dígito opcional | `/\d/` |
| `#` | Dígito recursivo opcional | `/\d/` |
| `A` | Alfanumérico | `/[a-zA-Z0-9]/` |
| `S` | Letra | `/[a-zA-Z]/` |
| `X` | Alfanumérico opcional | `/[a-zA-Z0-9]/` |

### Caracteres Literais

Qualquer caractere que não esteja nas traduções é considerado literal e será inserido automaticamente.

Para usar um caractere de tradução como literal, escape com `\`:

```tsx
const ref = useMask({
  mask: '\\A000' // Exibe "A" seguido de 3 dígitos
});
```

## 🔧 Funções Auxiliares

### `unmask(value: string): string`

Remove a máscara do valor:

```tsx
import { unmask } from 'react-mask-library';

const masked = '(11) 98765-4321';
const unmasked = unmask(masked); // '11987654321'
```

### `isComplete(value: string, mask: string): boolean`

Verifica se o valor está completo:

```tsx
import { isComplete } from 'react-mask-library';

isComplete('(11) 98765-4321', '(00) 00000-0000'); // true
isComplete('(11) 9876', '(00) 00000-0000'); // false
```

## 🎯 Callbacks

### onChange

Disparado a cada mudança no input:

```tsx
const ref = useMask({
  mask: '(00) 00000-0000',
  onChange: (value) => {
    console.log('Valor atual:', value);
  }
});
```

### onComplete

Disparado quando a máscara está completa:

```tsx
const ref = useMask({
  mask: '000.000.000-00',
  onComplete: (value) => {
    console.log('CPF completo:', value);
    // Enviar para API, validar, etc.
  }
});
```

### onInvalid

Disparado quando o valor não corresponde à máscara:

```tsx
const ref = useMask({
  mask: '00000-000',
  clearIfNotMatch: true,
  onInvalid: (value) => {
    console.log('CEP inválido:', value);
  }
});
```

## 🌟 Exemplos Avançados

### Máscara Dinâmica

```tsx
function DynamicPhone() {
  const [mask, setMask] = useState('(00) 0000-00009');
  
  const phoneRef = useMask({
    mask,
    onChange: (value) => {
      // Muda para celular se começar com 9
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

### Validação em Tempo Real

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
      {isValid && <span>✓ CPF válido</span>}
    </div>
  );
}
```

### Formatação de Moeda

```tsx
function MoneyInput() {
  const moneyRef = useMask({
    mask: '#.##0,00',
    reverse: true,
    onChange: (value) => {
      const numericValue = parseFloat(
        value.replace(/\./g, '').replace(',', '.')
      );
      console.log('Valor numérico:', numericValue);
    }
  });

  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, top: 10 }}>R$</span>
      <input 
        ref={moneyRef.inputRef}
        style={{ paddingLeft: 35 }}
      />
    </div>
  );
}
```

## 🔍 Comparação com jQuery Mask Plugin

| Recurso | jQuery Mask | React Mask Library |
|---------|-------------|-------------------|
| Dependências | jQuery | Nenhuma |
| TypeScript | ❌ | ✅ |
| Tamanho | ~2KB | ~2KB |
| Máscaras reversas | ✅ | ✅ |
| Callbacks | ✅ | ✅ |
| SSR | ❌ | ✅ |
| React Hooks | ❌ | ✅ |

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT © [Fabio Rafael]

## 🙏 Agradecimentos

Inspirado no excelente [jQuery Mask Plugin](https://github.com/igorescobar/jQuery-Mask-Plugin) por Igor Escobar.