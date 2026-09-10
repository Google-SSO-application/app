import { createContext, useContext, useState, useCallback, useRef } from "react";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";

const ConfirmContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog(options);
    });
  }, []);

  const handleConfirm = () => {
    resolverRef.current?.(true);
    setDialog(null);
  };
  const handleCancel = () => {
    resolverRef.current?.(false);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog dialog={dialog} onConfirm={handleConfirm} onCancel={handleCancel} />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return ctx;
}