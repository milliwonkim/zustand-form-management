import { useState, useCallback } from "react";
import { z } from "zod";

type FormValues = Record<string, string | number | undefined>;

type UseFormProps<T extends FormValues> = {
  defaultValues: T;
  schema: z.ZodType<T>;
};

export function useForm<T extends FormValues>({
  defaultValues,
  schema,
}: UseFormProps<T>) {
  type FormState = {
    [K in keyof T]: {
      value: T[K];
      error: string | null;
    };
  };

  const initialState = Object.keys(defaultValues).reduce((acc, key) => {
    acc[key as keyof T] = {
      value: defaultValues[key as keyof T],
      error: null,
    };
    return acc;
  }, {} as FormState);

  const [formState, setFormState] = useState<FormState>(initialState);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      try {
        schema.parse({ [name]: value });
        return null;
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0].message;
        }
        return "Validation failed";
      }
    },
    [schema]
  );

  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      const error = validateField(name, value);
      setFormState((prev) => ({
        ...prev,
        [name]: { value, error },
      }));
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (onSubmit: (data: T) => void) => {
      return (e: React.FormEvent) => {
        e.preventDefault();
        const formData = Object.entries(formState).reduce(
          (acc, [key, field]) => {
            acc[key as keyof T] = field.value;
            return acc;
          },
          {} as T
        );

        try {
          const validatedData = schema.parse(formData);
          onSubmit(validatedData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              const field = err.path[0] as keyof T;
              setFormState((prev) => ({
                ...prev,
                [field]: { ...prev[field], error: err.message },
              }));
            });
          }
        }
      };
    },
    [formState, schema]
  );

  return {
    formState,
    handleChange,
    handleSubmit,
  };
}
