import { useState } from 'react';
import { useMask, MaskedInput } from 'react-super-mask';
import './App.css';

function App() {
  const [completed, setCompleted] = useState([]);

  // Exemplo com hook
  const phoneRef = useMask({
    mask: '(00) 00000-0000',
    placeholder: '(00) 00000-0000',
    onComplete: (value) => {
      console.log('Telefone completo:', value);
      setCompleted(prev => [...prev, `Telefone: ${value}`]);
    }
  });

  const cpfRef = useMask({
    mask: '000.000.000-00',
    placeholder: '000.000.000-00',
    onComplete: (value) => {
      setCompleted(prev => [...prev, `CPF: ${value}`]);
    }
  });

  const cepRef = useMask({
    mask: '00000-000',
    placeholder: '00000-000',
    selectOnFocus: true,
    onComplete: (value) => {
      setCompleted(prev => [...prev, `CEP: ${value}`]);
    }
  });

  // Exemplo de dinheiro com máscara reversa
  const [moneyValue, setMoneyValue] = useState('');
  const moneyRef = useMask({
    mask: '#.##0,00',
    reverse: true,
    placeholder: '0,00',
    onChange: (value) => {
      setMoneyValue(value);
    },
    onComplete: (value) => {
      setCompleted(prev => [...prev, `Dinheiro: ${value}`]);
    }
  });

  // Exemplo com componente
  const handleCardComplete = (value) => {
    setCompleted(prev => [...prev, `Cartão: ${value}`]);
  };

  const handleDateComplete = (value) => {
    setCompleted(prev => [...prev, `Data: ${value}`]);
  };

  return (
    <div className="app">
      <h1>🧪 Teste React Super Mask</h1>

      <div className="test-section">
        <h2>📞 Telefone (Hook)</h2>
        <label>Telefone:</label>
        <input ref={phoneRef.inputRef} type="text" />
      </div>

      <div className="test-section">
        <h2>🆔 CPF (Hook)</h2>
        <label>CPF:</label>
        <input ref={cpfRef.inputRef} type="text" />
      </div>

      <div className="test-section">
        <h2>📮 CEP (Hook com selectOnFocus)</h2>
        <label>CEP:</label>
        <input ref={cepRef.inputRef} type="text" />
      </div>

      <div className="test-section">
        <h2>💰 Dinheiro (Hook com máscara reversa)</h2>
        <label>Valor (R$):</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            zIndex: 1,
            color: '#666',
            fontWeight: 'bold'
          }}>
            R$
          </span>
          <input
            ref={moneyRef.inputRef}
            type="text"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        {moneyValue && (
          <div className="result" style={{ marginTop: '10px', fontSize: '14px' }}>
            <strong>Valor formatado:</strong> {moneyValue}
            <br />
            <strong>Exemplos:</strong> Digite "75" para 0,75 ou "1000000" para 1.000.000,00
          </div>
        )}
      </div>

      <div className="test-section">
        <h2>💳 Cartão de Crédito (Componente)</h2>
        <label>Cartão:</label>
        <MaskedInput
          mask="0000 0000 0000 0000"
          placeholder="0000 0000 0000 0000"
          onComplete={handleCardComplete}
        />
      </div>

      <div className="test-section">
        <h2>📅 Data (Componente)</h2>
        <label>Data:</label>
        <MaskedInput
          mask="00/00/0000"
          placeholder="DD/MM/AAAA"
          onComplete={handleDateComplete}
        />
      </div>

      <div className="test-section">
        <h2>🏢 CNPJ (Componente)</h2>
        <label>CNPJ:</label>
        <MaskedInput
          mask="00.000.000/0000-00"
          placeholder="00.000.000/0000-00"
          onComplete={(value) => setCompleted(prev => [...prev, `CNPJ: ${value}`])}
        />
      </div>

      {completed.length > 0 && (
        <div className="test-section completed">
          <h2>✅ Campos Completos</h2>
          <ul>
            {completed.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

