import styles from "@/styles/AuthLayout.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCookies } from "react-cookie";


function AuthLayout({ children, setSplashLoading }) {
  const [ cookies ] = useCookies(["auth"]);
  useEffect(() => {
    setSplashLoading(false);
    }, [])
   
  const router = useRouter();
  useEffect(() => {
    if(cookies?.auth?.token){
      router.push("/");
    }
  }, [cookies])

  return (
    <div
      className={styles.authLayout}
    >
      <div className={styles.header} />
      <div className={styles.startAndEnd}>
        <div className={styles.start}>
        {children}
        </div>
        <div className={styles.end}>
          <img src="/img/auth.png" alt="auth" />
        </div>
      </div>
      <Link className={styles.toHomepage} href="/">
          <img src='/img/logo.png' alt='logo' />
        </Link>
    </div>
  );
}

export default AuthLayout;
