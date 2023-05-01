import styles from "@/styles/Cart.module.scss";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import governorates from "@/helpers/governorates";
import cities from "@/helpers/cities";
import Link from "next/link";
import axios from "axios";
import { useSnackbar } from "notistack";
import useWindowSize from "@/hooks/useWindowSize";
import { mobileRegEx, nameRegEx, passwordRegEx } from "@/helpers/validations";
import LoadingOverlay from "./LoadingOverlay";
const { apiUrl } = require("@/helpers/config");

function Cart({
  cart,
  setCart,
  cartStatus,
  setCartStatus,
  cartContent,
  dir,
  openCart,
  setOpenCart,
  style,
  cartChanged,
  setCartChanged,
  cartCount,
  auth,
  addresses,
  setAddingNewAddress,
  handleRemoveAddress,
  setOpenAccount,
  setAddresses,
  setAddressEditId,
  setCookie,
}) {
  const [cartTotal, setCartTotal] = useState(0);
  const [newAddress, setNewAddress] = useState({ city_id: 0, district: 0 });
  const [user, setUser] = useState({});
  const [choosedAddress, setChoosedAddress] = useState({});
  const [paymentMehod, setPaymentMehod] = useState("cash");
  const [promoCode, setPromoCode] = useState();
  const [registering, setRegistering] = useState(false);
  const promoCodeRef = useRef();
  const { width } = useWindowSize();
  const { enqueueSnackbar } = useSnackbar();
  const schema = yup
    .object({
      name: yup.string().matches(nameRegEx).required(),
      email: yup.string().email().required(),
      mobile: yup.string().matches(mobileRegEx).required(),
      password: yup.string().matches(passwordRegEx).required(),
      city_id: yup
        .string()
        .matches(/^(?!0$).*$/)
        .required(),
      district: yup.string().required(),
      address: yup.string().required(),
      building_number: yup.string().required(),
      floor_number: yup.string().required(),
    })
    .required();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    const settingTotal = async () => {
      let total = 0;
      for (let i = 0; i < cart?.length; i++) {
        const itemTotal = (await cart[i].price) * cart[i].qty;
        total += itemTotal;
      }
      setCartTotal(total);
    };
    settingTotal();
  }, [cart, cartChanged]);

  useEffect(() => {
    (async () => {
      if (addresses.length > 0) {
        const defaultAddress = await addresses.filter((address) => {
          return address.default_status == "1";
        })?.[0];
        setChoosedAddress(await defaultAddress);
        if (await !defaultAddress?.address) {
          setChoosedAddress(addresses[0])
        }
      }
    })();
  }, [addresses]);
  useEffect(() => {
    for (let index = 0; index < Object.values(errors).length; index++) {
      enqueueSnackbar(
        cartContent?.errorMessages?.[
          `${Object.values(errors)[index].ref.name}`
        ],
        { variant: "warning" }
      );
    }
  }, [errors]);
  const handleBackBtn = () => {
    if (cartStatus === 1) {
      setOpenCart(false);
    } else {
      setCartStatus((prev) => prev - 1);
    }
  };

  const handleDeleteItem = (index) => {
    setCart((prev) => {
      return prev.filter((item, i) => {
        if (index != i) {
          return item;
        }
      });
    });
    setCartChanged((prev) => {
      return prev + 1;
    });
  };
  const handleNewAddressInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleInfoInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePromoCodeApply = async () => {
    try {
      const res = await axios.post(
        `${apiUrl}/orders/promoCode`,
        { promo_code: promoCodeRef?.current?.value, price: cartTotal },
        {
          headers: {
            Authorization: `bearer ${auth?.token}`,
          },
        }
      );
      if (res.status === 200) {
        setPromoCode(res?.data);
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  const handleStep2Submit = async (e) => {
    try {
      setRegistering(true);
      const res = await axios.post(`${apiUrl}/auth/register`, {
        name: user?.name,
        email: user?.email,
        mobile: user?.mobile,
        password: user?.password,
      });
      if (res.status === 200) {
        let expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        setCookie("auth", await res?.data?.item?.data, {
          expires: expiryDate,
        });
        try {
          const res3 = await axios.post(
            `${apiUrl}/profile/address/store`,
            {
              city_id: Number(newAddress?.city_id),
              building_number: newAddress?.building_number,
              floor_number: newAddress?.floor_number,
              address: newAddress?.address,
              district: newAddress?.district,
            },
            {
              headers: {
                Authorization: `bearer ${await res?.data?.item?.data?.token}`,
              },
            }
          );
          if (res3.status === (await 200)) {
            await (async () => {
              try {
                const res2 = await axios.get(`${apiUrl}/profile/address`, {
                  headers: {
                    Authorization: `bearer ${await res?.data?.item?.data
                      ?.token}`,
                  },
                });
                if (res2.status === (await 200)) {
                  setAddresses(await res2?.data?.item?.data);
                  setChoosedAddress(await res2?.data?.item?.data?.[0]);
                  if ((await auth?.token) && (await addresses) > 0) {
                    setCartStatus(3);
                  }
                }
              } catch (error) {
                enqueueSnackbar(error?.response?.data?.message, {
                  variant: "error",
                });
              }
            })();
          }
        } catch (error) {
          enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
        }
      } else {
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    } finally {
      setRegistering(false);
    }
  };

  const handleStep3Submit = async () => {
    const totalPriceAfter = () => {
      if (promoCode?.success) {
        return (
          cartTotal -
          (promoCode?.item?.type === "percentage"
            ? Number((promoCode?.item?.value * cartTotal) / 100)
            : promoCode?.item?.type === "value" &&
              Number(promoCode?.item?.value)) +
          Number(choosedAddress.delivery_fee)
        );
      } else {
        return cartTotal + Number(choosedAddress.delivery_fee);
      }
    };
    const total_price_after = totalPriceAfter();
    try {
      const res = await axios.post(
        `${apiUrl}/orders/store`,
        {
          payment_method: paymentMehod,
          address_id: choosedAddress?.id,
          total_price: cartTotal,
          delivery_fee: choosedAddress.delivery_fee,
          promo_code_id: promoCode?.item?.id,
          total_price_after,
          orderDetails: cart,
        },
        {
          headers: {
            Authorization: `bearer ${auth?.token}`,
          },
        }
      );
      if (res.status === 200) {
        enqueueSnackbar(cartContent?.orderPlaced, { variant: "success" });
        setOpenCart(false);
        setCart([]);
        setCartStatus(1);
        setOpenCart(false);
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  return (
    <>
      {cartChanged >= 0 && (
        <div
          dir={dir}
          style={
            openCart
              ? { ...style, visibility: "visible", left: "0" }
              : { ...style, visibility: "hidden", left: "1920px" }
          }
          className={styles.cart}
        >
          <div
            className={styles.header}
            style={
              cartStatus !== 1
                ? {
                    background:
                      "linear-gradient(90deg, rgba(255,246,229,1) 0%, rgba(255,246,229,1) 50%, rgba(254,250,240,1) 50%, rgba(254,250,240,1) 100%)",
                  }
                : {}
            }
          >
            <div className={styles.start}>
              <button onClick={handleBackBtn} className={styles.back}>
                <img src="/img/back.svg" alt="back" />
              </button>
              <div className={styles.title}>{cartContent?.title}</div>
            </div>
            <div
              className={styles.center}
              style={cartStatus === 1 ? { opacity: "0" } : { opacity: "1" }}
            >
              <img src="/img/logo.png" alt="logo" />
            </div>
            <div
              style={
                cartStatus === 1
                  ? { width: width > 820 ? "540px" : "370px" }
                  : { width: width > 820 ? "650px" : "370px" }
              }
              className={styles.end}
            >
              <div
                className={styles.line}
                style={{
                  background:
                    cartStatus === 1
                      ? "#c9c9c9"
                      : cartStatus === 2
                      ? "linear-gradient(90deg, rgba(201,201,201,1) 0%, rgba(201,201,201,1) 50%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)"
                      : "black",
                }}
              />
              <div className={styles.status}>
                <div className={styles.passedNumber}>1</div>
                <div className={styles.text}>{cartContent?.status1} </div>
              </div>
              <div className={styles.status}>
                <div
                  className={
                    cartStatus > 1 ? styles.passedNumber : styles.number
                  }
                >
                  2
                </div>
                <div className={styles.text}>{cartContent?.status2}</div>
              </div>
              <div className={styles.status}>
                <div
                  className={
                    cartStatus > 2 ? styles.passedNumber : styles.number
                  }
                >
                  3
                </div>
                <div className={styles.text}>{cartContent?.status3} </div>
              </div>
            </div>
          </div>
          {cartStatus === 1 && (
            <>
              {cart?.length === 0 ? (
                <div className={styles.noItems}>
                  <img src="/img/emptyCart.svg" alt="emptyCart" />
                  {cartContent?.emptyCart}
                </div>
              ) : (
                <div className={styles.items}>
                  <div className={styles.removeAllContainer}>
                    <button
                      onClick={() => {
                        setCart([]);
                        setCartChanged((prev) => {
                          return prev + 1;
                        });
                      }}
                    >
                      {cartContent?.deleteAll}
                      <img src="/img/delete.svg" alt="delete" />
                    </button>{" "}
                  </div>
                  <div className={styles.divider} />
                  {cart?.map((item, index) => {
                    return (
                      <>
                        <div key={index} className={styles.item}>
                          <div className={styles.imageAndDetails}>
                            <div className={styles.imageContainer}>
                              <img src={item?.image} alt="productImage" />
                            </div>
                            <div className={styles.details}>
                              <div className={styles.name}>
                                {item?.product_name}
                              </div>
                              <div className={styles.size}>
                                {item?.size_name}
                              </div>

                              <div className={styles.price}>
                                {item?.price
                                  .toFixed(2)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                              </div>
                              <div className={styles.count}>
                                <img
                                  onClick={async () => {
                                    if ((await cart[index].qty) > 1) {
                                      let newCart = await cart;
                                      newCart[index].qty -= 1;
                                      setCart(await newCart);
                                      setCartChanged((prev) => {
                                        return prev + 1;
                                      });
                                    }
                                  }}
                                  src="/img/decrease.svg"
                                  alt="decrease"
                                />
                                <div className={styles.number}>{item?.qty}</div>
                                <img
                                  onClick={async () => {
                                    let newCart = await cart;
                                    newCart[index].qty += 1;
                                    setCart(await newCart);
                                    setCartChanged((prev) => {
                                      return prev + 1;
                                    });
                                  }}
                                  src="/img/increase.svg"
                                  alt="increase"
                                />
                              </div>
                            </div>
                          </div>
                          <div className={styles.removeContainer}>
                            <button onClick={() => handleDeleteItem(index)}>
                              {cartContent?.delete}
                              <img src="/img/delete.svg" alt="delete" />
                            </button>
                          </div>
                        </div>
                        <div className={styles.divider} />
                      </>
                    );
                  })}
                </div>
              )}
              <div className={styles.footer}>
                <div className={styles.start}>
                  <div className={styles.title}>
                    {cartChanged >= 0 && cartContent?.total}
                  </div>
                  <div className={styles.number}>
                    {cartTotal
                      .toFixed(2)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                  </div>
                </div>
                <div className={styles.end}>
                  {cart.length === 0 ? (
                    <button
                      onClick={() => setOpenCart(false)}
                      className={styles.startShopping}
                    >
                      {cartContent?.startShopping}
                    </button>
                  ) : (
                    <div className={styles.payContainer}>
                      <button
                        onClick={() => setCartStatus(2)}
                        className={styles.pay}
                      >
                        {cartContent?.pay}
                      </button>
                      <div className={styles.belowPay}>
                        {cartContent?.belowPay}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {cartStatus > 1 && (
            <>
              <div className={styles.step2AndStep3}>
                <div className={styles.start}>
                  <div className={styles.countAndTotal}>
                    <div className={styles.count}>{cartCount}</div>
                    <div className={styles.total}>
                      {cartTotal
                        .toFixed(2)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                    </div>
                  </div>
                  <div className={styles.promoCode}>
                    <label>{cartContent?.haveAPromoCode}</label>
                    <input
                      disabled={promoCode?.success}
                      ref={promoCodeRef}
                      style={
                        promoCode?.success
                          ? { backgroundColor: "#E8E8E8", border: "none" }
                          : {}
                      }
                      placeholder={cartContent?.promoCode}
                    />
                    <img src="/img/promoCode.svg" alt="promoCode" />
                    <button
                      onClick={() => {
                        if (promoCode?.success) {
                          setPromoCode({});
                          promoCodeRef.current.value = "";
                        } else {
                          handlePromoCodeApply();
                        }
                      }}
                      style={
                        promoCode?.success ? { backgroundColor: "#E43F4A" } : {}
                      }
                    >
                      {promoCode?.success
                        ? cartContent?.cancel
                        : cartContent?.apply}
                    </button>
                  </div>
                  <div className={styles.amount}>
                    <div className={styles.title}>{cartContent?.amount}</div>
                    <div className={styles.total}>
                      {cartTotal
                        .toFixed(2)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                    </div>
                  </div>

                  {promoCode?.success && (
                    <div className={styles.discount}>
                      <div className={styles.title}>
                        {cartContent?.discount}
                      </div>
                      <div className={styles.total}>
                        {(promoCode?.item?.type === "percentage"
                          ? Number((promoCode?.item?.value * cartTotal) / 100)
                          : promoCode?.item?.type === "value" &&
                            Number(promoCode?.item?.value - cartTotal)
                        )
                          .toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                      </div>
                    </div>
                  )}
                  {cartStatus === 2 && (
                    <div className={styles.shippingWillBeAdded}>
                      {cartContent?.shippingWillBeAdded}
                    </div>
                  )}
                  {cartStatus === 3 && (
                    <div className={styles.deliveryFees}>
                      <div className={styles.title}>
                        {cartContent?.deliveryFees}
                      </div>
                      <div className={styles.total}>
                        {Number(choosedAddress?.delivery_fee)
                          .toFixed(2)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                      </div>
                    </div>
                  )}
                  <div className={styles.totalAmount}>
                    <div className={styles.title}>
                      {cartContent?.totalAmount}
                    </div>
                    <div className={styles.total}>
                      {cartStatus === 2
                        ? promoCode?.success
                          ? (
                              cartTotal -
                              (promoCode?.item?.type === "percentage"
                                ? Number(
                                    (promoCode?.item?.value * cartTotal) / 100
                                  )
                                : promoCode?.item?.type === "value" &&
                                  Number(promoCode?.item?.value))
                            )
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")
                          : cartTotal
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")
                        : promoCode?.success
                        ? (
                            cartTotal -
                            (promoCode?.item?.type === "percentage"
                              ? Number(
                                  (promoCode?.item?.value * cartTotal) / 100
                                )
                              : promoCode?.item?.type === "value" &&
                                Number(promoCode?.item?.value - cartTotal)) +
                            Number(choosedAddress?.delivery_fee)
                          )
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")
                        : (cartTotal + Number(choosedAddress?.delivery_fee))
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, "٬")}
                    </div>
                  </div>
                </div>
                {cartStatus === 2 && (
                  <div className={styles.end}>
                    {auth?.user ? (
                      <div className={styles.chooseAddress}>
                        <button
                          onClick={() => {
                            setAddingNewAddress(true);
                            setAddressEditId("new");
                            setOpenAccount(true);
                            setOpenCart(false);
                          }}
                        >
                          {cartContent.personalInfo[3]}{" "}
                          <img src="/img/plus.svg" alt="plus" />
                        </button>
                        {addresses
                          .sort((a, b) => {
                            return b?.default_status - a?.default_status;
                          })
                          .map((address, index) => {
                            return (
                              <div key={index} className={styles.address}>
                                <div className={styles.name}>
                                  {auth?.user.name}
                                </div>
                                <div className={styles.mobile}>
                                  {auth?.user.mobile}
                                </div>
                                <div className={styles.email}>
                                  {auth?.user.email}
                                </div>
                                <div className={styles.addressDetails}>
                                  {`${
                                    governorates.filter((gov) => {
                                      return gov?.id == address?.city_id;
                                    })[0]?.ar
                                  }, ${
                                    cities.filter((district) => {
                                      return district?.id == address?.district;
                                    })[0]?.ar
                                  }, ${address?.address}, ${
                                    cartContent.addresses[0]
                                  } ${address?.building_number}, ${
                                    cartContent.addresses[1]
                                  } ${address?.floor_number}`}
                                </div>
                                <div className={styles.footer}>
                                  <div className={styles.start}>
                                    <img
                                      onClick={() => setChoosedAddress(address)}
                                      src={
                                        address?.id == choosedAddress?.id
                                          ? `/img/radioOn.svg`
                                          : `/img/radioOff.svg`
                                      }
                                      name="choosedAddress"
                                      alt="choosedAddress"
                                    />
                                    {cartContent.addresses[2]}
                                  </div>
                                  <div className={styles.end}>
                                    <button
                                      onClick={(e) =>
                                        handleRemoveAddress(address?.id)
                                      }
                                      className={styles.remove}
                                    >
                                      {cartContent.addresses[3]}
                                      <img src="/img/remove.svg" alt="remove" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setAddressEditId(address?.id);
                                        setAddingNewAddress(true);
                                        setOpenAccount(true);
                                        setOpenCart(false);
                                      }}
                                      className={styles.edit}
                                    >
                                      <img src="/img/edit.svg" alt="edit" />
                                      {cartContent.addresses[4]}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        <div className={styles.continueShoppingAndPay}>
                          <button
                            onClick={() => {
                              setOpenCart(false);
                              setCartStatus(1);
                            }}
                            className={styles.continueShopping}
                          >
                            {cartContent?.personalInfo[2]}
                          </button>
                          <div className={styles.payContainer}>
                            <button
                              className={styles.pay}
                              onClick={() => {
                                if (choosedAddress?.address) {
                                  setCartStatus(3);
                                } else {
                                  enq
                                }
                              }}
                            >
                              {cartContent?.pay}
                            </button>
                            <div className={styles.belowPay}>
                              {cartContent?.belowPay}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form
                        className={styles.register}
                        onSubmit={handleSubmit(handleStep2Submit)}
                      >
                        <div className={styles.info}>
                          <div className={styles.sectionTitleAndLoginLink}>
                            <div className={styles.sectionTitle}>
                              {cartContent?.status2}
                            </div>
                            <div className={styles.loginLink}>
                              {cartContent?.personalInfo[0]}{" "}
                              <Link href="/login">
                                {cartContent?.personalInfo[1]}
                              </Link>
                            </div>
                          </div>
                          <div className={styles.infoInputs}>
                            <div className={styles.inputAndLabel}>
                              <label>{cartContent.personalInfo[12]}</label>
                              <input
                                value={user?.name}
                                name="name"
                                {...register("name")}
                                onChange={handleInfoInputChange}
                              />
                            </div>
                            <div className={styles.inputAndLabel}>
                              <label>{cartContent.personalInfo[14]}</label>
                              <input
                                value={user?.email}
                                name="email"
                                {...register("email")}
                                onChange={handleInfoInputChange}
                              />
                            </div>
                            <div className={styles.inputAndLabel}>
                              <label>{cartContent.personalInfo[13]}</label>
                              <input
                                value={user?.mobile}
                                name="mobile"
                                {...register("mobile")}
                                onChange={handleInfoInputChange}
                              />
                            </div>
                            <div className={styles.inputAndLabel}>
                              <label>{cartContent.personalInfo[15]}</label>
                              <input
                                value={user?.password}
                                autoComplete="new-password"
                                name="password"
                                type="password"
                                {...register("password")}
                                onChange={handleInfoInputChange}
                              />
                              <img
                                onClick={(e) => {
                                  if (
                                    e.target.parentElement.children[1].type ===
                                    "password"
                                  ) {
                                    e.target.parentElement.children[1].type =
                                      "text";
                                    e.target.src = "/img/eye.svg";
                                  } else {
                                    e.target.parentElement.children[1].type =
                                      "password";
                                    e.target.src = "/img/eyeSlash.svg";
                                  }
                                }}
                                src="/img/eyeSlash.svg"
                                alt="eyeSlash"
                              />
                            </div>
                          </div>
                        </div>
                        <div className={styles.sectionTitle}>
                          {cartContent?.personalInfo[4]}
                        </div>
                        <div className={styles.newAddress}>
                          <div
                            className={
                              styles.selectAndLabel + " " + styles.inputAndLabel
                            }
                          >
                            <label>{cartContent?.personalInfo[5]}</label>
                            <select
                              value={newAddress?.city_id}
                              id="city_id"
                              name="city_id"
                              {...register("city_id")}
                              onChange={handleNewAddressInputChange}
                            >
                              {governorates.map((city_id) => {
                                return (
                                  <option key={city_id.en} value={city_id.id}>
                                    {city_id.ar}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div
                            className={
                              styles.selectAndLabel + " " + styles.inputAndLabel
                            }
                          >
                            <label>{cartContent?.personalInfo[6]}</label>
                            <select
                              value={newAddress?.district}
                              id="district"
                              name="district"
                              {...register("district")}
                              onChange={handleNewAddressInputChange}
                            >
                              {cities
                                .filter((city) => {
                                  return (
                                    city?.governorate_id == newAddress?.city_id
                                  );
                                })
                                .map((district) => {
                                  return (
                                    <option
                                      key={district.en}
                                      value={district.id}
                                    >
                                      {district.ar}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>
                          <div className={styles.inputAndLabel}>
                            <label>{cartContent?.personalInfo[7]}</label>
                            <input
                              value={newAddress?.address}
                              name="address"
                              {...register("address")}
                              onChange={handleNewAddressInputChange}
                            />
                          </div>
                          <div className={styles.buildingAndFloor}>
                            <div className={styles.building_number}>
                              <div className={styles.inputAndLabel}>
                                <label>{cartContent?.personalInfo[8]}</label>
                                <input
                                  value={newAddress?.building_number}
                                  name="building_number"
                                  {...register("building_number")}
                                  onChange={handleNewAddressInputChange}
                                />
                              </div>
                            </div>
                            <div className={styles.floor_number}>
                              <div className={styles.inputAndLabel}>
                                <label>{cartContent?.personalInfo[9]}</label>
                                <input
                                  value={newAddress?.floor_number}
                                  name="floor_number"
                                  {...register("floor_number")}
                                  onChange={handleNewAddressInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.continueShoppingAndPay}>
                          <button
                            onClick={() => {
                              setOpenCart(false);
                              setCartStatus(1);
                            }}
                            className={styles.continueShopping}
                          >
                            {cartContent?.personalInfo[2]}
                          </button>
                          <div className={styles.payContainer}>
                            <button className={styles.pay} type="submit">
                              {cartContent?.pay}
                            </button>
                            <div className={styles.belowPay}>
                              {cartContent?.belowPay}
                            </div>
                          </div>
                        </div>
                        {registering && <LoadingOverlay />}
                      </form>
                    )}
                  </div>
                )}
                {cartStatus === 3 && (
                  <div className={styles.end}>
                    <div className={styles.paymentMethods}>
                      <div className={styles.title}>
                        {cartContent?.payment?.[0]}
                      </div>
                      <div className={styles.options}>
                        <div
                          onClick={() => setPaymentMehod("card")}
                          className={styles.option}
                          style={{
                            background:
                              paymentMehod === "card" ? "black" : "none",
                          }}
                        >
                          <div className={styles.optionStart}>
                            <img
                              src={
                                paymentMehod === "card"
                                  ? "/img/circleChecked.svg"
                                  : "/img/circle.svg"
                              }
                              alt=""
                            />
                            <label
                              style={{
                                color:
                                  paymentMehod === "card" ? "white" : "black",
                              }}
                            >
                              {" "}
                              {cartContent?.payment?.[1]}
                            </label>
                          </div>
                          <div className={styles.optionEnd}>
                            <img
                              src={
                                paymentMehod === `card`
                                  ? `/img/paymobWhite.png`
                                  : `/img/paymob.png`
                              }
                              alt="paymob"
                            />
                          </div>
                        </div>
                        <div
                          onClick={() => setPaymentMehod("cash")}
                          className={styles.option}
                          style={{
                            background:
                              paymentMehod === "cash" ? "black" : "none",
                          }}
                        >
                          <div className={styles.optionStart}>
                            <img
                              src={
                                paymentMehod === "cash"
                                  ? "/img/circleChecked.svg"
                                  : "/img/circle.svg"
                              }
                              alt=""
                            />
                            <label
                              style={{
                                color:
                                  paymentMehod === "cash" ? "white" : "black",
                              }}
                            >
                              {" "}
                              {cartContent?.payment?.[2]}
                            </label>
                          </div>
                          <div className={styles.optionEnd}>
                            <img
                              src={
                                paymentMehod === "cash"
                                  ? "/img/codWhite.png"
                                  : "/img/cod.png"
                              }
                              alt="cod"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.personalInfo}>
                      <div className={styles.title}>
                        {cartContent?.payment?.[4]}
                      </div>
                      <div className={styles.address}>
                        <div className={styles.name}>{auth?.user.name}</div>
                        <div className={styles.mobile}>{auth?.user.mobile}</div>
                        <div className={styles.email}>{auth?.user.email}</div>
                        <div className={styles.addressDetails}>
                          {`${
                            governorates.filter((gov) => {
                              return gov?.id == choosedAddress?.city_id;
                            })[0]?.ar
                          }, ${
                            cities.filter((district) => {
                              return district?.id == choosedAddress?.district;
                            })[0]?.ar
                          }, ${choosedAddress?.address}, ${
                            cartContent.addresses[0]
                          } ${choosedAddress?.building_number}, ${
                            cartContent.addresses[1]
                          } ${choosedAddress?.floor_number}`}
                        </div>
                      </div>
                    </div>
                    <div
                      className={styles.continueShoppingAndPay}
                      style={{ alignItems: "flex-end" }}
                    >
                      <button
                        onClick={() => {
                          setOpenCart(false);
                          setCartStatus(1);
                        }}
                        className={styles.continueShopping}
                      >
                        {cartContent?.payment[6]}
                      </button>
                      <div className={styles.payContainer}>
                        <div className={styles.belowPay}>
                          {cartContent?.payment[5]}
                        </div>
                        <button
                          onClick={handleStep3Submit}
                          className={styles.pay}
                        >
                          {cartContent?.payment[7]}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Cart;
