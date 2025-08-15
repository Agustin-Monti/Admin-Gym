// components/Alert.tsx
import { ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type AlertProps = {
  type: "error" | "success";
  children: ReactNode;
};

export function Alert({ type, children }: AlertProps) {
  const baseStyles = "flex items-center gap-2 border px-3 py-2 rounded-md text-sm";
  const styles =
    type === "error"
      ? "bg-red-500/10 border-red-500 text-red-400"
      : "bg-green-500/10 border-green-500 text-green-400";

  return (
    <div className={`${baseStyles} ${styles}`}>
      {type === "error" ? (
        <AlertTriangle size={18} className="text-red-400" />
      ) : (
        <CheckCircle2 size={18} className="text-green-400" />
      )}
      {children}
    </div>
  );
}
