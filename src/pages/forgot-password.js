import AuthLayout from "@/components/AuthLayout";
import styles from "@/styles/ForgotPassword.module.scss";
import Link from "next/link";
import Head from "next/head";
import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
const { apiUrl } = require("@/helpers/config");

function ForgotPassword(props) {
  const { staticContent } = props;
  const { forgotPassword } = staticContent;
  const [form, setform] = useState({
    email: "",
    code: "",
    password: "",
    password2: "",
  });
  const [step, setStep] = useState(1);

  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const handleCodeChange = (e) => {
    if (e.target.value.length < 5) {
      setform({
        ...form,
        code: e.target.value,
      });
    }
  };

  const handleEmailAndPasswordChange = (e) => {
    setform({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFirstNext = async () => {
    try {
      const res = await axios.post(`${apiUrl}/forgot-password/sendCode`, {
        email: form?.email,
      });
      if (res.status === 200) {
        setStep(2);
        enqueueSnackbar(forgotPassword?.[15] + form?.email, {
          variant: "info",
        });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  const handleSecondNext = async () => {
    try {
      const res = await axios.post(`${apiUrl}/forgot-password/confirmCode`, {
        email: form?.email,
        code: form?.code,
      });
      if (res.status === 200) {
        setStep(3);
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  const handleThirdNext = async () => {
    if (form?.password === form?.password2) {
      try {
        const res = await axios.post(
          `${apiUrl}/forgot-password/updatePassword`,
          { email: form?.email, password: form?.password }
        );
        if (res.status === 200) {
          enqueueSnackbar(forgotPassword?.[17], { variant: "success" });
          setTimeout(() => {
            router.replace("/login");
          }, 1000);
        }
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
      }
    } else {
      enqueueSnackbar(forgotPassword?.[16], { variant: "warning" });
    }
  };

  return (
    <>
      <Head>
        <title>{forgotPassword[0]}</title>
      </Head>
      <AuthLayout {...props}>
        <div className={styles.forgotPassword}>
          <div className={styles.title}>{forgotPassword[1]}</div>
          {step === 1 && (
            <div className={styles.firstStep}>
              <div className={styles.subtitle}>{forgotPassword[2]}</div>
              <div className={styles.inputAndLabel}>
                <label>{forgotPassword[3]}</label>
                <input
                  name="email"
                  onChange={handleEmailAndPasswordChange}
                  placeholder={forgotPassword[4]}
                />
              </div>
              <button onClick={handleFirstNext}>{forgotPassword[5]}</button>
            </div>
          )}
          {step === 2 && (
            <div className={styles.secondStep}>
              <div className={styles.subtitle}>
                {`${forgotPassword[8]} ${" "}`} <span>{form?.email}</span>
              </div>
              <div className={styles.inputAndLabel}>
                <label>{forgotPassword[9]}</label>

                <input
                  value={form.code}
                  onChange={handleCodeChange}
                  type="number"
                />
                <div className={styles.inputBG}>
                  <span /> <span /> <span /> <span />
                </div>
              </div>
              <button onClick={handleSecondNext}>{forgotPassword[5]}</button>
            </div>
          )}
          {step === 3 && (
            <div className={styles.thirdStep}>
              <div className={styles.subtitle}>{forgotPassword[10]}</div>
              <div className={styles.subtitle2}>{forgotPassword[11]}</div>
              <div className={styles.inputAndLabel}>
                <label>{forgotPassword[12]}</label>
                <input
                  name="password2"
                  onChange={handleEmailAndPasswordChange}
                  type="password"
                />
                <img
                  onClick={(e) => {
                    if (
                      e.target.parentElement.children[1].type === "password"
                    ) {
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
                <label>{forgotPassword[13]}</label>
                <input
                  name="password"
                  onChange={handleEmailAndPasswordChange}
                  type="password"
                />
                <img
                  onClick={(e) => {
                    if (
                      e.target.parentElement.children[1].type === "password"
                    ) {
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
              <button onClick={handleThirdNext}>{forgotPassword[14]}</button>
            </div>
          )}

          <div className={styles.register}>
            {forgotPassword[6]}
            <Link href="/register">{forgotPassword[7]}</Link>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

export default ForgotPassword;
