declare module '@editex/react-email-editor' {
  import * as React from 'react';
  export interface EmailEditorProps {
    defaultBlockList?: any;
    minHeight?: string;
    onLoad?: () => void;
    onReady?: () => void;
    onDesignLoad?: () => void;
    onDesignChange?: (data: any) => void;
    onEditorChange?: (data: any) => void;
    projectId?: number;
    tools?: any;
    appearance?: any;
    options?: any;
    locale?: string;
    style?: React.CSSProperties;
    ref?: React.Ref<any>;
  }
  const EmailEditor: React.ForwardRefExoticComponent<EmailEditorProps & React.RefAttributes<any>>;
  export default EmailEditor;
}
