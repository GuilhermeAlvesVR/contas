const API_URL = import.meta.env.VITE_API_URL || '';

export async function createRoom() {
  const res = await fetch(`${API_URL}/api/rooms`, { method: 'POST' });
  return res.json();
}

export async function getRoom(shareCode) {
  const res = await fetch(`${API_URL}/api/rooms/${shareCode}`);
  if (!res.ok) throw new Error('Sala não encontrada');
  return res.json();
}

export async function createBill(roomId, bill) {
  const res = await fetch(`${API_URL}/api/rooms/${roomId}/bills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bill),
  });
  return res.json();
}

export async function updateBill(id, bill) {
  const res = await fetch(`${API_URL}/api/bills/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bill),
  });
  return res.json();
}

export async function deleteBill(id) {
  const res = await fetch(`${API_URL}/api/bills/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function toggleBill(id) {
  const res = await fetch(`${API_URL}/api/bills/${id}/toggle`, { method: 'PATCH' });
  return res.json();
}
