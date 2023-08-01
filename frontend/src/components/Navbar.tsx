import React from 'react';
import { Link } from 'react-router-dom';
import { BiHome, BiAddToQueue } from 'react-icons/bi';
import { BsBoxes } from 'react-icons/bs';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navLink}>
      <div className={styles.navLogo}>
        <BsBoxes className={styles.navBrand} />
        <p className={styles.brandP}>Stocker</p>
      </div>
      <ul className={styles.ul}>
        <li>
          <div className={styles.liDiv}>
            <Link to={`/`} className={styles.a}>
              <BiHome className={styles.icon} />
            </Link>
            <p className={styles.liP}>Home</p>
          </div>
        </li>
        <li>
          <div className={styles.liDiv}>
            <Link to={`/addProducts/`} className={styles.a}>
              <BiAddToQueue className={styles.icon} />
            </Link>
            <p className={styles.liP}>Add</p>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
