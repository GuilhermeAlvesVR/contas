export default function Summary({ bills }) {
  const total = bills.reduce((sum, b) => sum + b.amount, 0);
  const paid = bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const pending = total - paid;

  const urgentBills = bills.filter(b => {
    if (b.isPaid) return false;
    const due = new Date(b.dueDate);
    const now = new Date();
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= -7;
  });

  return (
    <div className="summary">
      <div className="summary-card summary-total">
        <span className="summary-label">Total</span>
        <span className="summary-value">R$ {total.toFixed(2).replace('.', ',')}</span>
      </div>
      <div className="summary-card summary-paid">
        <span className="summary-label">Pago</span>
        <span className="summary-value">R$ {paid.toFixed(2).replace('.', ',')}</span>
      </div>
      <div className="summary-card summary-pending">
        <span className="summary-label">Pendente</span>
        <span className="summary-value">R$ {pending.toFixed(2).replace('.', ',')}</span>
      </div>
      {urgentBills.length > 0 && (
        <div className="summary-card summary-urgent">
          <span className="summary-label">⚠️ Urgente</span>
          <span className="summary-value">{urgentBills.length} conta{urgentBills.length > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
