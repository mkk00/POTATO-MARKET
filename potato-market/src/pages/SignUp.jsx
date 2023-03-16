import { useState } from 'react';

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import styled from 'styled-components';

import FormInput, { FormInputLocation, FormInputImage } from '../components/FormInput';
import FormTerms from '../components/FormTerms';
import FormButton from '../styles/FormButton';

import { gray8 } from '../styles/Global';

const Section = styled.section`
  padding: 80px 0 40px;
  h2 {
    line-height: 36px;
    font-size: 32px;
    font-weight: 500;
    text-align: center;
  }
`;

const SignUpForm = styled.form`
  position: relative;
  width: 640px;
  margin: 44px auto;
  .form-list {
    display: block;
    border-top: 2px solid black;
  }
  .form-item {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 84px;
    padding: 20px 0;
    box-sizing: border-box;
  }
  .term-list {
    display: flex;
    gap: 8px;
    padding: 12px 0 20px;
    margin-bottom: 40px;
    border-top: 1px solid black;
    border-bottom: 1px solid ${gray8};
  }
  .term-title {
    flex-shrink: 0;
    width: 139px;
    font-weight: 700;
    line-height: 32px;
  }
  .term-check {
    width: 100%;
  }
  @media screen and (max-width: 700px) {
    width: calc(100% - 60px);
    margin: 44px 30px;
    .form-item {
      flex-direction: column;
    }
    .term-list {
      flex-direction: column;
    }
  }
`;

const SignUp = () => {

  const [formState, setFormState] = useState({
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formState.password !== formState.confirmPassword) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    firebase
      .auth()
      .createUserWithEmailAndPassword(formState.email, formState.password)
      .then((userCredential) => {
        const db = firebase.firestore();
        db.collection("users").doc(userCredential.user.uid).set({
          email: formState.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          phoneNumber: formState.phoneNumber,
          nickname: formState.nickname,
        });
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <Section>
      <h2>회원가입</h2>
      <SignUpForm onSubmit={handleSubmit}>
        <fieldset>
          <legend>신규 회원가입 폼</legend>
          {error && <p style={{ backgroundColor: 'yellow' }}>{error}</p>}
          <ul className="form-list">
            <li className="form-item">
              <FormInput
                label
                button={"인증번호 받기"}
                id={"phoneNumber"}
                placeholder={"숫자만 입력해주세요"}
                text={"휴대폰"}
                type={"tel"}
                value={formState.phoneNumber}
                onChange={handleInputChange}
              />
            </li>
            <li className="form-item">
              <FormInput
                label
                button={"인증번호 받기"}
                id={"email"}
                placeholder={"이메일을 입력해주세요"}
                text={"이메일"}
                type={"email"}
                value={formState.email}
                onChange={handleInputChange}
              />
            </li>
            <li className="form-item">
              <FormInput
                label
                id={"password"}
                placeholder={"비밀번호를 입력해주세요"}
                text={"비밀번호"}
                type={"password"}
                valid={"최소 8자 이상 입력"}
                value={formState.password}
                onChange={handleInputChange}
              />
            </li>
            <li className="form-item">
              <FormInput
                label
                id={"confirmPassword"}
                placeholder={"비밀번호를 한번 더 입력해주세요"}
                text={"비밀번호 확인"}
                type={"password"}
                valid={"동일한 비밀번호를 입력"}
                value={formState.confirmPassword}
                onChange={handleInputChange}
              />
            </li>
            <li className="form-item">
              <FormInput
                label
                id={"nickname"}
                placeholder={"닉네임을 입력해주세요"}
                text={"닉네임"}
                type={"text"}
                value={formState.nickname}
                onChange={handleInputChange}
              />
            </li>
            <li className="form-item">
              <FormInputImage />
            </li>
            <li className="form-item">
              <FormInputLocation process={"search"} />
            </li>
            <li className="form-item">
              <FormInputLocation process={"detail"} />
            </li>
          </ul>
          <div className="term-list">
            <span className="term-title">이용약관동의</span>
            <div className="term-check">
              <FormTerms all />
              <FormTerms id={"term1"} text={"이용약관 동의 (필수)"} />
              <FormTerms id={"term2"} text={"개인정보 수집 · 이용 동의 (필수)"} />
              <FormTerms id={"term3"} text={"무료배송, 할인쿠폰 등 혜택/정보 수신 동의 (선택)"} />
              <FormTerms id={"term4"} text={"본인은 만 14세 이상입니다. (필수)"} />
            </div>
          </div>
          <FormButton primary type="submit">가입하기</FormButton>
        </fieldset>
      </SignUpForm>
    </Section >
  )
};

export default SignUp;