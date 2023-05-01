import styles from "@/styles/Footer.module.scss";
function Footer({ footerContnet }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.start}>
          <div className={styles.social}>
            {footerContnet?.followUs}: <a href="">{footerContnet?.fb}</a> .{" "}
            <a href="">{footerContnet?.ig}</a> . <a href="">{footerContnet?.yt}</a>
          </div>

          <div className={styles.contact}>
            <div className={styles.email}>
              {footerContnet?.question}: <a href="">nagaa@mail.com</a>
            </div>
          </div>
        </div>
        <div className={styles.center}>
          <img src="/img/footerLogo.png" alt="footerLogo" />
          <div>
          <a href="">
              <img src="/img/r-logo.svg" alt="raqamyat" />
            </a>
            Made with ❤️ by{" "}
            
          </div>
        </div>
        <div className={styles.end}>
          <div className={styles.rights}>جميع الحقوق محفوظة © 2023 | نجـع</div>

          <div className={styles.contact}>
            <div className={styles.links}>
              <a href="">{footerContnet?.use}</a> . {"  "}
              <a href="">{footerContnet?.privacy}</a>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}></div>
    </footer>
  );
}

export default Footer;
