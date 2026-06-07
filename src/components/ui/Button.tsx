import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  // Class nền tảng: Áp dụng cho MỌI loại nút (layout, padding, bo góc, font, hiệu ứng chung)
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none';

  // Class cho từng biến thể (màu sắc, nền, hiệu ứng hover)
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow active:scale-95',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow active:scale-95',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant], // Tự động lấy style dựa vào prop variant truyền vào
        className // Cho phép ghi đè/thêm class từ bên ngoài (ví dụ: w-full, mt-4)
      )}
      {...props}
    >
      {children}
    </button>
  );
}