import React from 'react';
import { Link } from 'react-router-dom';
import { IoCalendarNumberOutline, IoLocationOutline } from 'react-icons/io5';
import { BsBoxSeam } from 'react-icons/bs';
import { RiPencilLine } from 'react-icons/ri';
import { Tb123 } from 'react-icons/tb';
import styles from './Home.module.css';
import ProductDeleteButton from '../components/ProductDeleteButton';

interface ProductListProps {
  items: {
    _id: string;
    name: string;
    place: string;
    quantity: number | null;
    date: Date;
  }[];
  onDeleteProduct: (_id: string) => void;
  updateProduct: (_id: string) => void;
  onAddProduct: (
    name: string,
    place: string,
    quantity: number | null,
    date: Date
  ) => void;
}

const Home: React.FC<ProductListProps> = (props) => {
  return (
    <section className="home">
      <h1 className={styles.title}>商品一覧</h1>
      <ul className={styles.ul}>
        {props.items.map((product) => (
          <li key={product._id} className={styles.li}>
            <div className={styles.iconDiv}>
              <BsBoxSeam className={styles.productIcon} />
              <p className={styles.iconP}>{product.name}</p>
            </div>
            <div className={styles.iconDiv}>
              <IoLocationOutline className={styles.productIcon} />
              <p className={styles.iconP}>{product.place}</p>
            </div>
            <div className={styles.iconDiv}>
              <Tb123 className={styles.productIcon} />
              <p className={styles.iconP}>{product.quantity}個</p>
            </div>
            <div className={styles.iconDiv}>
              <IoCalendarNumberOutline className={styles.productIcon} />
              <p className={styles.iconP}>
                {product.date.toISOString().slice(0, 10)}
              </p>
            </div>
            <div className={styles.iconHolder} key={product._id}>
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
