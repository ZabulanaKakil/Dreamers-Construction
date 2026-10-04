import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** Public form field with [required] / [optional] label tags. */
export function FormField({
  label,
  htmlFor,
  required = false,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={htmlFor} className="form-label">
        {label}{" "}
        <span className="form-label-tag">
          {required ? "[required]" : "[optional]"}
        </span>
      </label>
      <div className="form-field-control">{children}</div>
    </div>
  );
}

/** Filter / control label — same typography, no required tag. */
export function FilterLabel({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={htmlFor} className="form-label">
        {label}
      </label>
      <div className="form-field-control">{children}</div>
    </div>
  );
}
