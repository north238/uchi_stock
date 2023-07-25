import React from 'react';
import ReactDOM from 'react-dom';
import styles from './CustomDialog.module.css';

interface CustomDialogProps {
  onCancel: () => void;
  onDelete: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ onCancel, onDelete }) => {
  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>この商品を削除しますか？</h2>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </button>
          <button className={styles.deleteButton} onClick={onDelete}>
            削除
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomDialog;
