import DefaultLayout from "@/components/DefaultLayout";
import styles from "@/styles/Category.module.scss";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import ProductsGrid from "@/components/ProductsGrid";
import CategoryHeader from "@/components/CategoryHeader";

const { apiUrl } = require("@/helpers/config");

function Category(props) {
  const [category, setCategory] = useState({});
  const [products, setProducts] = useState([]);
  const { setSplashLoading, pageLoading, setPageLoading, categories, staticContent } = props;
  const router = useRouter();

  useEffect(() => {
    if (router.query.category_slug) {
      (async () => {
        const res = await axios.get(`${apiUrl}/products/pages`, {
          params: {
            category_id: router.query.category_slug,
          },
        });
        if (res.status === 200) {
          setProducts(await res?.data?.item?.data);
          setSplashLoading(false);
          setPageLoading(false);
        }
      })();
    }
  }, [router.query.category_slug]);

  useEffect(() => {
    if (router.query.category_slug) {
      if (categories?.length > 0) {
        setCategory(
          categories.filter((cat) => {
            return cat.category_slug == router.query.category_slug;
          })[0]
        );
      }
    }
  }, [categories, router.query.category_slug]);

  return ( 
    <DefaultLayout {...props}>
      <Head>
        <title>{category?.name}</title>
        <meta name="description" content={category?.description} />
      </Head>
      <div className={styles.main}>
      <CategoryHeader category={category} />
        <div className={styles.productsContainer}>
          <div className={styles.products}>
            {products.length > 0 ? <ProductsGrid category_slug={router.query.category_slug} data={products} />:
            <div className={styles.noProducts}>
                {staticContent?.category?.[2]}
            </div>
            }
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Category;
