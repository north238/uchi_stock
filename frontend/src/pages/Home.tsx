import React from 'react';
import { styled, createTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
import { BiCartAdd } from 'react-icons/bi';
import { IoCalendarNumberOutline, IoLocationOutline } from 'react-icons/io5';
import { BsBoxSeam } from 'react-icons/bs';
import { RiPencilLine, RiDeleteBinLine } from 'react-icons/ri';
import { Tb123 } from 'react-icons/tb';
import styles from './Home.module.css';
import ProductDeleteButton from '../components/ProductDeleteButton';

interface ProductListProps {
  items: {
    _id: string;
    name: string;
    place: string;
    quantity: number | null;
    date: Date;
    isAddToList: boolean;
  }[];
  onDeleteProduct: (_id: string) => void;
  updateProduct: (_id: string) => void;
  addToShoppingList: (_id: string) => void;
  onAddProduct: (
    name: string,
    place: string,
    quantity: number | null,
    date: Date,
    isAddToList: false,
  ) => void;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#424242',
    color: theme.palette.common.white,
  },
  '&.zero-quantity': {
    backgroundColor: '#E57373',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  backgroundColor: theme.palette.common.white,
}));

const Home: React.FC<ProductListProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 400,
        md: 768,
        lg: 1025,
        xl: 1536,
      },
    },
  });

  return (
    <section className="home">
      <h1 className={styles.title}>商品一覧</h1>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader sx={{ minWidth: 410 }} aria-label="table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">
                <BsBoxSeam className={styles.tableIcon} />
              </StyledTableCell>
              <StyledTableCell
                sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                align="center"
              >
                <IoLocationOutline className={styles.tableIcon} />
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tb123 className={styles.tableIcon} />
              </StyledTableCell>
              <StyledTableCell
                sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                align="center"
              >
                <IoCalendarNumberOutline className={styles.tableIcon} />
              </StyledTableCell>
              <StyledTableCell align="center">
                <RiPencilLine className={styles.tableIcon} />
              </StyledTableCell>
              <StyledTableCell align="center">
                <RiDeleteBinLine className={styles.tableIcon} />
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.items.map((product) => (
              <StyledTableRow key={product._id}>
                <StyledTableCell
                  sx={{ fontSize: { xs: 11, sm: 14 } }}
                  align="center"
                >
                  {product.name}
                </StyledTableCell>
                <StyledTableCell
                  sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                  align="center"
                >
                  {product.place}
                </StyledTableCell>
                <StyledTableCell
                  sx={{ fontSize: { xs: 11, sm: 14 } }}
                  align="center"
                  className={product.quantity === 0 ? 'zero-quantity' : ''}
                >
                  {product.quantity === 0 ? (
                    <button
                      className={styles.button}
                      onClick={() => props.addToShoppingList(product._id)}
                    >
                      <BiCartAdd className={styles.cartIcon} />
                    </button>
                  ) : (
                    <p>{product.quantity}個</p>
                  )}
                </StyledTableCell>
                <StyledTableCell
                  sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                  align="center"
                >
                  {product.date.toISOString().slice(0, 7)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Link to={`/editProduct/`} className={styles.a}>
                    <RiPencilLine
                      onClick={() => props.updateProduct(product._id)}
                      className={styles.icon}
                    />
                  </Link>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <ProductDeleteButton
                    productId={product._id}
                    onDelete={() => props.onDeleteProduct(product._id)}
                  />
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
    </section>
  );
};

export default Home;
