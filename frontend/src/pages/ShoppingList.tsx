import React, { useState, useEffect } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import { ProductWithIdProps } from '../models/props';
import { baseURL } from '../utils/constant';
import styles from './ShoppingList.module.css';
import TransitionAlerts from '../components/Alert';

const ShoppingList: React.FC = () => {
  const [filteredProduct, setFilteredProduct] = useState<ProductWithIdProps[]>(
    []
  );
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/`);
        const products: ProductWithIdProps[] = res.data;
        const filteredItems = products.filter((item) => item.isAddToList);
        setFilteredProduct(filteredItems);
      } catch (error) {
        console.error('APIからデータの取得に失敗しました', error);
      }
    };
    fetchData();
  }, []);

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
    </section>
  );
};

export default ShoppingList;
