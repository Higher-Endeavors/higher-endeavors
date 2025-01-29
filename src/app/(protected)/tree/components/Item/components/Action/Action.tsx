import React, { forwardRef } from 'react';
import styles from './Action.module.css';

interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`${styles.Action} ${className || ''}`}
        tabIndex={0}
      />
    );
  }
);

Action.displayName = 'Action';

export default Action;
