import { create } from "zustand";

// FormData 타입 정의
type FormData = { [key: string]: string | number | undefined };

// ErrorState 타입 정의 (FormData와 유사하지만 값은 string | undefined)
type ErrorState = { [key: string]: string | undefined };

// Form 컨테이너 타입 정의
type FormContainer = Record<string, FormData>;

// 전체 상태의 타입 정의
type FormState = {
  forms: FormContainer;
  errors: Record<string, ErrorState>;
  updateForm: (formKey: string, data: Partial<FormData>) => void;
  resetForm: (formKey: string) => void;
  submitForm: (formKey: string) => void;
  setError: (formKey: string, error: ErrorState) => void;
  clearError: (formKey: string) => void;
};

// Zustand 스토어 생성
const useFormStore = create<FormState>((set) => ({
  forms: {},
  errors: {},

  updateForm: (formKey: string, data: Partial<FormData>) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formKey]: {
          ...state.forms[formKey],
          ...data,
        },
      },
    })),

  resetForm: (formKey: string) =>
    set((state) => {
      const newForms = { ...state.forms };
      delete newForms[formKey];
      return { forms: newForms };
    }),

  submitForm: (formKey: string) => {
    set((state) => {
      console.log(`Submitting form ${formKey}:`, state.forms[formKey]);
      // 여기에 폼 제출 로직을 추가할 수 있습니다.
      return state;
    });
  },

  setError: (formKey: string, error: ErrorState) =>
    set((state) => ({
      errors: { ...state.errors, [formKey]: error },
    })),

  clearError: (formKey: string) =>
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[formKey];
      return { errors: newErrors };
    }),
}));

// useForm 훅의 반환 타입 정의
type UseFormReturn<T extends FormData> = {
  formData: T;
  error: ErrorState;
  updateFormData: (data: Partial<T>) => void;
  resetFormData: () => void;
  submitFormData: () => void;
  setFormError: (error: { [K in keyof T]: string | undefined }) => void;
  clearFormError: () => void;
};

// React 훅 생성
export const useForm = <T extends FormData>(
  formKey: string
): UseFormReturn<T> => {
  const {
    forms,
    errors,
    updateForm,
    resetForm,
    submitForm,
    setError,
    clearError,
  } = useFormStore();

  return {
    formData: (forms[formKey] || {}) as T,
    error: errors[formKey] || {},
    updateFormData: (data: Partial<T>) => updateForm(formKey, data),
    resetFormData: () => resetForm(formKey),
    submitFormData: () => submitForm(formKey),
    setFormError: (error: { [K in keyof T]: string | undefined }) =>
      setError(formKey, error),
    clearFormError: () => clearError(formKey),
  };
};

// 타입 안전한 폼 생성 함수
export const createTypedForm = <T extends FormData>() => {
  return (formKey: string): UseFormReturn<T> => useForm<T>(formKey);
};

export default useFormStore;
