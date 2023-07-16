import React, { useState } from 'react';

const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const countUp = () => {
    setCount((prevState) => prevState + 1);
  };
  const countDown = () => {
    setCount((prevState) => prevState - 1);
  };
  return (
    <div>
      <p>現在のカウント数: {count}</p>
      <button onClick={countUp}>
        +
      </button>
      <button onClick={countDown}>
        -
      </button>
    </div>
  );
};

export default Counter;
