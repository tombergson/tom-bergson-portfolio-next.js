declare module "@marsdev/react-turnstile" {
  import * as React from "react";

  interface TurnstileProps {
    siteKey: string;
    onSuccess?: (token: string) => void;
    onError?: (errorCode?: string) => void;
    onExpire?: () => void;
    options?: {
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "invisible";
      action?: string;
      cData?: string;
      tabindex?: number;
    };
    scriptOptions?: {
      async?: boolean;
      defer?: boolean;
      appendTo?: "head" | "body";
      id?: string;
    };
  }

  export const Turnstile: React.FC<TurnstileProps>;
}