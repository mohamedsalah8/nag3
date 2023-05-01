import styles from "@/styles/Header.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

const Header = ({
  headerContent,
  categories,
  setOpenSearch,
  setOpenCart,
  setOpenAccount,
  auth,
  removeCookie,
  cartCount,
}) => {
  const router = useRouter();
  const countRef = useRef();

  useEffect(() => {
    if (cartCount?.current?.style) {
      (() => {
        setTimeout(() => {
          countRef.current.style.scale = 1.25;
        }, 1000);
        setTimeout(() => {
          countRef.current.style.scale = 1;
        }, 1250);
        setTimeout(() => {
          countRef.current.style.scale = 1.25;
        }, 1500);
        setTimeout(() => {
          countRef.current.style.scale = 1;
        }, 1750);
      })();
    }
  }, [cartCount]);

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div onClick={() => setOpenSearch(true)} className={styles.start}>
          <img src="/img/search.svg" alt="search" />
        </div>
        <Link href="/" className={styles.center}>
          <img src="/img/logo.png" alt="logo" />
        </Link>
        <div className={styles.end}>
          {auth?.user ? (
            <Link
              href="/"
              onClick={() => removeCookie("auth")}
              className={styles.loginOrOut}
            >
              {headerContent?.logout}
            </Link>
          ) : (
            <Link href="/login" className={styles.loginOrOut}>
              {headerContent?.login}
            </Link>
          )}
          <div className={styles.icons}>
            <img
              onClick={() => {
                auth?.user ? setOpenAccount(true) : router.push("/login");
              }}
              className={styles.userIcon}
              src="/img/user.svg"
              alt="user"
            />
            <div
              onClick={() => setOpenCart(true)}
              className={styles.basketCountAndIcon}
            >
              {cartCount > 0 && <div ref={countRef}>({cartCount})</div>}
              <img src="/img/basket.svg" alt="basket" />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        {Array.isArray(categories) &&
          categories.map((category, index) => {
            return (
              <Link
                href={`/products/${category?.category_slug}`}
                key={index}
                className={styles.menuItem}
              >
                <div>
                  <img src={category?.image} />
                </div>
                <div>{category?.name}</div>
              </Link>
            );
          })}
      </div>
    </header>
  );
};

export default Header;
