import styles from "@/styles/Search.module.scss";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
const { apiUrl } = require("@/helpers/config");

function Search({ dir, style, setOpenSearch, openSearch, searchContent }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (search !== "") {
      (async () => {
        try {
          const res = await axios.get(`${apiUrl}/products/pages`, {
            params: {
              name: search,
            },
          });
          if (res.status === 200) {
            setResults(await res?.data?.item?.data);
          }
        } catch (error) {
          console.log(error);
        }
      })();
    } else {
      setResults([]);
    }
    return () => {
      controller.abort();
    };
  }, [search]);

  const controller = new AbortController();

  return (
    <div
      dir={dir}
      style={
        openSearch
          ? { ...style, visibility: "visible", left: "0" }
          : { ...style, visibility: "hidden", left: "1920px" }
      }
      className={styles.search}
    >
      <div className={styles.header}>
        <div className={styles.pattern}></div>
      </div>
      <div className={styles.inputContainer}>
        <input
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchContent?.[0]}
        />
        <img
          className={styles.close}
          onClick={() => {
            setOpenSearch(false);
          }}
          src="/img/delete.svg"
          alt="delete"
        />
        <img
          className={styles.searchIcon}
          src="/img/searchGrey.svg"
          alt="searchGrey"
        />
      </div>
      <div
        className={styles.resultsContainer}
        style={
          results?.length === 0
            ? { paddingBlock: "0px",height:"0px" }
            : {}
        }
      >
        {results.map((result,index) => {
          return (
            <Link key={index} onClick={()=>{setOpenSearch(false);setSearch("")}}  href={`/products/${result?.category_slug}/${result?.slug}`} className={styles.result}>
              {result?.name}
            </Link>
          );
        })}
      </div>
      {results?.length === 0 &&<div className={styles.noResults}>
      <img src='/img/noResults.svg' alt='noResults' />
      {searchContent?.[1]}
      </div>}
    </div>
  );
}

export default Search;
