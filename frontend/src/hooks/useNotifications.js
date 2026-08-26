import { useEffect } from 'react';
import { differenceInDays, parseISO } from 'date-fns';

export function useNotifications(bills) {
  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    bills.forEach(bill => {
      if (bill.isPaid) return;

      const dueDate = parseISO(bill.dueDate);
      const daysUntilDue = differenceInDays(dueDate, new Date());

      if (daysUntilDue === 1) {
        new Notification('Contas', {
          body: `"${bill.name}" vence amanhã! R$ ${bill.amount.toFixed(2)}`,
          icon: '/icon-192.svg',
          tag: `bill-${bill.id}-tomorrow`,
        });
      }

      if (daysUntilDue === 0) {
        new Notification('Contas', {
          body: `"${bill.name}" vence HOJE! R$ ${bill.amount.toFixed(2)}`,
          icon: '/icon-192.svg',
          tag: `bill-${bill.id}-today`,
        });
      }

      if (daysUntilDue < 0) {
        new Notification('Contas - Atrasado', {
          body: `"${bill.name}" está atrasado há ${Math.abs(daysUntilDue)} dias!`,
          icon: '/icon-192.svg',
          tag: `bill-${bill.id}-overdue`,
        });
      }
    });
  }, [bills]);
}
