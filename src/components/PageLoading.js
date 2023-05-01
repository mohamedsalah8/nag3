import styles from '@/styles/PageLoading.module.scss'
import { PuffLoader } from 'react-spinners'

function PageLoading() {
  return (
    <div className={styles.pageLoading}>
        <PuffLoader color='#fbac18'/>
    </div>
  )
}

export default PageLoading