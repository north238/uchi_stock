import React from 'react';
import styles from './Counter.module.css';

interface CounterProps {
  count: number;
  onCountChange: (newCount: number) => void;
};

const Counter: React.FC<CounterProps> = (props) => {
  const { count, onCountChange } = props;

  const handleIncrement = () => {
    onCountChange(count + 1);
  };
  const handleDecrement = () => {
    onCountChange(count > 0 ? count - 1 : 0);
  };
  return (
    <div className={styles.counter}>
      <button className={styles.upButton} onClick={handleIncrement}>+</button>
      <span className={styles.span}>{count}</span>
      <button className={styles.downButton} onClick={handleDecrement}>-</button>
    </div>
  );
};

export default Counter;
