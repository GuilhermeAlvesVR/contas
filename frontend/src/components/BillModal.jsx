import { useState, useEffect } from 'react';

const categories = ['Aluguel', 'Luz', 'Água', 'Internet', 'Telefone', 'Mercado', 'Transporte', 'Lazer', 'Saúde', 'Outros'];

export default function BillModal({ bill, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: 'Outros',
    splitType: 'equal',
    splitValue1: '',
    splitValue2: '',
  });

  useEffect(() => {
    if (bill) {
      setForm({
        name: bill.name,
        amount: bill.amount.toString(),
        dueDate: bill.dueDate,
        category: bill.category || 'Outros',
        splitType: bill.splitType || 'equal',
        splitValue1: bill.splitValue1?.toString() || '',
        splitValue2: bill.splitValue2?.toString() || '',
      });
    }
  }, [bill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      splitValue1: form.splitValue1 ? parseFloat(form.splitValue1) : null,
      splitValue2: form.splitValue2 ? parseFloat(form.splitValue2) : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{bill ? 'Editar conta' : 'Nova conta'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Aluguel"
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0,00"
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Vencimento</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Divisão</label>
            <div className="split-options">
              <button
                type="button"
                className={`split-btn ${form.splitType === 'equal' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, splitType: 'equal' })}
              >
                50/50
              </button>
              <button
                type="button"
                className={`split-btn ${form.splitType === 'custom' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, splitType: 'custom' })}
              >
                Personalizado
              </button>
            </div>
          </div>

          {form.splitType === 'custom' && (
            <div className="split-custom">
              <div className="form-group">
                <label>Valor pessoa 1</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.splitValue1}
                  onChange={e => setForm({ ...form, splitValue1: e.target.value })}
                  placeholder="0,00"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Valor pessoa 2</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.splitValue2}
                  onChange={e => setForm({ ...form, splitValue2: e.target.value })}
                  placeholder="0,00"
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {bill ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
