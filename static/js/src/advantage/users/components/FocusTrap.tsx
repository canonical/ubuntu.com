import React, { useRef, useEffect } from "react";
import { createFocusTrap, FocusTrap as FocusTrapType } from "focus-trap";

const FocusTrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trapRef = useRef(null);
  const focusTrap = useRef<FocusTrapType | null>(null);

  useEffect(() => {
    if (trapRef.current) {
      focusTrap.current = createFocusTrap(trapRef.current);
      focusTrap.current.activate();
    }
    return () => {
      focusTrap.current?.deactivate();
    };
  }, [trapRef]);

  return <div ref={trapRef}>{children}</div>;
};

export default FocusTrap;
