import React from 'react';
import { Link } from 'react-router-dom';
import { RiDeleteBinLine, RiPencilLine } from 'react-icons/ri';
// import axios from 'axios';
// import { baseURL } from '../utils/constant';
import styles from './Home.module.css';

interface ProductListProps {
  items: { id: string, name: string; quantity: number | null; date: Date }[];
  onDeleteProduct: (name: string) => void;
  updateProduct: (name: string) => void;
}

const Home: React.FC<ProductListProps> = (props) => {
  return (
    <section className="home">
      <h1 className={styles.title}>Stocker</h1>
      <ul className={styles.ul}>
        {props.items.map((product) => (
          <li className={styles.li} key={product.id}>
            <span>商品名: {product.name}</span>
            <span>数量: {product.quantity}</span>
            <span>購入日: {product.date.toISOString().slice(0, 10)}</span>
            <div className={styles.iconHolder}>
              <Link to={`/editProduct/`} className={styles.a}>
                <RiPencilLine
                  onClick={props.updateProduct.bind(null, product.name)}
                  className={styles.icon}
                />
              </Link>
              <RiDeleteBinLine
                onClick={props.onDeleteProduct.bind(null, product.name)}
                className={styles.icon}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
