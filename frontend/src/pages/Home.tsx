import React, { useState } from 'react';
import { styled, createTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { Link } from 'react-router-dom';
import { BiCartAdd } from 'react-icons/bi';
import { RiPencilLine } from 'react-icons/ri';
import styles from './Home.module.css';
import ProductDeleteButton from '../components/ProductDeleteButton';
import { ProductWithIdProps } from '../models/product-props';

interface ProductListProps {
  items: ProductWithIdProps[];
  onDeleteProduct: (_id: string) => void;
  updateProduct: (_id: string) => void;
  addToShoppingList: (_id: string) => void;
  onAddProduct: (
    name: string,
    place: string,
    quantity: number | null,
    date: Date,
    isAddToList: false
  ) => void;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | Date | boolean | null },
  b: { [key in Key]: number | string | Date | boolean | null }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontSize: 16,
    fontWeight: 700,
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
  createTheme({
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

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof ProductWithIdProps>('name');
  const createSortHandler = (property: keyof ProductWithIdProps) => {
    return () => {
      if (property === orderBy) {
        setOrder(order === 'asc' ? 'desc' : 'asc');
      } else {
        setOrder('asc');
        setOrderBy(property);
      }
    };
  };

  return (
    <section className="home">
      <h1 className={styles.title}>商品一覧</h1>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader sx={{ minWidth: 410 }} aria-label="table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={createSortHandler('name')}
                  >
                    名前
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell
                  sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                  align="center"
                >
                  <TableSortLabel
                    active={orderBy === 'place'}
                    direction={orderBy === 'place' ? order : 'asc'}
                    onClick={createSortHandler('place')}
                  >
                    場所
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'quantity'}
                    direction={orderBy === 'quantity' ? order : 'asc'}
                    onClick={createSortHandler('quantity')}
                  >
                    数量
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell
                  sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                  align="center"
                >
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={createSortHandler('date')}
                  >
                    購入日
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">
                  編集
                </StyledTableCell>
                <StyledTableCell align="center">
                  削除
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.items.slice().sort(getComparator(order, orderBy)).map((product) => (
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
