import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function BillCard({ bill, onToggle, onEdit, onDelete }) {
  const dueDate = parseISO(bill.dueDate);
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const isOverdue = daysUntilDue < 0 && !bill.isPaid;
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0 && !bill.isPaid;

  const getDueStatusClass = () => {
    if (bill.isPaid) return 'paid';
    if (isOverdue) return 'overdue';
    if (isDueSoon) return 'due-soon';
    return '';
  };

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
            <span className="bill-category">{bill.category || 'Sem categoria'}</span>
            {bill.createdBy && <span className="bill-author">por {bill.createdBy}</span>}
          </div>
        </div>
      </div>
      <div className="bill-right">
        <div className="bill-amount">
          R$ {bill.amount.toFixed(2).replace('.', ',')}
        </div>
        <div className={`bill-due ${getDueStatusClass()}`}>
          {bill.isPaid ? (
            <span className="paid-badge">Pago ✓</span>
          ) : (
            <span>
              {isOverdue ? `Atrasado ${Math.abs(daysUntilDue)}d` :
               daysUntilDue === 0 ? 'Vence hoje' :
               `Vence em ${daysUntilDue}d`}
            </span>
          )}
        </div>
        <div className="bill-actions">
          <button onClick={onEdit} className="bill-action-btn">✏️</button>
          <button onClick={onDelete} className="bill-action-btn">🗑️</button>
        </div>
      </div>
    </div>
  );
}
