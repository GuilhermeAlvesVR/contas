import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

function generateShareCode() {
  return randomBytes(4).toString('hex');
}

// Create a new room
app.post('/api/rooms', async (req, res) => {
  try {
    const shareCode = generateShareCode();
    const room = await prisma.room.create({
      data: { shareCode },
    });
    res.json(room);
  } catch (error) {
    console.error('Erro ao criar sala:', error.message);
    res.status(500).json({ error: 'Erro ao criar sala', detail: error.message });
  }
});

// Get room by share code
app.get('/api/rooms/:shareCode', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { shareCode: req.params.shareCode },
      include: { bills: { orderBy: { dueDate: 'asc' } } },
    });
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sala' });
  }
});

// Create a bill
app.post('/api/rooms/:roomId/bills', async (req, res) => {
  try {
    const { name, amount, dueDate, splitType, splitValue1, splitValue2, category, createdBy } = req.body;
    const bill = await prisma.bill.create({
      data: {
        roomId: req.params.roomId,
        name,
        amount: parseFloat(amount),
        dueDate,
        splitType: splitType || 'equal',
        splitValue1: splitValue1 ? parseFloat(splitValue1) : null,
        splitValue2: splitValue2 ? parseFloat(splitValue2) : null,
        category: category || null,
        createdBy: createdBy || null,
      },
    });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Update a bill
app.put('/api/bills/:id', async (req, res) => {
  try {
    const { name, amount, dueDate, isPaid, splitType, splitValue1, splitValue2, category } = req.body;
    const bill = await prisma.bill.update({
      where: { id: req.params.id },
      data: {
        name,
        amount: amount ? parseFloat(amount) : undefined,
        dueDate,
        isPaid,
        splitType,
        splitValue1: splitValue1 ? parseFloat(splitValue1) : undefined,
        splitValue2: splitValue2 ? parseFloat(splitValue2) : undefined,
        category,
      },
    });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

// Delete a bill
app.delete('/api/bills/:id', async (req, res) => {
  try {
    await prisma.bill.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
});

// Toggle paid status
app.patch('/api/bills/:id/toggle', async (req, res) => {
  try {
    const bill = await prisma.bill.findUnique({ where: { id: req.params.id } });
    const updated = await prisma.bill.update({
      where: { id: req.params.id },
      data: { isPaid: !bill.isPaid },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
