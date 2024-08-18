import { create } from "zustand";
import { useCallback, useMemo } from "react";

// 기본 타입 정의
type Primitive = string | number | boolean | undefined | null;
type FormDataValue =
  | Primitive
  | FormDataValue[]
  | { [key: string]: FormDataValue };
type FormData = Record<string, FormDataValue>;

type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

type ErrorState<T extends FormData> = RecursivePartial<{
  [K in keyof T]: T[K] extends (infer U)[] ? RecursivePartial<U>[] : string;
}>;

// Form 컨테이너 타입 정의
type FormContainer = Record<string, FormData>;

// 전체 상태의 타입 정의
type FormState = {
  forms: FormContainer;
  errors: Record<string, ErrorState<FormData>>;
  updateForm: <T extends FormData>(formKey: string, data: Partial<T>) => void;
  resetForm: (formKey: string) => void;
  submitForm: (formKey: string) => void;
  setError: <T extends FormData>(formKey: string, error: ErrorState<T>) => void;
  clearError: (formKey: string) => void;
  updateFormArray: <T extends FormData, K extends keyof T>(
    formKey: string,
    fieldKey: K & string,
    index: number,
    value: T[K] extends (infer U)[] ? U : never
  ) => void;
  addToFormArray: <T extends FormData, K extends keyof T>(
    formKey: string,
    fieldKey: K & string,
    value: T[K] extends (infer U)[] ? U : never
  ) => void;
  removeFromFormArray: <T extends FormData, K extends keyof T>(
    formKey: string,
    fieldKey: K & string,
    index: number
  ) => void;
};

// Zustand 스토어 생성
const useFormStore = create<FormState>((set) => ({
  forms: {},
  errors: {},

  updateForm: (formKey, data) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formKey]: {
          ...state.forms[formKey],
          ...data,
        },
      },
    })),

  resetForm: (formKey) =>
    set((state) => {
      const { [formKey]: _, ...newForms } = state.forms;
      return { forms: newForms };
    }),

  submitForm: (formKey) => {
    set((state) => {
      console.log(`Submitting form ${formKey}:`, state.forms[formKey]);
      return state;
    });
  },

  setError: (formKey, error) =>
    set((state) => ({
      errors: { ...state.errors, [formKey]: error },
    })),

  clearError: (formKey) =>
    set((state) => {
      const { [formKey]: _, ...newErrors } = state.errors;
      return { errors: newErrors };
    }),

  updateFormArray: (formKey, fieldKey, index, value) =>
    set((state) => {
      const currentForm = state.forms[formKey];
      if (!currentForm) return state;
      const currentArray = currentForm[fieldKey];
      if (!Array.isArray(currentArray)) return state;
      const newArray = [...currentArray];
      newArray[index] = value;
      return {
        forms: {
          ...state.forms,
          [formKey]: {
            ...currentForm,
            [fieldKey]: newArray,
          },
        },
      };
    }),

  addToFormArray: (formKey, fieldKey, value) =>
    set((state) => {
      const currentForm = state.forms[formKey];
      if (!currentForm) return state;
      const currentArray = currentForm[fieldKey];
      if (!Array.isArray(currentArray)) return state;
      return {
        forms: {
          ...state.forms,
          [formKey]: {
            ...currentForm,
            [fieldKey]: [...currentArray, value],
          },
        },
      };
    }),

  removeFromFormArray: (formKey, fieldKey, index) =>
    set((state) => {
      const currentForm = state.forms[formKey];
      if (!currentForm) return state;
      const currentArray = currentForm[fieldKey];
      if (!Array.isArray(currentArray)) return state;
      return {
        forms: {
          ...state.forms,
          [formKey]: {
            ...currentForm,
            [fieldKey]: currentArray.filter((_, i) => i !== index),
          },
        },
      };
    }),
}));

// useForm 훅의 반환 타입 정의
type UseFormReturn<T extends FormData> = {
  formData: T;
  error: ErrorState<T>;
  updateFormData: (data: Partial<T>) => void;
  resetFormData: () => void;
  submitFormData: () => void;
  setFormError: (error: ErrorState<T>) => void;
  clearFormError: () => void;
  updateFormArray: <K extends keyof T>(
    fieldKey: K & string,
    index: number,
    value: T[K] extends (infer U)[] ? U : never
  ) => void;
  addToFormArray: <K extends keyof T>(
    fieldKey: K & string,
    value: T[K] extends (infer U)[] ? U : never
  ) => void;
  removeFromFormArray: <K extends keyof T>(
    fieldKey: K & string,
    index: number
  ) => void;
};

// 최적화된 React 훅 생성
export const useForm = <T extends FormData>(
  formKey: string
): UseFormReturn<T> => {
  const formData = useFormStore((state) => state.forms[formKey] as T);
  const error = useFormStore((state) => state.errors[formKey] as ErrorState<T>);
  const updateForm = useFormStore((state) => state.updateForm);
  const resetForm = useFormStore((state) => state.resetForm);
  const submitForm = useFormStore((state) => state.submitForm);
  const setError = useFormStore((state) => state.setError);
  const clearError = useFormStore((state) => state.clearError);
  const updateFormArray = useFormStore((state) => state.updateFormArray);
  const addToFormArray = useFormStore((state) => state.addToFormArray);
  const removeFromFormArray = useFormStore(
    (state) => state.removeFromFormArray
  );

  const updateFormData = useCallback(
    (data: Partial<T>) => updateForm<T>(formKey, data),
    [updateForm, formKey]
  );

  const resetFormData = useCallback(
    () => resetForm(formKey),
    [resetForm, formKey]
  );
  const submitFormData = useCallback(
    () => submitForm(formKey),
    [submitForm, formKey]
  );
  const setFormError = useCallback(
    (error: ErrorState<T>) => setError<T>(formKey, error),
    [setError, formKey]
  );
  const clearFormError = useCallback(
    () => clearError(formKey),
    [clearError, formKey]
  );

  const updateFormArrayData = useCallback(
    <K extends keyof T>(
      fieldKey: K & string,
      index: number,
      value: T[K] extends (infer U)[] ? U : never
    ) => updateFormArray<T, K>(formKey, fieldKey, index, value),
    [updateFormArray, formKey]
  );

  const addToFormArrayData = useCallback(
    <K extends keyof T>(
      fieldKey: K & string,
      value: T[K] extends (infer U)[] ? U : never
    ) => addToFormArray<T, K>(formKey, fieldKey, value),
    [addToFormArray, formKey]
  );

  const removeFromFormArrayData = useCallback(
    <K extends keyof T>(fieldKey: K & string, index: number) =>
      removeFromFormArray<T, K>(formKey, fieldKey, index),
    [removeFromFormArray, formKey]
  );

  return useMemo(
    () => ({
      formData: formData || ({} as T),
      error: error || {},
      updateFormData,
      resetFormData,
      submitFormData,
      setFormError,
      clearFormError,
      updateFormArray: updateFormArrayData,
      addToFormArray: addToFormArrayData,
      removeFromFormArray: removeFromFormArrayData,
    }),
    [
      formData,
      error,
      updateFormData,
      resetFormData,
      submitFormData,
      setFormError,
      clearFormError,
      updateFormArrayData,
      addToFormArrayData,
      removeFromFormArrayData,
    ]
  );
};

// 타입 안전한 폼 생성 함수
export const createTypedForm = <T extends FormData>() => {
  return (formKey: string): UseFormReturn<T> => useForm<T>(formKey);
};

export default useFormStore;
