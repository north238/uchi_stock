import React from 'react';
import { Link } from 'react-router-dom';
import { RiPencilLine } from 'react-icons/ri';
import styles from './Home.module.css';
import ProductDeleteButton from '../components/ProductDeleteButton';

interface ProductListProps {
  items: { _id: string; name: string; quantity: number | null; date: Date }[];
  onDeleteProduct: (_id: string) => void;
  updateProduct: (_id: string) => void;
}

const Home: React.FC<ProductListProps> = (props) => {
  return (
    <section className="home">
      <h1 className={styles.title}>Stocker</h1>
      <ul className={styles.ul}>
        {props.items.map((product) => (
          <li className={styles.li} key={product._id}>
            <span>商品名: {product.name}</span>
            <span>数量: {product.quantity}</span>
            <span>購入日: {product.date.toISOString().slice(0, 10)}</span>
            <div className={styles.iconHolder}>
              <Link to={`/editProduct/`} className={styles.a}>
                <RiPencilLine
                  onClick={() => props.updateProduct(product._id)}
                  className={styles.icon}
                />
              </Link>
              <ProductDeleteButton
                productId={product._id}
                onDelete={() => props.onDeleteProduct(product._id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
