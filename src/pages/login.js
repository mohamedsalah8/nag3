import AuthLayout from "@/components/AuthLayout";
import styles from "@/styles/Login.module.scss";
import Link from "next/link";
import Head from "next/head";
import axios from "axios";
import {
  validateEmail,
} from "@/helpers/validations";
import { useRef, useState } from "react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useRouter } from "next/router";
import { useSnackbar} from "notistack";
const {apiUrl} =  require("@/helpers/config");

function Login(props) {
  const [loggingin, setLoggingin] = useState(false);
  const {staticContent,setCookie} = props;

  const { loginForm } = staticContent;
  const router = useRouter();
  const emailRef = useRef();
  const passwordRef = useRef();

  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (
      emailRef?.current?.value.length === 0 ||
      passwordRef?.current?.value.length === 0
    ) {
      if (emailRef.current?.value.length === 0) {
        enqueueSnackbar(loginForm[7], { variant: "info" });
      }
      if (passwordRef?.current?.value.length === 0) {
        enqueueSnackbar(loginForm[8], { variant: "info" });
      }
    } else {
      if (!validateEmail(emailRef.current?.value)) {
        enqueueSnackbar(loginForm[9], { variant: "warning" });
      } else {
        try {
          setLoggingin(true);
          const res = await axios.post(`${apiUrl}/auth/login`, {
            email:emailRef?.current?.value,
            password:passwordRef?.current?.value
          });
          if (res.status === 200) {
            let expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            setCookie("auth", await res?.data?.item?.data, {
              expires: expiryDate,
            });
            setLoggingin(false);
            router.push("/");
          } else {
            console.log(res);
            setLoggingin(false);
          }
        } catch (error) {
          enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
          setLoggingin(false);
        }
      }
    }
  };

  return (
    <>
      <Head>
        <title>{loginForm[0]}</title>
      </Head>
      <AuthLayout {...props}>
        <form className={styles.login}>
          <div className={styles.title}>{loginForm[0]}</div>
          <div className={styles.inputAndLabel}>
            <label>{loginForm[1]}</label>
            <input autoComplete="current-email" ref={emailRef} name="email" />
          </div>
          <div className={styles.inputAndLabel}>
            <label>{loginForm[2]}</label>
            <input
              autoComplete="current-password"
              name="password"
              ref={passwordRef}
              type="password"
            />
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
          <button onClick={handleLogin}>{loginForm[3]}</button>
          <Link href="/forgot-password">{loginForm[4]}</Link>
          <div className={styles.register}>
            {loginForm[5]} <Link href="/register">{loginForm[6]}</Link>
          </div>
          {loggingin && (
           <LoadingOverlay />
          )}
        </form>
      </AuthLayout>
    </>
  );
}

export default Login;
