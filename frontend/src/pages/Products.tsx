import React, { useState } from 'react';
// import axios from 'axios';
// import { baseURL } from '../utils/constant';
import styles from './Home.module.css';

interface inputProps {
  input: string;
}

const Products:React.FC<inputProps> = () => {

  const [input, setInput] = useState<string>('');

  const addProduct = () => {
    console.log('add Products'!)
  }

  return (
    <section className="product">
      <h1 className={styles.title}>Stocker</h1>
      <form className={styles.form}>
        <div>
          <label className={styles.label} htmlFor="stocker-input">
            商品名:
          </label>
          <input
            className={styles.input}
            type="text"
            id="stocker-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="商品名を入力してください"
          />
          <label className={styles.label} htmlFor="stocker-quantity">
            数量:
          </label>
          <input
            className={styles.input}
            type="number"
            id="stocker-quantity"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="数量を入力してください"
          />
          <label className={styles.label} htmlFor="stocker-date">
            日付:
          </label>
          <input className={styles.input} type="date" id="stocker-date" />
          <button className={styles.button} type="submit" onClick={addProduct}>
            商品を追加
          </button>
        </div>
      </form>
    </section>
  );
};

export default Products;
