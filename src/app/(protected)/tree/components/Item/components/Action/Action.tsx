import React, { CSSProperties, ButtonHTMLAttributes, RefObject } from 'react';

import styles from './Action.module.css';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
  ref?: RefObject<HTMLButtonElement | null>;
}

export const Action = (
  {
    ref,
    active,
    className,
    cursor,
    style,
    ...props
  }: Props
) => {
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
        } as CSSProperties
      }
    />
  );
};
