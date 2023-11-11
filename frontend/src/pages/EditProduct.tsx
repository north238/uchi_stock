import React, { useState } from 'react';
import axios from 'axios';
import styles from './EditProduct.module.css';
import { useNavigate } from 'react-router-dom';
import { EditProductProps } from '../models/props';
import { baseURL } from '../utils/constant';
import { selectCategories } from '../utils/selectCategories';
import TransitionAlerts from '../components/Alert';

const EditProduct: React.FC<EditProductProps> = ({
  product,
  onSaveProduct,
}) => {
  const [name, setName] = useState(product.name);
  const [place, setPlace] = useState(product.place);
  const [categories, setCategories] = useState(product.categories);
  const [quantity, setQuantity] = useState(product.quantity);
  const [date, setDate] = useState(product.date);
  const [isAddToList, setIsAddToList] = useState(product.isAddToList);
  const [alert, setAlert] = useState('');
  const navigate = useNavigate();

  const saveHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.put(`${baseURL}/update/${product._id}`, {
        name,
        place,
        categories,
        quantity,
        date,
        isAddToList,
      });
      onSaveProduct({
        _id: product._id,
        name,
        place,
        categories,
        quantity,
        date,
        isAddToList,
      });
      console.log('商品の更新に成功しました');
      setAlert('リストへの追加に成功しました');
      navigate('/');
    } catch (err) {
      console.error('商品の更新に失敗しました', err);
    }
  };

  return (
    <section className="editProduct">
      {alert && <TransitionAlerts alertMessage={alert} />}
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
          />
          <label className={styles.label} htmlFor="stocker-categories">
            カテゴリ
          </label>
          <select
            className={styles.input}
            id="stocker-categories"
            value={categories}
            required
            onChange={(e) => setCategories(e.target.value)}
          >
            {selectCategories.map((item) => (
              <option value={item.category} key={item.id}>
                {item.category}
              </option>
            ))}
          </select>
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
          {isAddToList && (
            <div>
              <label className={styles.label} htmlFor="stocker-isAddToList">
                ステータス
              </label>
              <input
                className={styles.input}
                type="checkbox"
                id="stocker-isAddToList"
                checked={isAddToList}
                onChange={() => setIsAddToList(!isAddToList)}
              />
            </div>
          )}
          <button className={styles.button} type="submit">
            商品を編集
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditProduct;
