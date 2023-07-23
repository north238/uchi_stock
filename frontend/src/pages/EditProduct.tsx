import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { ProductProps } from '../models/product-props';

interface EditProductProps {
  product: ProductProps;
  onSaveProduct: (updateProduct: ProductProps) => void;
}

const EditProduct: React.FC<EditProductProps> = ({
  product,
  onSaveProduct,
}) => {
  const [name, setName] = useState(product.name);
  const [quantity, setQuantity] = useState(product.quantity);
  const [date, setDate] = useState(product.date);
  const navigate = useNavigate();

  const saveHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const updateProduct: ProductProps = {
      ...product,
      name,
      quantity,
      date,
    };

    onSaveProduct(updateProduct);
    navigate('/')
  };

  return (
    <section className="editProduct">
      <h1 className={styles.title}>商品編集</h1>
      <form onSubmit={saveHandler} className={styles.form}>
        <div>
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
          <label className={styles.label} htmlFor="stocker-quantity">
            数量:
          </label>
          <input
            className={styles.input}
            type="number"
            id="stocker-quantity"
            value={quantity !== null ? quantity.toString() : ''}
            onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : null)}
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
        </div>
        <button className={styles.button} type="submit">
          商品を編集
        </button>
      </form>
    </section>
  );
};

export default EditProduct;
