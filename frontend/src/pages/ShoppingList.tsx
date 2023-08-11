import React from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import Tooltip from '@mui/material/Tooltip';
import { ProductWithIdProps } from '../models/product-props';
import styles from './ShoppingList.module.css';

interface shoppingCartProps {
  product: ProductWithIdProps[];
  DeleteShoppingList: (_id: string) => void;
}

const ShoppingList: React.FC<shoppingCartProps> = (props) => {

  return (
    <section className="shoppingList">
      <h1 className={styles.title}>買い物リスト</h1>
      <ul className={styles.ul}>
        {props.product.map((item) => (
          <li key={item._id} className={styles.li}>
            <span className={styles.span}>{item.name}</span>
            <Tooltip title="delete">
            <button
              className={styles.button}
              onClick={() => props.DeleteShoppingList(item._id)}
            >
              <RiDeleteBinLine className={styles.icon}/>
            </button>
            </Tooltip>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ShoppingList;
