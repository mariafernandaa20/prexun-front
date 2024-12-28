import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const FormattedDate: React.FC<{ date: string | null, defaultText?: string }> = ({ 
    date, 
    defaultText = 'Sin fecha' 
}) => {
    if (!date) return defaultText
    return new Date(date).toLocaleDateString()
}
