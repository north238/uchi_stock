import React, { useState } from 'react';
import axios from 'axios';
import { RiDeleteBinLine } from 'react-icons/ri';
import { baseURL } from '../utils/constant';
import CustomDialog from './CustomDialog';
import styles from './ProductDeleteButton.module.css';

interface ProductDeleteButtonProps {
  productId: string;
  onDelete: () => void;
}

const ProductDeleteButton: React.FC<ProductDeleteButtonProps> = (props) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDelete = async () => {
    try {
      await axios.delete(`${baseURL}/delete/${props.productId}`);
      props.onDelete();
    } catch (err) {
      console.error('商品の削除に失敗しました', err);
    }
  };
  return (
    <>
      <button className={styles.button} onClick={() => setIsConfirming(true)}>
        <RiDeleteBinLine className={styles.icon} />
      </button>
      {isConfirming && (
        <CustomDialog
          onCancel={() => setIsConfirming(false)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default ProductDeleteButton;
