import { toast } from "sonner";

interface ToastProps {
  errormessage: string;
  setError: (error: string) => void;
  type: "success" | "error" | "warning" | "info";
}

export const Toast_Custom = ({ errormessage, setError, type }: ToastProps) => {
  if (type === "success") {
    toast.success(errormessage);
  } else if (type === "error") {
    toast.error(errormessage);
  } else if (type === "warning") {
    toast.warning(errormessage);
  } else if (type === "info") {
    toast.info(errormessage);
  }

  setError("");
  return null;
};