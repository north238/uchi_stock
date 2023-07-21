import React from 'react';
import { Link } from 'react-router-dom';
import { BiHome, BiAddToQueue } from 'react-icons/bi';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navLink}>
      <ul className={styles.ul}>
        <li>
          <Link to={`/`} className={styles.a}>
            <BiHome className={styles.icon} />
          </Link>
        </li>
        <li>
          <Link to={`/addProducts/`} className={styles.a}>
            <BiAddToQueue className={styles.icon} />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
