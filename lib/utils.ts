import { clsx, type ClassValue } from 'clsx';
import { time } from 'console';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const FormattedDate: React.FC<{ date: string | null, defaultText?: string }> = ({ 
    date, 
    defaultText = 'Sin fecha' 
}) => {
  console.log(date);
    if (!date) return defaultText
    return new Date(date).toLocaleDateString()
}

export const formatTime: React.FC<{ time: string | null }> = ({ time }) => {
  if (!time) return null;
  
  return (
    new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(time))  );
};