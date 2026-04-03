import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'cyan', className }) => {
  return (
    <span className={clsx('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  );
};
