import styles from "@/styles/Product.module.scss";
import CategoryHeader from "@/components/CategoryHeader";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import DefaultLayout from "@/components/DefaultLayout";
import ProductsGrid from "@/components/ProductsGrid";
import Head from "next/head";
const { product: productContent } = require("@/staticContent");
const { apiUrl } = require("@/helpers/config");

function Product(props) {
  const { setSplashLoading, setPageLoading, categories, setCart, cart, setCartChanged } = props;
  const [category, setCategory] = useState({});
  const [product, setProduct] = useState({});
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [price, setPrice] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (router.query.product_slug) {
      (async () => {
        const res = await axios.get(`${apiUrl}/product/details`, {
          params: {
            id: router.query.product_slug,
          },
        });
        if (res.status === 200) {
          setProduct(await res?.data?.item?.data);
          setSplashLoading(false);
          setPageLoading(false);
        }
      })();
    }
  }, [router.query.product_slug]);

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

  useEffect(() => {
    setSelectedSize(product?.sizes?.data?.[0]?.id);
  }, [product]);

  useEffect(() => {
    setPrice(
      product?.sizes?.data?.filter((size) => {
        return size?.id == selectedSize;
      })?.[0]?.price
    );
  }, [selectedSize]);
  

  const handleCount = (e) => {
    if (e.target.alt === "increase") {
      setCount((prev) => {
        return prev + 1;
      });
    } else if (e.target.alt === "decrease") {
      if (count > 1) {
        setCount((prev) => {
          return prev - 1;
        });
      }
    }
  };

  const handleAddToCart = async () => {
    const toAddProduct = await {
      product_id: product?.id,
      product_name: product?.name,
      qty: count,
      size_id: selectedSize,
      size_name: product?.sizes?.data?.find((size) => size.id === selectedSize)
        ?.name,
      price: Number(price),
      slug:product?.slug,
      image:product?.image
    };
    if (cart.length > 0) {
      const newCart = await cart.map((prod,index) => {
        if (
          prod.product_id == toAddProduct?.product_id &
          prod.size_id == toAddProduct?.size_id
        ) {
          return { ...prod, qty: prod.qty + toAddProduct.qty, key:index };
        } else {
          return prod;
        }
      });
      if ((JSON.stringify(await newCart)) !== (JSON.stringify(await cart))) {
        console.log(newCart);
        console.log(cart)
        setCart(await newCart);
        setCartChanged((prev) => {
          return prev + 1;
        });
      } else {
        console.log("second")
        setCart((prev) => {
          return [...prev, toAddProduct];
        });
        setCartChanged((prev) => {
          return prev + 1;
        });
      }
    } else {
      setCart([toAddProduct]);
      setCartChanged((prev) => {
        return prev + 1;
      });
    }
    setTimeout(() => {
      setCount(1);  
    }, 1000);
    
    window.scrollTo({top:0,behavior:"smooth"});
  };

  return (
    <DefaultLayout {...props}>
      <Head>
        <title>{product?.name}</title>
        <meta name="description" content={product?.description} />
      </Head>
      <div className={styles.main}>
        <CategoryHeader category={category} />
        <div className={styles.imageAndDetails}>
          <div className={styles.imageContainer}>
            <img src={product?.image} alt="productImage" />
          </div>
          <div className={styles.details}>
            <div className={styles.name}>{product?.name}</div>
            <div className={styles.tags}>
              {product?.status?.data?.map((tag,index) => {
                return (
                  <div key={index} className={styles.tag}>
                    <div className={styles.tagImageContainer}>
                      <img src={tag.image} alt="tagImage" />
                    </div>
                    <div className={styles.tagName}>{tag.name}</div>
                  </div>
                );
              })}
            </div>
            <div className={styles.sizeAndCount}>
              <div className={styles.size}>
                <div className={styles.sizeTitle}>{productContent?.[0]}</div>
                <select
                  onChange={(e) => setSelectedSize(Number(e.target.value))}
                >
                  {product?.sizes?.data?.map((size, index) => {
                    return (
                      <option
                        selected={index === 0}
                        key={index}
                        value={size?.id}
                      >
                        {size?.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className={styles.count}>
                <img
                  onClick={handleCount}
                  src="/img/decrease.svg"
                  alt="decrease"
                />
                <div className={styles.number}>{count}</div>
                <img
                  onClick={handleCount}
                  src="/img/increase.svg"
                  alt="increase"
                />
              </div>
            </div>
            <div className={styles.price}>{Number(price).toFixed(2)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}</div>
            <button onClick={handleAddToCart} className={styles.addtoCart}>
              {productContent?.[1]}
              <img
                className={styles.icon}
                src="/img/itemBasket.svg"
                alt="productCart"
              />
            </button>
            <div className={styles.descTitle}>{productContent?.[2]}</div>
            <div className={styles.desc}>{product?.description}</div>
          </div>
        </div>
        {product?.suggestedProducts?.data?.length > 0 && (
          <div className={styles.suggestedProducts}>
            <div className={styles.title}>{productContent[3]}</div>
            <ProductsGrid data={product?.suggestedProducts?.data} />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}

export default Product;
