import React from 'react';
import { Link } from 'react-router-dom';
import { BiHome, BiAddToQueue } from 'react-icons/bi';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navLink}>
      <ul>
        <li>
          <Link to={`/`}>
            <BiHome className={styles.icon} />
          </Link>
        </li>
        <li>
          <Link to={`/addProducts/`}>
            <BiAddToQueue className={styles.icon} />
          </Link>
        </li>
        <li>
          <Link to={`/someRoute/`}>some Route</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
