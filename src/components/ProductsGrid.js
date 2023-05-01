import styles from "@/styles/ProductsGrid.module.scss";
import Link from "next/link";
const { orderNow } = require("@/staticContent");

function ProductsGrid({data}) {
  return (
    <div className={styles.productsGrid}>
      {data?.map((product, index) => {
        return (
          <div href="" key={index} className={styles.product}>
            <div className={styles.imageContainer}>
              <img src={product?.image} alt="productImage" />
              <Link className={styles.orderNow} href={`/products/${product?.category_slug}/${product?.slug}`}>
                {orderNow}
                <img
                  className={styles.icon}
                  src="/img/itemBasket.svg"
                  alt="productCart"
                />
              </Link>
            </div>
            <div className={styles.productTitle}>{product?.name}</div>
            <div className={styles.productWeight}>
              {product?.sizes?.data[0]?.name}
            </div>
            <div className={styles.productPrice}>
              {Number(product?.sizes?.data[0]?.price)
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
            </div>
          </div>
        );
      })}
      
    </div>
  );
}

export default ProductsGrid;
