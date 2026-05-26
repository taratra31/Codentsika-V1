import { toast } from "sonner";

export const showToast = (
  type: "success" | "error" | "warning" | "info",
  title: string,
  description?: string,
) => {
  switch (type) {
    case "success":
      toast.success(title, { description });
      break;
    case "error":
      toast.error(title, { description });
      break;
    case "warning":
      toast.warning(title, { description });
      break;
    case "info":
      toast.info(title, { description });
      break;
    default:
      toast(title, { description });
  }
};
