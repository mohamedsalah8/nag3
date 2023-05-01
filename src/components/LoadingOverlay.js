import styles from "@/styles/LoadingOverlay.module.scss";
import { PuffLoader } from "react-spinners";

function LoadingOverlay() {
  return (
    <div className={styles.loadingOverlay}>
      <PuffLoader />
    </div>
  );
}

export default LoadingOverlay;
