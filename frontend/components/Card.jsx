import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, hover = true, glow = false }) => {
  return (
    <div
      className={clsx(
        'glass-panel',
        hover && 'hover-lift',
        glow && 'ai-glow',
        className
      )}
      style={{ padding: '24px' }}
    >
      {children}
    </div>
  );
};
