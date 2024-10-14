import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiPencilLine } from 'react-icons/ri';
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import updateDatabase from '../api/api';
import Counter from '../components/Counter';
import LoadSpinner from '../components/LoadSpinner';
import ProductDeleteButton from '../components/ProductDeleteButton';
import { ProductWithIdProps, ProductListProps } from '../models/props';
import { getComparator, Order } from '../utils/sortComparator';
import { StyledTableCell, StyledTableRow } from '../utils/styles';
import styles from './Home.module.css';

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

  const handleCountChange = (productId: string, newCount: number): void => {
    const updatedProducts = props.items.map((product) =>
      product._id === productId ? { ...product, quantity: newCount } : product
    );
    props.setProduct(updatedProducts);
    updateDatabase(productId, newCount);
  };

  return (
    <section className="home">
      <h1 className={styles.title}>商品一覧</h1>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        {props.loading ? (
          <LoadSpinner />
        ) : (
          <Paper sx={{ display: 'flex', width: '95%' }} elevation={3}>
            <TableContainer sx={{ maxHeight: 590 }}>
              <Table stickyHeader sx={{ minWidth: 410 }} aria-label="table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell align="center">
                      <TableSortLabel
                        sx={{ fontSize: { xs: 12, sm: 14 } }}
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
                        sx={{ fontSize: { xs: 12, sm: 14 } }}
                        active={orderBy === 'place'}
                        direction={orderBy === 'place' ? order : 'asc'}
                        onClick={createSortHandler('place')}
                      >
                        場所
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <TableSortLabel
                        sx={{ fontSize: { xs: 12, sm: 14 } }}
                        active={orderBy === 'categories'}
                        direction={orderBy === 'categories' ? order : 'asc'}
                        onClick={createSortHandler('categories')}
                      >
                        カテゴリ
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <TableSortLabel
                        sx={{ fontSize: { xs: 12, sm: 14 } }}
                        active={orderBy === 'quantity'}
                        direction={orderBy === 'quantity' ? order : 'asc'}
                        onClick={createSortHandler('quantity')}
                      >
                        数量
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell align="center">編集</StyledTableCell>
                    <StyledTableCell align="center">削除</StyledTableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {props.items
                    .slice()
                    .sort(getComparator(order, orderBy))
                    .map((product) => (
                      <StyledTableRow key={product._id}>
                        <StyledTableCell
                          sx={{ fontSize: { xs: 11, sm: 14 }, p: 1 }}
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
                          sx={{ fontSize: { xs: 11, sm: 14 }, p: 1 }}
                          align="center"
                        >
                          {product.categories}
                        </StyledTableCell>
                        <StyledTableCell
                          sx={{ fontSize: { xs: 11, sm: 14 }, p: 1 }}
                          align="center"
                        >
                          <Counter
                            onCountChange={(newCount) =>
                              handleCountChange(product._id, newCount)
                            }
                            newCount={product.quantity}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Link to={`/editProduct/`} className={styles.a}>
                            <RiPencilLine
                              onClick={() => props.onUpdateProduct(product._id)}
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
        )}
      </Box>
    </section>
  );
};

export default Home;
