import { useState, useEffect } from 'react';
import { createRoom, getRoom } from '../services/api';

export default function AccessScreen({ onEnter, initialShareCode }) {
  const [mode, setMode] = useState(initialShareCode ? 'join' : 'choose');
  const [shareCode, setShareCode] = useState(initialShareCode || '');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!userName.trim()) return setError('Digite seu apelido');
    setLoading(true);
    try {
      const room = await createRoom();
      onEnter(room, userName.trim());
    } catch {
      setError('Erro ao criar sala');
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!userName.trim()) return setError('Digite seu apelido');
    if (!shareCode.trim()) return setError('Digite o código');
    setLoading(true);
    try {
      const room = await getRoom(shareCode.trim());
      onEnter(room, userName.trim());
    } catch {
      setError('Sala não encontrada');
    }
    setLoading(false);
  };

  return (
    <div className="access-container">
      <div className="access-card">
        <div className="access-logo">
          <div className="logo-icon">💰</div>
          <h1>Contas</h1>
          <p>Organize suas contas em casal</p>
        </div>

        <div className="access-form">
          <input
            type="text"
            placeholder="Seu apelido (ex: Gu, Gi)"
            value={userName}
            onChange={(e) => { setUserName(e.target.value); setError(''); }}
            className="input-field"
            autoFocus
          />

          {mode === 'join' && (
            <div className="access-buttons">
              <input
                type="text"
                placeholder="Código da sala"
                value={shareCode}
                onChange={(e) => { setShareCode(e.target.value); setError(''); }}
                className="input-field"
                disabled={!!initialShareCode}
              />
              <button onClick={handleJoin} className="btn btn-primary" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
              {!initialShareCode && (
                <button onClick={() => setMode('choose')} className="btn btn-ghost">
                  Voltar
                </button>
              )}
            </div>
          )}

          {mode === 'choose' && (
            <div className="access-buttons">
              <button onClick={() => setMode('create')} className="btn btn-primary">
                Criar nova sala
              </button>
              <button onClick={() => setMode('join')} className="btn btn-secondary">
                Entrar com código
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="access-buttons">
              <button onClick={handleCreate} className="btn btn-primary" disabled={loading}>
                {loading ? 'Criando...' : 'Criar sala'}
              </button>
              <button onClick={() => setMode('choose')} className="btn btn-ghost">
                Voltar
              </button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
}
