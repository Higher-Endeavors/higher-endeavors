import React, { forwardRef } from 'react';
import styles from './Action.module.scss';

interface ActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  active?: {
    fill: string;
    background: string;
  };
  cursor?: React.CSSProperties['cursor'];
}

const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ className, active, cursor, style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`${styles.Action} ${className || ''}`}
        tabIndex={0}
        style={
          {
            ...style,
            cursor,
            '--fill': active?.fill,
            '--background': active?.background,
          } as React.CSSProperties
        }
      />
    );
  }
);

Action.displayName = 'Action';

export default Action;
export type { ActionProps };
