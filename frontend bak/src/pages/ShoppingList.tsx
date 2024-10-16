import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProductWithIdProps } from '../models/props';
import { ShoppingListProps } from '../models/props';
import LoadSpinner from '../components/LoadSpinner';
import { baseURL } from '../utils/constant';
import styles from './ShoppingList.module.css';

const ShoppingList: React.FC<ShoppingListProps> = (props) => {
  const [filteredProduct, setFilteredProduct] = useState<ProductWithIdProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/`);
        const products: ProductWithIdProps[] = res.data;
        const filteredItems = products.filter((item) => item.quantity === 0);
        setFilteredProduct(filteredItems);
        setLoading(false);
        props.setBadgeCount(filteredItems.length);
        console.log('APIからデータの取得に成功しました');
      } catch (error) {
        console.error('APIからデータの取得に失敗しました', error);
      }
    };
    fetchData();
  }, [props]);

  return (
    <section className="shoppingList">
      <h1 className={styles.title}>買い物リスト</h1>
      {loading ? (
        <LoadSpinner />
      ) : (
        <ul className={styles.ul}>
          {filteredProduct.map((item) => (
            <li key={item._id} className={styles.li}>
              <span className={styles.span}>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ShoppingList;
