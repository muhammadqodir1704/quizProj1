declare module 'react-katex' {
  import { ComponentType } from 'react';

  export interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: null) => React.ReactNode;
    settings?: null;
  }

  export const InlineMath: ComponentType<KatexProps>;
  export const BlockMath: ComponentType<KatexProps>;
}