import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoom, createBill, updateBill, deleteBill, toggleBill } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import BillCard from '../components/BillCard';
import BillModal from '../components/BillModal';
import Summary from '../components/Summary';

export default function BillsScreen({ room, user, onExit }) {
  const [bills, setBills] = useState(room.bills || []);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const navigate = useNavigate();

  useNotifications(bills);

  useEffect(() => {
    getRoom(room.shareCode).then(freshRoom => {
      setBills(freshRoom.bills || []);
    }).catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    const bill = await createBill(room.id, { ...data, createdBy: user });
    setBills([...bills, bill]);
    setShowModal(false);
  };

  const handleUpdate = async (data) => {
    const updated = await updateBill(editingBill.id, data);
    setBills(bills.map(b => b.id === updated.id ? updated : b));
    setEditingBill(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deletar esta conta?')) return;
    await deleteBill(id);
    setBills(bills.filter(b => b.id !== id));
  };

  const handleToggle = async (id) => {
    const updated = await toggleBill(id);
    setBills(bills.map(b => b.id === updated.id ? updated : b));
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

      <Summary bills={bills} />

      <div className="bills-actions">
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-full">
          + Nova conta
        </button>
      </div>

      <div className="bills-list">
        {bills.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma conta ainda</p>
            <p className="empty-sub">Toque em "+ Nova conta" para começar</p>
          </div>
        ) : (
          bills.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onToggle={() => handleToggle(bill.id)}
              onEdit={() => handleEdit(bill)}
              onDelete={() => handleDelete(bill.id)}
            />
          ))
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
