import AuthLayout from "@/components/AuthLayout";
import styles from "@/styles/Register.module.scss";
import Head from "next/head";
import Link from "next/link";
import { useRef, useState } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import {
  validateEmail,
  validateName,
  validateMobile,
  validatePassword,
} from "@/helpers/validations";
import { useRouter } from "next/router";
import LoadingOverlay from "@/components/LoadingOverlay";

const {apiUrl} =  require("@/helpers/config");

function Register(props) {
  const [registering, setRegistering] = useState(false);
  const router = useRouter();
  const {staticContent} = props;
  const { registerForm } = staticContent;
  const nameRef = useRef();
  const emailRef = useRef();
  const mobileRef = useRef();
  const password1Ref = useRef();
  const password2Ref = useRef();
  const acceptRef = useRef(false);
  const { enqueueSnackbar } = useSnackbar();
  const { setCookie } = props;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !acceptRef.current.checked ||
      nameRef.current.value.length === 0 ||
      emailRef.current.value.length === 0 ||
      password1Ref.current.value.length === 0 ||
      password2Ref.current.value.length === 0
    ) {
      if (!acceptRef.current.checked) {
        enqueueSnackbar(registerForm[9], { variant: "info" });
      }
      if (nameRef.current.value.length === 0) {
        enqueueSnackbar(registerForm[10], { variant: "info" });
      }
      if (emailRef.current.value.length === 0) {
        enqueueSnackbar(registerForm[11], { variant: "info" });
      }
      if (mobileRef.current.value.length === 0) {
        enqueueSnackbar(registerForm[20], { variant: "info" });
      }
      if (password1Ref.current.value.length === 0) {
        enqueueSnackbar(registerForm[12], { variant: "info" });
      }
      if (password2Ref.current.value.length === 0) {
        enqueueSnackbar(registerForm[13], { variant: "info" });
      }
    } else {
      if (
        !validateName(nameRef.current.value) ||
        !validateEmail(emailRef.current.value) ||
        !validateMobile(mobileRef.current.value) ||
        !validatePassword(password1Ref.current.value) ||
        password1Ref.current.value !== password2Ref.current.value
      ) {
        if (!validateName(nameRef.current.value)) {
          enqueueSnackbar(registerForm[14], { variant: "warning" });
        }
        if (!validateEmail(emailRef.current.value)) {
          enqueueSnackbar(registerForm[15], { variant: "warning" });
        }
        if (!validateMobile(mobileRef.current.value)) {
          enqueueSnackbar(registerForm[19], { variant: "warning" });
        }
        if (!validatePassword(password1Ref.current.value)) {
          enqueueSnackbar(registerForm[16], { variant: "warning" });
        }
        if (password1Ref.current.value !== password2Ref.current.value) {
          enqueueSnackbar(registerForm[17], { variant: "warning" });
        }
      } else {
        try {
          setRegistering(true);
          const res = await axios.post(`${apiUrl}/auth/register`, {
            name: nameRef.current.value,
            email: emailRef.current.value,
            mobile: mobileRef.current.value,
            password: password1Ref.current.value,
          });
          if (res.status === 200) {
            let expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            setCookie("auth", await res?.data?.item?.data, {
              expires: expiryDate,
            });
            setRegistering(false);
            router.push("/")
          } else {
            console.log(res);
            setRegistering(false);
          }
        } catch (error) {
          enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
          setRegistering(false);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>{registerForm[0]}</title>
      </Head>
      <AuthLayout {...props}>
        <form className={styles.register}>
          <div className={styles.title}>{registerForm[0]}</div>
          <div className={styles.inputs}>
            <div className={styles.inputAndLabel}>
              <label>{registerForm[1]}</label>
              <input
                autoComplete="new-name"
                name="name"
                style={{ fontFamily: "var(--f1)", height: "100%" }}
                ref={nameRef}
              />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{registerForm[2]}</label>
              <input autoComplete="new-email" name="email"  ref={emailRef} />
            </div>{" "}
            <div className={styles.inputAndLabel}>
              <label>{registerForm[18]}</label>
              <input autoComplete="new-mobile" name="mobile" ref={mobileRef} />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{registerForm[3]}</label>
              <input autoComplete="new-password" name="password" ref={password1Ref} type="password" />
              <img
                onClick={(e) => {
                  if (e.target.parentElement.children[1].type === "password") {
                    e.target.parentElement.children[1].type = "text";
                    e.target.src = "/img/eye.svg";
                  } else {
                    e.target.parentElement.children[1].type = "password";
                    e.target.src = "/img/eyeSlash.svg";
                  }
                }}
                src="/img/eyeSlash.svg"
                alt="eyeSlash"
              />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{registerForm[4]}</label>
              <input autoComplete="new-password" name="password" ref={password2Ref} type="password" />
              <img
                onClick={(e) => {
                  if (e.target.parentElement.children[1].type === "password") {
                    e.target.parentElement.children[1].type = "text";
                    e.target.src = "/img/eye.svg";
                  } else {
                    e.target.parentElement.children[1].type = "password";
                    e.target.src = "/img/eyeSlash.svg";
                  }
                }}
                src="/img/eyeSlash.svg"
                alt="eyeSlash"
              />
            </div>
          </div>
          <div className={styles.accept}>
            <input ref={acceptRef} type="checkbox" /> {registerForm[6]}
          </div>
          <button onClick={handleRegister}>{registerForm[5]}</button>
          <div className={styles.login}>
            {registerForm[7]} <Link href="/login">{registerForm[8]}</Link>
          </div>
          {registering && (
           <LoadingOverlay />
          )}
        </form>
      </AuthLayout>
    </>
  );
}

export default Register;
