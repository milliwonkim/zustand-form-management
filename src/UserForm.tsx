import { FormEventHandler, useCallback } from "react";
import { createTypedForm } from "./useFormStore";

// 폼 타입 정의
type UserFormDataOne = {
  name: string;
  gender: string;
};
type UserFormDataTwo = {
  name: string;
  age: number;
};

// 타입이 지정된 폼 생성
const useUserFormOne = createTypedForm<UserFormDataOne>();
const useUserFormTwo = createTypedForm<UserFormDataTwo>();

// 컴포넌트에서 사용
const UserFormOne = () => {
  const {
    formData,
    error,
    updateFormData,
    resetFormData,
    submitFormData,
    setFormError,
  } = useUserFormOne("userFormOne");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "age" ? parseInt(e.target.value) : e.target.value;
    updateFormData({ [e.target.name]: value });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      if (formData.gender === "man") {
        setFormError({ gender: "err!!!", name: undefined });
        return;
      }
      submitFormData();
    },
    [formData.gender, setFormError, submitFormData]
  );

  console.info("error", error);

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData?.name || ""}
        onChange={handleInputChange}
        placeholder="이름"
      />
      <input
        name="gender"
        value={formData?.gender || ""}
        onChange={handleInputChange}
        placeholder="gender"
      />
      <button type="submit">제출</button>
      <button type="button" onClick={resetFormData}>
        초기화
      </button>
    </form>
  );
};

const UserFormTwo = () => {
  const { formData, updateFormData, resetFormData, submitFormData } =
    useUserFormTwo("userFormTwo");

  console.info("formData 2", formData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "age" ? parseInt(e.target.value) : e.target.value;
    updateFormData({ [e.target.name]: value });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();

      if (formData) submitFormData();
    },
    [formData, submitFormData]
  );

  return (
    <div>
      <h1>Form 2</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData?.name || ""}
          onChange={handleInputChange}
          placeholder="이름"
        />
        <input
          name="age"
          type="number"
          value={formData?.age || ""}
          onChange={handleInputChange}
          placeholder="나이"
        />
        <button type="submit">제출</button>
        <button type="button" onClick={resetFormData}>
          초기화
        </button>
      </form>
    </div>
  );
};

const UserForm = () => {
  return (
    <>
      <UserFormOne />
      <UserFormTwo />
    </>
  );
};

export default UserForm;
