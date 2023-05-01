
import Footer from "./Footer";
import Header from "./Header";
import PageLoading from "./PageLoading";

function DefaultLayout({ children,pageLoading,staticContent ,...props }) {
  return (
    <>
      <Header
        setOpenCart={props.setOpenCart}
        setOpenAccount={props.setOpenAccount}
        categories={props.categories}
        headerContent={staticContent?.header}
        auth={props.auth}
        removeCookie={props.removeCookie}
        setOpenSearch={props.setOpenSearch}
        setCartChanged={props.setCartChanged}
        cartCount={props.cartCount}
      />
      { pageLoading ? <PageLoading /> : children}
      <Footer footerContnet={staticContent?.footer} />
    </>
  );
}

export default DefaultLayout;
