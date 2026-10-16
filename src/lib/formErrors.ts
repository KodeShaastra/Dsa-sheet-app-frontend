import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api";

/**
 * Shows a failed API call on a form: field errors from `details` go under their inputs.
 * Returns the message for everything else (to show above the submit button).
 */
export function applyApiError<T extends FieldValues>(
  error: unknown,
  fields: readonly Path<T>[],
  setError: UseFormSetError<T>,
): string | null {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";

  let showedOnField = false;
  for (const detail of error.details) {
    const field = fields.find((f) => f === detail.path);
    if (field) {
      setError(field, { message: detail.message });
      showedOnField = true;
    }
  }
  return showedOnField ? null : error.message;
}
