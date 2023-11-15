import React, { useState, useEffect } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import { ProductWithIdProps } from '../models/props';
import { baseURL } from '../utils/constant';
import styles from './ShoppingList.module.css';
import TransitionAlerts from '../components/Alert';
import { ShoppingListProps } from '../models/props';
import LoadSpinner from '../components/LoadSpinner';

const ShoppingList: React.FC<ShoppingListProps> = (props) => {
  const [filteredProduct, setFilteredProduct] = useState<ProductWithIdProps[]>(
    []
  );
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/`);
        const products: ProductWithIdProps[] = res.data;
        const filteredItems = products.filter((item) => item.quantity === 0);
        setFilteredProduct(filteredItems);
        props.setBadgeCount(filteredItems.length);
        console.log('APIからデータの取得に成功しました');
      } catch (error) {
        console.error('APIからデータの取得に失敗しました', error);
      }
    };
    fetchData();
  }, [props]);

  const deleteShoppingListHandler = async (itemId: string) => {
    try {
      await axios.patch(`${baseURL}/patch/${itemId}`, {
        isAddToList: false,
      });
      setFilteredProduct((prevFiltered) =>
        prevFiltered.filter((item) => item._id !== itemId)
      );
      console.log('リストから削除に成功しました');
      setAlert('リストから削除に成功しました');
    } catch (err) {
      console.error('リストから削除に失敗しました', err);
    }
  };

  return (
    <section className="shoppingList">
      {alert && <TransitionAlerts alertMessage={alert} />}
      <h1 className={styles.title}>買い物リスト</h1>
      {props.loading ? (
        <LoadSpinner />
      ) : (
        <ul className={styles.ul}>
          {filteredProduct.map((item) => (
            <li key={item._id} className={styles.li}>
              <span className={styles.span}>{item.name}</span>
              <Tooltip title="delete">
                <button
                  className={styles.button}
                  onClick={() => deleteShoppingListHandler(item._id)}
                >
                  <RiDeleteBinLine className={styles.icon} />
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ShoppingList;
