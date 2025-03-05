import { toast } from "sonner";

interface ToasterProps {
  errormessage: string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  type?: string;
}

export function Toast_Custom({ errormessage, setError, type }: ToasterProps) {
  if (type === "success") {
    toast.success("Успех!", {
      position: "bottom-right",
      description: errormessage,
      onAutoClose: () => setError(null),
      action: {
        label: "Закрыть",
        onClick: () => {
          setError(null);
        },
      },
    });
  } else {
    toast.warning("Ошибка", {
      position: "bottom-right",
      description: errormessage,
      onAutoClose: () => setError(null),
      action: {
        label: "Закрыть",
        onClick: () => {
          setError(null);
        },
      },
    });
  }
}
