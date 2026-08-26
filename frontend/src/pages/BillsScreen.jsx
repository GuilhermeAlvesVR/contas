import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getRoom, createBill, updateBill, deleteBill, toggleBill } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import BillCard from '../components/BillCard';
import BillModal from '../components/BillModal';
import Summary from '../components/Summary';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function groupByMonth(bills) {
  const groups = {};
  bills.forEach(bill => {
    const date = parseISO(bill.dueDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = { year: date.getFullYear(), month: date.getMonth(), bills: [] };
    groups[key].bills.push(bill);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, value]) => ({
      key,
      label: `${monthNames[value.month]} ${value.year}`,
      bills: value.bills.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    }));
}

export default function BillsScreen({ room, user, onExit }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const navigate = useNavigate();

  useNotifications(bills);

  const fetchBills = () => {
    return getRoom(room.shareCode).then(freshRoom => {
      setBills(freshRoom.bills || []);
      setLoading(false);
      return freshRoom;
    }).catch(() => { setLoading(false); });
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleCreate = async (data) => {
    await createBill(room.id, { ...data, createdBy: user });
    await fetchBills();
    setShowModal(false);
  };

  const handleUpdate = async (data) => {
    await updateBill(editingBill.id, data);
    setEditingBill(null);
    setShowModal(false);
    await fetchBills();
  };

  const handleDelete = async (id) => {
    if (!confirm('Deletar esta conta?')) return;
    await deleteBill(id);
    await fetchBills();
  };

  const handleToggle = async (id) => {
    await toggleBill(id);
    await fetchBills();
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingBill(null);
  };

  const handleExit = () => {
    onExit();
    navigate('/');
  };

  const shareUrl = `${window.location.origin}?room=${room.shareCode}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Contas',
          text: `Entra aqui pra ver nossas contas: ${shareUrl}`,
          url: shareUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(room.shareCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const groups = groupByMonth(bills);

  return (
    <div className="bills-container">
      <header className="bills-header">
        <div className="header-info">
          <h1>Contas</h1>
          <span className="user-badge">{user}</span>
        </div>
        <button onClick={handleExit} className="btn btn-ghost btn-sm">
          Sair
        </button>
      </header>

      <Summary bills={bills} user={user} />

      <div className="bills-actions">
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-full">
          + Nova conta
        </button>
      </div>

      <div className="bills-list">
        {loading ? (
          <div className="empty-state">
            <p>Carregando...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conta ainda</p>
            <p className="empty-sub">Toque em "+ Nova conta" para começar</p>
          </div>
        ) : (
          groups.map(group => {
            const groupPaid = group.bills.filter(b => b.isPaid).reduce((s, b) => s + b.amount, 0);
            const groupTotal = group.bills.reduce((s, b) => s + b.amount, 0);
            const groupMyPending = group.bills.filter(b => !b.isPaid).reduce((s, b) => {
              if (b.splitType === 'custom') {
                return s + (b.createdBy === user ? (b.splitValue1 || b.amount / 2) : (b.splitValue2 || b.amount / 2));
              }
              return s + b.amount / 2;
            }, 0);
            return (
              <div key={group.key} className="month-group">
                <div className="month-header">
                  <h2 className="month-title">{group.label}</h2>
                  <div className="month-summary">
                    <span className="month-my">R$ {groupMyPending.toFixed(2).replace('.', ',')} seu</span>
                    <span className="month-paid">{groupPaid.toFixed(2).replace('.', ',')} pago</span>
                  </div>
                </div>
                <div className="month-bills">
                  {group.bills.map(bill => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      user={user}
                      onToggle={() => handleToggle(bill.id)}
                      onEdit={() => handleEdit(bill)}
                      onDelete={() => handleDelete(bill.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="share-section">
        <p className="share-label">Compartilhar com sua parceira</p>
        <div className="share-code-box">
          <span className="share-code-text">{room.shareCode}</span>
          <button onClick={handleCopyCode} className="btn btn-ghost btn-sm">
            {copiedCode ? '✅ Copiado!' : '📋 Copiar'}
          </button>
        </div>
        <p className="share-hint">Ela entra em <strong>Entrar com código</strong> e digita esse código</p>
        <div className="share-buttons">
          <button onClick={handleShare} className="btn btn-primary btn-share">
            📤 Enviar link
          </button>
          <button onClick={handleCopyLink} className="btn btn-secondary btn-share">
            {copied ? '✅ Copiado!' : '📋 Copiar link'}
          </button>
        </div>
      </div>

      {showModal && (
        <BillModal
          bill={editingBill}
          onSave={editingBill ? handleUpdate : handleCreate}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
