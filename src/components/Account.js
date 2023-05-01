import styles from "@/styles/Account.module.scss";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import governorates from "@/helpers/governorates";
import cities from "@/helpers/cities";
import axios from "axios";
import { useSnackbar } from "notistack";
const { apiUrl } = require("@/helpers/config");

const Account = ({
  style,
  dir,
  openAccount,
  setOpenAccount,
  setOpenCart,
  accountContent,
  cartCount,
  auth,
  cookies,
  setCookie,
  removeCookie,
  addresses,
  setAddresses,
  addingNewAddress,
  setAddingNewAddress,
  handleRemoveAddress,
  addressEditId,
  setAddressEditId
}) => {
  const [selectedTab, setSelectedTab] = useState(1);
  const [user, setUser] = useState({});
  const [newAddress, setNewAddress] = useState({ city_id: 0, district: 0,default_status:"" });
  const oldPasswordRef = useRef();
  const newPassword1Ref = useRef();
  const newPassword2Ref = useRef();
  const districtRef = useRef();

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (auth?.user) {
      setUser(auth?.user);
      (async () => {
        try {
          const res = await axios.get(`${apiUrl}/profile/address`, {
            headers: {
              Authorization: `bearer ${auth?.token}`,
            },
          });
          if (res.status === 200) {
            setAddresses(await res?.data?.item?.data);
          }
        } catch (error) {
          enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
        }
      })();
    }
  }, [auth?.user]);

  useEffect(() => {
    if (addressEditId === "new") {
      setNewAddress({ city_id: 0, district: 0,default_status:"" });
    } else {
      setNewAddress(
        addresses.filter((address) => {
          return address.id == addressEditId;
        })[0]
      );
    }
  }, [addressEditId]);

  useEffect(() => {
    if (addingNewAddress){
      setSelectedTab(2)
    }
  }, [addingNewAddress]);

  useEffect(() => {
    if (districtRef?.current?.value) {
      districtRef.current.value = 0;
    }
  }, [newAddress.city_id]);

  const handleTab1InputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const hanldeTab1Save = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/profile/update`, user, {
        headers: {
          Authorization: `bearer ${auth?.token}`,
        },
      });
      if (res.status === 200) {
        setCookie("auth", { ...cookies?.auth, user: res?.data?.item?.data });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  

  const handleNewAddressInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const hanldeNewAddressSave = async (e) => {
    e.preventDefault();
    if (addressEditId === "new") {
      try {
        const res = await axios.post(
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
                setAddingNewAddress(false);
              }
            } catch (error) {
              enqueueSnackbar(error?.response?.data?.message, {
                variant: "error",
              });
              setAddingNewAddress(false);
            }
          })();
        }
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
      }
    } else {
      try {
        const res = await axios.post(
          `${apiUrl}/profile/address/update`,
          {
            id: addressEditId,
            city_id: newAddress?.city_id,
            building_number: newAddress?.building_number,
            floor_number: newAddress?.floor_number,
            address: newAddress?.address,
            district: newAddress?.district,
            default_status : newAddress.default_status
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
                setAddingNewAddress(false);
              }
            } catch (error) {
              enqueueSnackbar(error?.response?.data?.message, {
                variant: "error",
              });
              setAddingNewAddress(false);
            }
          })();
        }
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
      }
    }
  };

  const handleSetDefaultAddress = async (address) => {
    try {
      const res = await axios.post(
        `${apiUrl}/profile/address/update`,
        {
          ...address
          ,
          default_status:"1"
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
              setAddingNewAddress(false);
            }
          } catch (error) {
            enqueueSnackbar(error?.response?.data?.message, {
              variant: "error",
            });
            setAddingNewAddress(false);
          }
        })();
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  const hanldeTab3Save = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/profile/changePassword`,
        {
          password: oldPasswordRef?.current?.value,
          new_password: newPassword1Ref?.current?.value,
        },
        {
          headers: {
            Authorization: `bearer ${auth?.token}`,
          },
        }
      );
      if (res.status === 200) {
        enqueueSnackbar(accountContent?.tab3[4], { variant: "success" });
        oldPasswordRef.current.value = "";
        newPassword1Ref.current.value = "";
        newPassword2Ref.current.value = "";
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message, { variant: "error" });
    }
  };

  return (
    <div
      dir={dir}
      style={
        openAccount
          ? { ...style, visibility: "visible", left: "0" }
          : { ...style, visibility: "hidden", left: "1920px" }
      }
      className={styles.account}
    >
      <div className={styles.header}>
        <div className={styles.start}>
          <button onClick={() => setOpenAccount(false)} className={styles.back}>
            <img src="/img/back.svg" alt="back" />
          </button>
          <div className={styles.title}>{accountContent?.title}</div>
        </div>
        <div className={styles.center}>
          <img src="/img/logo.png" alt="logo" />
        </div>

        <div className={styles.end}>
          <Link
            href="/"
            onClick={() => {
              setOpenAccount(false);
              removeCookie("auth");
            }}
            className={styles.loginOrOut}
          >
            {accountContent?.logout}
          </Link>

          <div className={styles.icons}>
            <img
              onClick={() => setOpenAccount(false)}
              className={styles.userIcon}
              src="/img/userBlack.svg"
              alt="user"
            />
            <div
              onClick={() => {
                setOpenAccount(false);
                setOpenCart(true);
              }}
              className={styles.basketCountAndIcon}
            >
              {cartCount > 0 && <div>{{ cartCount }}</div>}
              <img src="/img/basketBlack.svg" alt="basket" />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.breadcrumb}>
          الصفحة الرئيسية / حسابي /{" "}
          <span>{accountContent[`tab${selectedTab}`][0]}</span>
        </div>
        <div className={styles.tabBtns}>
          <a
            onClick={() => setSelectedTab(1)}
            className={
              selectedTab === 1 ? styles.selectedTabBtn : styles.tabBtn
            }
          >
            {accountContent.tab1[0]}
          </a>
          <a
            onClick={() => {
              setSelectedTab(2);
              setAddingNewAddress(false);
            }}
            className={
              selectedTab === 2 ? styles.selectedTabBtn : styles.tabBtn
            }
          >
            {accountContent.tab2[0]}
          </a>
          <a
            onClick={() => setSelectedTab(3)}
            className={
              selectedTab === 3 ? styles.selectedTabBtn : styles.tabBtn
            }
          >
            {accountContent.tab3[0]}
          </a>
        </div>
        <div className={styles.tabTitle}>
          <div className={styles.title}>
            {accountContent[`tab${selectedTab}`][0]}
          </div>
          <div className={styles.line}></div>
        </div>
        {selectedTab === 1 && (
          <form className={styles.tab1}>
            <div className={styles.inputAndLabel}>
              <label>{accountContent.tab1[1]}</label>
              <input
                onChange={handleTab1InputChange}
                value={user?.name}
                name="name"
              />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{accountContent.tab1[2]}</label>
              <input
                onChange={handleTab1InputChange}
                value={user?.mobile}
                name="mobile"
              />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{accountContent.tab1[3]}</label>
              <input
                onChange={handleTab1InputChange}
                value={user?.email}
                name="email"
              />
            </div>
            <button onClick={hanldeTab1Save}>{accountContent.save}</button>
          </form>
        )}
        {selectedTab === 2 &&
          (addingNewAddress ? (
            <form className={styles.newAddress}>
              <div
                className={styles.selectAndLabel + " " + styles.inputAndLabel}
              >
                <label>{accountContent.tab2[5]}</label>
                <select
                  value={newAddress?.city_id}
                  onChange={handleNewAddressInputChange}
                  id="city_id"
                  name="city_id"
                >
                  {governorates.map((city_id) => {
                    return (
                      <option key={city_id.id} value={city_id.id}>
                        {city_id.ar}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div
                className={styles.selectAndLabel + " " + styles.inputAndLabel}
              >
                <label>{accountContent.tab2[6]}</label>
                <select
                  value={newAddress?.district}
                  onChange={handleNewAddressInputChange}
                  ref={districtRef}
                  id="district"
                  name="district"
                >
                  {cities
                    .filter((city) => {
                      return city?.governorate_id == newAddress?.city_id;
                    })
                    .map((district) => {
                      return (
                        <option key={district.id} value={district.id}>
                          {district.ar}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className={styles.inputAndLabel}>
                <label>{accountContent.tab2[7]}</label>
                <input
                  onChange={handleNewAddressInputChange}
                  value={newAddress?.address}
                  name="address"
                />
              </div>
              <div className={styles.buildingAndFloor}>
                <div className={styles.building_number}>
                  <div className={styles.inputAndLabel}>
                    <label>{accountContent.tab2[8]}</label>
                    <input
                      onChange={handleNewAddressInputChange}
                      value={newAddress?.building_number}
                      name="building_number"
                    />
                  </div>
                </div>
                <div className={styles.floor_number}>
                  <div className={styles.inputAndLabel}>
                    <label>{accountContent.tab2[9]}</label>
                    <input
                      onChange={handleNewAddressInputChange}
                      value={newAddress?.floor_number}
                      name="floor_number"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.saveContainer}>
                <button onClick={hanldeNewAddressSave}>
                  {accountContent.save}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.tab2}>
              <button
                onClick={() => {
                  setAddingNewAddress(true);
                  setAddressEditId("new");
                }}
              >
                {accountContent.tab2[1]} <img src="/img/plus.svg" alt="plus" />
              </button>
              {addresses.map((address, index) => {
                return (
                  <div key={index} className={styles.address}>
                    <div className={styles.name}>{auth?.user.name}</div>
                    <div className={styles.mobile}>{auth?.user.mobile}</div>
                    <div className={styles.email}>{auth?.user.email}</div>
                    <div className={styles.addressDetails}>
                      {`${
                        governorates.filter((gov) => {
                          return gov?.id == address?.city_id;
                        })[0]?.ar
                      }, ${
                        cities.filter((district) => {
                          return district?.id == address?.district;
                        })[0]?.ar
                      }, ${address?.address}, ${accountContent.tab2[10]} ${
                        address?.building_number
                      }, ${accountContent.tab2[11]} ${address?.floor_number}`}
                    </div>
                    <div className={styles.footer}>
                      <div className={styles.start}>
                        <img
                          onClick={() => handleSetDefaultAddress(address)}
                          src={address?.default_status == "1" ? `/img/radioOn.svg` : `/img/radioOff.svg`}
                          name="defaultAddress"
                          alt="defaultAddress"
                        />
                        {accountContent.tab2[2]}
                      </div>
                      <div className={styles.end}>
                        <button
                          onClick={(e) => handleRemoveAddress(address?.id)}
                          className={styles.remove}
                        >
                          {accountContent.tab2[3]}
                          <img src="/img/remove.svg" alt="remove" />
                        </button>
                        <button
                          onClick={() => {
                            setAddressEditId(address?.id);
                            setAddingNewAddress(true);
                          }}
                          className={styles.edit}
                        >
                          <img src="/img/edit.svg" alt="edit" />
                          {accountContent.tab2[4]}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        {selectedTab === 3 && (
          <form className={styles.tab3}>
            <div className={styles.inputAndLabel}>
              <label>{accountContent?.tab3[1]}</label>
              <input
                autoComplete="current-password"
                name="password"
                ref={oldPasswordRef}
                type="password"
              />
              <img
                onClick={(e) => {
                  if (e.target.parentElement.children[1].type === "password") {
                    e.target.parentElement.children[1].type = "text";
                    e.target.src = "/img/eye.svg";
                  } else {
                    e.target.parentElement.children[1].type = "password";
                    e.target.src = "/img/eyeSlash.svg";
                  }
                }}
                src="/img/eyeSlash.svg"
                alt="eyeSlash"
              />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{accountContent?.tab3[2]}</label>
              <input
                autoComplete="new-password"
                name="password"
                ref={newPassword1Ref}
                type="password"
              />
              <img
                onClick={(e) => {
                  if (e.target.parentElement.children[1].type === "password") {
                    e.target.parentElement.children[1].type = "text";
                    e.target.src = "/img/eye.svg";
                  } else {
                    e.target.parentElement.children[1].type = "password";
                    e.target.src = "/img/eyeSlash.svg";
                  }
                }}
                src="/img/eyeSlash.svg"
                alt="eyeSlash"
              />
            </div>
            <div className={styles.inputAndLabel}>
              <label>{accountContent?.tab3[3]}</label>
              <input
                autoComplete="new-password"
                name="password"
                ref={newPassword2Ref}
                type="password"
              />
              <img
                onClick={(e) => {
                  if (e.target.parentElement.children[1].type === "password") {
                    e.target.parentElement.children[1].type = "text";
                    e.target.src = "/img/eye.svg";
                  } else {
                    e.target.parentElement.children[1].type = "password";
                    e.target.src = "/img/eyeSlash.svg";
                  }
                }}
                src="/img/eyeSlash.svg"
                alt="eyeSlash"
              />
            </div>
            <button onClick={hanldeTab3Save}>{accountContent?.save}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Account;
