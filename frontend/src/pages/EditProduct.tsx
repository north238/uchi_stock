import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { ProductWithIdProps } from '../models/product-props';
import axios from 'axios';
import { baseURL } from '../utils/constant';

interface EditProductProps {
  product: ProductWithIdProps;
  onSaveProduct: (updateProduct: ProductWithIdProps) => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  product,
  onSaveProduct,
}) => {
  const [name, setName] = useState(product.name);
  const [place, setPlace] = useState(product.place);
  const [quantity, setQuantity] = useState(product.quantity);
  const [date, setDate] = useState(product.date);
  const navigate = useNavigate();

  const saveHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.put(`${baseURL}/update/${product._id}`, {
        name,
        place,
        quantity,
        date,
      });
      onSaveProduct({ _id: product._id, name, place, quantity, date });
      console.log('商品の更新に成功しました', { name, place, quantity, date });
      navigate('/');
    } catch (err) {
      console.error('商品の更新に失敗しました', err);
    }
  };

  return (
    <section className="editProduct">
      <h1 className={styles.title}>商品編集</h1>
      <form onSubmit={saveHandler} className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="stocker-name">
            商品名
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
            場所
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
            数量
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
            購入日
          </label>
          <input
            className={styles.input}
            type="date"
            id="stocker-date"
            value={date.toISOString().slice(0, 10)}
            onChange={(e) => setDate(new Date(e.target.value))}
          />
          <button className={styles.button} type="submit">
            商品を編集
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct;
