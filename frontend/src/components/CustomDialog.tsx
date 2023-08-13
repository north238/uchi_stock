import React from 'react';
import ReactDOM from 'react-dom';
import { RiDeleteBinLine } from 'react-icons/ri';
import styles from './CustomDialog.module.css';

interface CustomDialogProps {
  onCancel: () => void;
  onDelete: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = (props) => {
  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <RiDeleteBinLine className={styles.icon} />
          <h2>この商品を削除しますか？</h2>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={props.onCancel}>
            キャンセル
          </button>
          <button className={styles.deleteButton} onClick={props.onDelete}>
            削除
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomDialog;
