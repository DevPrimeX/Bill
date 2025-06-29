import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(numAmount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getBillStatusInfo(bill: { status: string; dueDate: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  if (bill.status === 'paid') {
    return {
      status: 'paid',
      label: 'Paid',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      iconClassName: 'text-success',
    };
  }
  
  if (dueDate < today) {
    return {
      status: 'overdue',
      label: 'Overdue',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      iconClassName: 'text-error',
    };
  }
  
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue <= 7) {
    return {
      status: 'due_soon',
      label: 'Due Soon',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      iconClassName: 'text-warning',
    };
  }
  
  return {
    status: 'upcoming',
    label: 'Upcoming',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    iconClassName: 'text-primary',
  };
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    utilities: '⚡',
    rent: '🏠',
    credit_cards: '💳',
    insurance: '🛡️',
    subscriptions: '📱',
    other: '📄',
  };
  return icons[category] || '📄';
}
