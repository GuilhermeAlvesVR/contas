import { differenceInDays, parseISO } from 'date-fns';

const categoryIcons = {
  'Aluguel': '🏠',
  'Luz': '💡',
  'Água': '💧',
  'Internet': '📶',
  'Telefone': '📱',
  'Mercado': '🛒',
  'Transporte': '🚗',
  'Lazer': '🎮',
  'Saúde': '💊',
  'Outros': '📋',
};

const repeatLabels = {
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

export default function BillCard({ bill, user, onToggle, onEdit, onDelete }) {
  const dueDate = parseISO(bill.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntilDue = differenceInDays(dueDate, now);
  const isOverdue = daysUntilDue < 0 && !bill.isPaid;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && !bill.isPaid;

  const getDueStatusClass = () => {
    if (bill.isPaid) return 'paid';
    if (isOverdue) return 'overdue';
    if (isDueSoon) return 'due-soon';
    return '';
  };

  const getMyAmount = () => {
    if (bill.splitType === 'custom') {
      if (bill.createdBy === user) {
        return bill.splitValue1 || bill.amount / 2;
      }
      return bill.splitValue2 || bill.amount / 2;
    }
    return bill.amount / 2;
  };

  const dueText = () => {
    if (bill.isPaid) return <span className="paid-badge">Pago</span>;
    if (daysUntilDue < 0) return <span>Atrasado {Math.abs(daysUntilDue)}d</span>;
    if (daysUntilDue === 0) return <span>Vence hoje</span>;
    if (daysUntilDue === 1) return <span>Vence amanhã</span>;
    return <span>Vence em {daysUntilDue}d</span>;
  };

  const myAmount = getMyAmount();
  const isSplit = bill.splitType === 'custom' || true;

  return (
    <div className={`bill-card ${getDueStatusClass()}`}>
      <div className="bill-left">
        <button
          onClick={onToggle}
          className={`bill-checkbox ${bill.isPaid ? 'checked' : ''}`}
        >
          {bill.isPaid && '✓'}
        </button>
        <div className="bill-info">
          <div className="bill-name">
            <span className="bill-icon">{categoryIcons[bill.category] || '📋'}</span>
            {bill.name}
          </div>
          <div className="bill-meta">
            {bill.category && <span>{bill.category}</span>}
            {bill.repeatType && bill.repeatType !== 'none' && (
              <span className="bill-repeat">🔄 {repeatLabels[bill.repeatType]}</span>
            )}
            {bill.createdBy && <span>{bill.createdBy}</span>}
          </div>
        </div>
      </div>
      <div className="bill-right">
        <div className="bill-amounts">
          <span className="bill-my-amount">R$ {myAmount.toFixed(2).replace('.', ',')}</span>
          <span className="bill-total-amount">R$ {bill.amount.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className={`bill-due ${getDueStatusClass()}`}>
          {dueText()}
        </div>
        <div className="bill-actions">
          <button onClick={onEdit} className="bill-action-btn">✏️</button>
          <button onClick={onDelete} className="bill-action-btn">🗑️</button>
        </div>
      </div>
    </div>
  );
}
