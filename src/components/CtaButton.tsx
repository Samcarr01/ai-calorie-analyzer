import * as React from "react";

import { cn } from "@/lib/utils";

export interface CtaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const CtaButton = React.forwardRef<HTMLButtonElement, CtaButtonProps>(
  ({ className, children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn("cta-button", className)}
        {...props}
      >
        <span className="cta-button__wrapper">
          <span className="cta-button__label">{children}</span>
          <span className="cta-button__circle cta-circle-1" />
          <span className="cta-button__circle cta-circle-2" />
          <span className="cta-button__circle cta-circle-3" />
          <span className="cta-button__circle cta-circle-4" />
          <span className="cta-button__circle cta-circle-5" />
          <span className="cta-button__circle cta-circle-6" />
          <span className="cta-button__circle cta-circle-7" />
          <span className="cta-button__circle cta-circle-8" />
          <span className="cta-button__circle cta-circle-9" />
          <span className="cta-button__circle cta-circle-10" />
          <span className="cta-button__circle cta-circle-11" />
          <span className="cta-button__circle cta-circle-12" />
        </span>
      </button>
    );
  }
);

CtaButton.displayName = "CtaButton";
