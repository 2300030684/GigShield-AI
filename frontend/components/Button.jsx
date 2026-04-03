import React from 'react';
import clsx from 'clsx';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'ghost', 'outline'
  className,
  icon,
  glow = false,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'btn',
        `btn-${variant}`,
        glow && 'ai-glow',
        className
      )}
      style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
