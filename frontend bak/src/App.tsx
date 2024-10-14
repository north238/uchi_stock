import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Products from './pages/Products';
import ShoppingList from './pages/ShoppingList';
import EditProduct from './pages/EditProduct';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import { ProductProps, ProductWithIdProps } from './models/props';
import { productsData } from './models/productsData';
import { baseURL } from './utils/constant';

const App: React.FC = () => {
  const [product, setProduct] = useState<ProductProps[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [editingProduct, setEditingProduct] =
    useState<ProductWithIdProps>(productsData);
  const [updateUI, setUpdateUI] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/`);
        const fetchProducts: ProductWithIdProps[] = res.data.map(
          (item: ProductWithIdProps) => ({
            _id: item._id,
            name: item.name,
            place: item.place,
            categories: item.categories,
            quantity: item.quantity,
            date: new Date(item.date),
            isAddToList: item.isAddToList,
          })
        );
        const filteredItems: ProductWithIdProps[] = res.data.filter(
          (item: ProductWithIdProps) => item.quantity === 0
        );
        setBadgeCount(filteredItems.length);
        setProduct(fetchProducts as ProductWithIdProps[]);
        setLoading(false);
      } catch (err) {
        console.error('データが見つかりません', err);
      }
    };
    fetchData();
  }, [updateUI]);

  const productAddHandler = (
    name: string,
    place: string,
    categories: string,
    quantity: number | null,
    date: Date,
    isAddToList: boolean
  ) => {
    setProduct((prevProduct) => [
      ...prevProduct,
      { name, place, categories, quantity, date, isAddToList },
    ]);
    setUpdateUI((prevUpdateUI) => !prevUpdateUI);
  };

  const productUpdateHandler = (productId: string) => {
    const targetProduct = (product as ProductWithIdProps[]).find(
      (product) => product._id === productId
    );
    if (targetProduct) {
      setEditingProduct(targetProduct);
      setUpdateUI((prevUpdateUI) => !prevUpdateUI);
    }
  };

  const productSaveHandler = (updatedProduct: ProductWithIdProps) => {
    setProduct((prevProduct) =>
      (prevProduct as ProductWithIdProps[]).map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setEditingProduct(productsData);
  };

  const productDeleteHandler = async (productId: string) => {
    try {
      await axios.delete(`${baseURL}/delete/${productId}`);
      setProduct((prevProduct) =>
        (prevProduct as ProductWithIdProps[]).filter(
          (product) => product._id !== productId
        )
      );
    } catch (err) {
      console.error('商品の削除に失敗しました', err);
    }
  };

  return (
    <div className="App">
      <Navbar badgeCount={badgeCount} />
      <div>
        <Routes>
          <Route
            path={'/'}
            element={
              <Home
                loading={loading}
                items={product as ProductWithIdProps[]}
                setProduct={setProduct}
                onUpdateProduct={productUpdateHandler}
                onDeleteProduct={productDeleteHandler}
                onAddProduct={productAddHandler}
              />
            }
          />
          <Route
            path={'/addProducts/'}
            element={<Products onAddProduct={productAddHandler} />}
          />
          <Route
            path={'/shoppingList/'}
            element={
              <ShoppingList
                badgeCount={badgeCount}
                setBadgeCount={setBadgeCount}
              />
            }
          />
          <Route
            path={'/editProduct/'}
            element={
              <EditProduct
                product={editingProduct}
                onSaveProduct={productSaveHandler}
              />
            }
          />
          <Route path={'*'} element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
