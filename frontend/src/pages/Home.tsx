import React from 'react';
// import axios from 'axios';
// import { baseURL } from '../utils/constant';
import styles from './Home.module.css';

const Home: React.FC = () => {

  return (
    <section className="home">
      <h1 className={styles.title}>Stocker</h1>
      <p>商品を表示</p>
    </section>
  );
};

export default Home;
