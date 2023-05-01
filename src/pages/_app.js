import { useEffect, useState } from "react";
import "@/styles/globals.scss";
import staticContent from "@/staticContent";
import Splash from "@/components/Splash";
import useWindowSize from "@/hooks/useWindowSize";
import axios from "axios";
import Cart from "@/components/Cart";
import { useCookies } from "react-cookie";
import { SnackbarProvider } from "notistack";
import Account from "@/components/Account";
import Search from "@/components/Search";
import { useRouter } from "next/router";
import Head from "next/head";
const { apiUrl } = require("@/helpers/config");

export default function App({ Component, pageProps }) {
  const [auth, setAuth] = useState({});
  const [cart, setCart] = useState([]);
  const [cartChanged, setCartChanged] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [splashLoading, setSplashLoading] = useState(true);
  const [openCart, setOpenCart] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [cartStatus, setCartStatus] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [addressEditId, setAddressEditId] = useState("new");
  const { width, height } = useWindowSize();
  const [cookies, setCookie, removeCookie] = useCookies(["auth", { cart: [] }]);
  const router = useRouter();

  useEffect(() => {
    const settingCount = async () => {
      let count = 0;
      for (let i = 0; i < cart.length; i++) {
        count += await cart[i].qty;
      }
      setCartCount(count);
    };
    settingCount();
  }, [cart, cartChanged]);

  useEffect(() => {
    (async () => {
      const res = await axios.get(`${apiUrl}/categories`);
      if (res.status === 200) {
        setCategories(await res?.data?.item?.data);
      }

      const getLatestPrices = async () => {
        for (let index = 0; index < cookies.cart.length; index++) {
          axios
            .get(`${apiUrl}/product/details`, {
              params: {
                id: cookies.cart?.[index].slug,
              },
            })
            .then((res) => {
              if (res.status === 200) {
                (async () => {
                  let newCart = cookies.cart;
                  newCart[index].price = Number(
                    await res.data?.item?.data?.sizes?.data?.filter((size) => {
                      return size?.id == cookies.cart[index]?.size_id;
                    })[0]?.price
                  );
                  setCart(newCart);
                })();
              }
            });
        }
      };
      if ((await cookies.cart?.length) > 0) {
        getLatestPrices();
      }
    })();
  }, []);

  useEffect(() => {
    setAuth(cookies?.auth);
  }, [cookies?.auth]);

  useEffect(() => {
    let expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    setCookie("cart", cart, { expires: expiryDate });
  }, [cart, cartChanged]);

  useEffect(() => {
    if (!splashLoading) {
      setPageLoading(false);
      const splash = document.getElementById("splash");
      const splashKo = document.getElementById("splashKo");
      const splashLogo = document.getElementById("splashLogo");
      setTimeout(() => {
        splashLogo.style.top = "50%";
        splashKo.style.top = "50%";
        splashKo.style.opacity = 0;
        splash.style.top = "-100%";
        setTimeout(() => {
          splash.style.display = "none";
          document.body.style.overflowY = "unset";
        }, 1500);
      }, 1000);
    } else {
      document.body.style.overflowY = "hidden";
    }
  }, [splashLoading]);

  useEffect(() => {
    setPageLoading(true);
    setOpenAccount(false);
    setOpenCart(false);
    setOpenSearch(false);
  }, [router.asPath]);

  useEffect(() => {
    if (openAccount || openCart || openSearch)
      document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "unset";
    };
  }, [openAccount, openCart, openSearch]);

  const handleRemoveAddress = async (id) => {
    try {
      const res = await axios.post(
        `${apiUrl}/profile/address/delete`,
        {
          id,
        },
        {
          headers: {
            Authorization: `bearer ${auth?.token}`,
          },
        }
      );
      if (res.status === 200) {
        await (async () => {
          try {
            const res2 = await axios.get(`${apiUrl}/profile/address`, {
              headers: {
                Authorization: `bearer ${auth?.token}`,
              },
            });
            if (res2.status === 200) {
              setAddresses(await res2?.data?.item?.data);
            }
          } catch (error) {
            console.log(error?.response?.data?.message);
          }
        })();
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  return (
    <SnackbarProvider maxSnack={5} dir="rtl">
      <div
        style={{
          scale:
            width > 820 ? (width / 1920).toString() : (width / 410).toString(),
        }}
        dir="rtl"
        className="appContainer"
      >
        <Head>
          <title>{staticContent?.home?.head?.title}</title>
        </Head> 
        <Component
          {...pageProps}
          cookies={cookies}
          setSplashLoading={setSplashLoading}
          cart={cart}
          setCart={setCart}
          cartStatus={cartStatus}
          setCartStatus={setCartStatus}
          openCart={openCart}
          setOpenCart={setOpenCart}
          openAccount={openAccount}
          setOpenAccount={setOpenAccount}
          categories={categories}
          staticContent={staticContent}
          auth={auth}
          setAuth={setAuth}
          setCookie={setCookie}
          removeCookie={removeCookie}
          openSearch={openSearch}
          setOpenSearch={setOpenSearch}
          pageLoading={pageLoading}
          setPageLoading={setPageLoading}
          cartChanged={cartChanged}
          setCartChanged={setCartChanged}
          cartCount={cartCount}
        />
      </div>
      <Account
        dir="rtl"
        style={{
          scale:
            width > 820 ? (width / 1920).toString() : (width / 410).toString(),
          minHeight:
            width > 820
              ? `${(height / (width / 1920)).toString()}px`
              : `${(height / (width / 410)).toString()}px`,
        }}
        staticContent={staticContent}
        openAccount={openAccount}
        setOpenAccount={setOpenAccount}
        accountContent={staticContent.account}
        setOpenCart={setOpenCart}
        auth={auth}
        cookies={cookies}
        setCookie={setCookie}
        removeCookie={removeCookie}
        addresses={addresses}
        setAddresses={setAddresses}
        addingNewAddress={addingNewAddress}
        setAddingNewAddress={setAddingNewAddress}
        handleRemoveAddress={handleRemoveAddress}
        addressEditId={addressEditId}
        setAddressEditId={setAddressEditId}
      />
      <Cart
        dir="rtl"
        style={{
          scale:
            width > 820 ? (width / 1920).toString() : (width / 410).toString(),
          minHeight:
            width > 820
              ? `${(height / (width / 1920)).toString()}px`
              : `${(height / (width / 410)).toString()}px`,
        }}
        auth={auth}
        staticContent={staticContent}
        cart={cart}
        setCart={setCart}
        cartStatus={cartStatus}
        setCartStatus={setCartStatus}
        openCart={openCart}
        setOpenCart={setOpenCart}
        cartContent={staticContent.cart}
        cartChanged={cartChanged}
        setCartChanged={setCartChanged}
        cartCount={cartCount}
        addresses={addresses}
        setAddresses={setAddresses}
        addingNewAddress={addingNewAddress}
        setAddingNewAddress={setAddingNewAddress}
        handleRemoveAddress={handleRemoveAddress}
        setOpenAccount={setOpenAccount}
        addressEditId={addressEditId}
        setAddressEditId={setAddressEditId}
        setCookie={setCookie}

      />
      <Search
        dir="rtl"
        style={{
          scale:
            width > 820 ? (width / 1920).toString() : (width / 410).toString(),
          minHeight:
            width > 820
              ? `${(height / (width / 1920)).toString()}px`
              : `${(height / (width / 410)).toString()}px`,
        }}
        staticContent={staticContent}
        cart={cart}
        setCart={setCart}
        setOpenSearch={setOpenSearch}
        openSearch={openSearch}
        cartStatus={cartStatus}
        searchContent={staticContent?.search}
      />
      <Splash />
    </SnackbarProvider>
  );
}
