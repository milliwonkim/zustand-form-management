import React, { useCallback, useEffect } from "react";
import { createTypedForm } from "./useFormStore";

// 취미 항목의 타입 정의
type HobbyItem = {
  name: string;
  gender: string;
  country: string;
};

// 폼 데이터 타입 정의
type UserFormData = {
  name: string;
  email: string;
  age: number;
  hobbies: HobbyItem[];
};

// 기본값 정의
const defaultFormData: UserFormData = {
  name: "",
  email: "",
  age: 0,
  hobbies: [],
};

// 새 취미 항목의 기본값
const defaultHobbyItem: HobbyItem = {
  name: "",
  gender: "",
  country: "",
};

// 타입이 지정된 폼 생성
const useUserForm = createTypedForm<UserFormData>();

const UserForm: React.FC = () => {
  const {
    formData,
    error,
    updateFormData,
    resetFormData,
    submitFormData,
    setFormError,
    updateFormArray,
    addToFormArray,
    removeFromFormArray,
  } = useUserForm("userForm");

  // 컴포넌트 마운트 시 기본값 설정
  useEffect(() => {
    updateFormData(defaultFormData);
  }, [updateFormData]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      updateFormData({ [name]: name === "age" ? Number(value) : value });
    },
    [updateFormData]
  );

  const handleHobbyAdd = useCallback(() => {
    addToFormArray("hobbies", defaultHobbyItem);
  }, [addToFormArray]);

  const handleHobbyChange = useCallback(
    (index: number, field: keyof HobbyItem, value: string) => {
      updateFormArray("hobbies", index, {
        ...((formData.hobbies && formData.hobbies[index]) || defaultHobbyItem),
        [field]: value,
      });
    },
    [formData.hobbies, updateFormArray]
  );

  const handleHobbyRemove = useCallback(
    (index: number) => {
      removeFromFormArray("hobbies", index);
    },
    [removeFromFormArray]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) {
        setFormError({
          name: "Name is required",
          hobbies: [{ name: "fdsjioafjs" }],
        });
        return;
      }
      submitFormData();
      console.log("Form submitted:", formData);
    },
    [formData, setFormError, submitFormData]
  );

  // formData가 undefined일 경우를 대비한 안전한 접근
  const safeFormData: UserFormData = formData || defaultFormData;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          value={safeFormData.name || ""}
          onChange={handleInputChange}
        />
        {error?.name && <span style={{ color: "red" }}>{error.name}</span>}
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={safeFormData.email || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          name="age"
          type="number"
          value={safeFormData.age || ""}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <h3>Hobbies:</h3>
        {(safeFormData.hobbies || []).map((hobby, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            <input
              placeholder="Hobby name"
              value={hobby.name}
              onChange={(e) => handleHobbyChange(index, "name", e.target.value)}
            />
            <input
              placeholder="Gender"
              value={hobby.gender}
              onChange={(e) =>
                handleHobbyChange(index, "gender", e.target.value)
              }
            />
            <input
              placeholder="Country"
              value={hobby.country}
              onChange={(e) =>
                handleHobbyChange(index, "country", e.target.value)
              }
            />
            <button type="button" onClick={() => handleHobbyRemove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleHobbyAdd}>
          Add Hobby
        </button>
      </div>

      <div>
        <button type="submit">Submit</button>
        <button type="button" onClick={resetFormData}>
          Reset
        </button>
      </div>
    </form>
  );
};

export default UserForm;
