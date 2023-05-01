import styles from "../styles/Splash.module.scss";

function Splash({ style }) {
  return (
    <main id="splash" style={style} className={styles.main}>
      <div className={styles.objectsContainer}>
        <object
          className={styles.splashKo}
          id="splashKo"
          data="/img/ko.svg"
          alt="ko"
        />
        <object
          className={styles.splashLogo}
          id="splashLogo"
          data="/img/loading.svg"
          alt="logo"
        />
      </div>
    </main>
  );
}

export default Splash;
