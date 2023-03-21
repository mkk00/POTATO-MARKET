import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useRecoilState } from "recoil";

import styled, { css } from 'styled-components';

import AddPhoto from '@/components/AddPhoto';
import firebase from '@/firebase';
import { userId, userInformation } from "@/stores/userAuth.js"
import { gray4, gray6, primaryColor } from "@/styles/global";

const db = firebase.firestore();
const storage = getStorage();

function WriteForm(){  
  const inputRef = useRef();
  const navigate = useNavigate();
  const [click,setClick] = useState(0)
  const [userUid,] = useRecoilState(userId);
  const [userInfo, ] = useRecoilState(userInformation);
  const [formState, setFormState] = useState({
    title: '',
    side: '물품 종류',
    price : ' - ',
    content: '',
    nickname: '',
    profileImage: '',
  });
  
  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name] : e.target.value,
    })
  }

  const handleSubmit = (e) => {
    setClick(1);
    e.preventDefault();
    const file = inputRef.current.files;
    const uploadPromises = [];
    for (let i = 0; i < file.length; i++) {
      const mountainRef = ref(storage, "writeimages/" + file[i].name);
      uploadPromises.push(uploadBytes(mountainRef, file[i]));
    }
  
    Promise.all(uploadPromises).then(() => {
      const urlPromises = [];
      for (let i = 0; i < file.length; i++) {
        const mountainRef = ref(storage, "writeimages/" + file[i].name);
        urlPromises.push(getDownloadURL(mountainRef));
      }
      Promise.all(urlPromises).then((urls) => {
        db.collection("UserWrite")
          .add({
            title: formState.title,
            side: "중고 거래 ",
            price: formState.price,
            content: formState.content,
            date: new Date(),
            imgsrc: urls,
            chat: 0,
            check: 0,
            heart: 0,
            userId : userUid,
            nickname: userInfo.nickname,
            profileImage: userInfo.profileImage,
            location : userInfo.location,
          })
          navigate("/HotArticles");
      })
    })
  }
  return <section>    
    <AddPhoto myinputRef={inputRef} />
    <h3 className="a11yHidden">게시글 작성란</h3>
    <Form>
      <fieldset>
        <legend>게시글 등록 폼</legend>      
        <WriteInput name="title" placeholder="제목을 입력해주세요"  required={true} type="text" value={formState.title} onChange={handleChange} />

        <RegionInformation className="userRegion">
          <span>{userInfo.location.sido}</span>
          <span>{userInfo.location.sigungu}</span>
          <span>{userInfo.location.bname}</span>
        </RegionInformation>

        <ProductPriceBox>
          <WriteInput name="price" placeholder="상품 가격을 입력해주세요" required={true} type="number" value={formState.price} onChange={handleChange} />
          <span className="productPrice">판매 가격 : {formState.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원</span>
        </ProductPriceBox>

        <WriteInput content name="content" placeholder="내용을 입력해주세요" required={true} type="text" value={formState.content} onChange={handleChange} />      
        
        <WriteButtonBox>
          <Button onClick={()=>{navigate("/HotArticles");}}>취소</Button>
          <Button disabled={click||!formState.title || !formState.price || !formState.content} type="submit" onClick={handleSubmit}>완료</Button>
        </WriteButtonBox>
      </fieldset>
    </Form>
  </section>
}

export function WriteInput({className,placeholder, disabled, type, content, value, accept, required, onChange, name, multiple,myinputRef}){
  return <label>
    {
      content ?
      <Textarea ref={myinputRef} className={className} name={name} placeholder={placeholder} required={required} type={type} value={value} onChange={onChange} /> :
      <Input ref={myinputRef} accept={accept} className={className} disabled={disabled} multiple={multiple} name={name} placeholder={placeholder} required={required} type={type} value={value} onChange={onChange} />
    }
  </label>
}

// mixin
const mixinInputStyle = css`
  margin-bottom: 20px;
  border-radius: 5px;
  border: 1px solid ${gray6};
  box-sizing: border-box;
  padding: 0 12px;
  font-size: 15px;
`

const Form = styled.form`
  width: 886px;
  display: flex;
  flex-flow: column nowrap;
  margin-left: auto;
  margin-right: auto;

  fieldset{
    padding: 0;
  }
`

const RegionInformation = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;
  
  & span{
    ${mixinInputStyle}
    width: 100%;
    line-height: 36px;    
    cursor: default;
  }
`

const Input = styled.input`
  ${mixinInputStyle}
  width: 100%;
  height: 37px;
`

const Textarea = styled.textarea`
  ${mixinInputStyle}
  width: 100%;
  height: 290px;
  padding: 12px;
  resize: none;
`

const ProductPriceBox = styled.div`
  width: 886px;
  display: flex;
  justify-content: space-between;
  gap: 50px;

  input{
    width: 585px;
    border: none;
    border-radius: 0;
    border-bottom: 1px solid ${gray6};
  }

  input::-webkit-inner-spin-button {
    appearance: none;
  }

  span{    
    width: 250px;
    line-height: 36px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    letter-spacing: .5px;
  }
`

const WriteButtonBox = styled.div`
  width: 218px;
  height: 40px;
  margin: 40px auto 80px auto;
  display: flex;
  justify-content: space-between;
  gap: 20px;
`

const Button = styled.button`
  width: 100%;
  border: none;
  border-radius: 4px;
  background: ${primaryColor};
  color: white;
  font-weight: bold;
  cursor: pointer;
  
  &[disabled]{
    cursor: not-allowed;
    background: ${gray4};
  }
`

export default WriteForm;