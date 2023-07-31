import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseURL } from '../utils/constant';
import styles from './Home.module.css';

type NewProductProps = {
  onAddProduct: (
    name: string,
    place: string,
    quantity: number | null,
    date: Date
  ) => void;
};

const Products: React.FC<NewProductProps> = (props) => {
  const [name, setName] = useState<string>('');
  const [place, setPlace] = useState<string>('');
  const [quantity, setQuantity] = useState<number | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const addProduct = (event: React.FormEvent) => {
    event.preventDefault();
    props.onAddProduct(name, place, quantity, date);

    const postData = async () => {
      try {
        await axios.post(`${baseURL}/addProducts`, {
          name,
          place,
          quantity,
          date,
        });
        console.log('データをPOSTしました');
      } catch (err) {
        console.error('データのPOSTに失敗しました', err);
      }
    };

    postData();
    navigate('/');
  };

  return (
    <section className="productInput">
      <h1 className={styles.title}>商品登録</h1>
      <form onSubmit={addProduct} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="stocker-name">
            商品名:
          </label>
          <input
            className={styles.input}
            type="text"
            id="stocker-name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="商品名を入力してください"
          />
          <label className={styles.label} htmlFor="stocker-place">
            場所:
          </label>
          <input
            className={styles.input}
            type="text"
            id="stocker-place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="保存場所を入力してください"
          />
          <label className={styles.label} htmlFor="stocker-quantity">
            数量:
          </label>
          <input
            className={styles.input}
            type="number"
            id="stocker-quantity"
            value={quantity !== null ? quantity.toString() : ''}
            onChange={(e) =>
              setQuantity(e.target.value ? parseInt(e.target.value) : null)
            }
            placeholder="数量を入力してください"
          />
          <label className={styles.label} htmlFor="stocker-date">
            購入日:
          </label>
          <input
            className={styles.input}
            type="date"
            id="stocker-date"
            value={date.toISOString().slice(0, 10)}
            onChange={(e) => setDate(new Date(e.target.value))}
          />
        <button className={styles.button} type="submit">
          商品を追加
        </button>
        </div>
      </form>
    </section>
  );
};

export default Products;
