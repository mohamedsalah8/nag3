import styles from "@/styles/CategoryHeader.module.scss";
const { category : categoryContent } = require("@/staticContent");

function CategoryHeader({category}) {
  return (
<div className={styles.categoryHeader}>
    <div className={styles.imagesContainer}>
      <img
        className={styles.img1}
        src={category?.image}
        alt="categoryImage"
      />
      <img
        className={styles.img2}
        src={category?.image}
        alt="categoryImage"
      />
      <img
        className={styles.img3}
        src={category?.image}
        alt="categoryImage"
      />
      <img
        className={styles.img4}
        src={category?.image}
        alt="categoryImage"
      />
      <img
        className={styles.img5}
        src={category?.image}
        alt="categoryImage"
      />
    </div>
    <div className={styles.beforeTitle}>{categoryContent[0]}</div>
    <div className={styles.titleContainer}>
      <div className={styles.title}>{category?.name}</div>
    </div>
    <div className={styles.subtitleContainer}>
      <div className={styles.subtitle}>
        {category?.subtitle}
      </div>
    </div>
  </div>
  )
}

export default CategoryHeader