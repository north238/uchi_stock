import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Navbar, TransitionAlerts } from './components/index';
import { ProductProps, ProductWithIdProps } from './models/product-props';
import Home from './pages/Home';
import Products from './pages/Products';
import ShoppingList from './pages/ShoppingList';
import EditProduct from './pages/EditProduct';
import NotFound from './pages/NotFound';
import { baseURL } from './utils/constant';

const App: React.FC = () => {
  const [product, setProduct] = useState<ProductProps[]>([]);
  const [shoppingList, setShoppingList] = useState<ProductWithIdProps[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductWithIdProps>({
    _id: '',
    name: '',
    place: '',
    quantity: null,
    date: new Date(),
    isAddToList: false,
  });
  const [updateUI, setUpdateUI] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/`);
        const fetchProducts: ProductWithIdProps[] = res.data.map(
          (item: ProductWithIdProps) => ({
            _id: item._id,
            name: item.name,
            place: item.place,
            quantity: item.quantity,
            date: new Date(item.date),
            isAddToList: item.isAddToList,
          })
        );
        setProduct(fetchProducts as ProductWithIdProps[]);
        setInvisible(true);
      } catch (err) {
        console.error('データが見つかりません', err);
      }
    };
    fetchData();
  }, [updateUI]);

  const productAddHandler = (
    name: string,
    place: string,
    quantity: number | null,
    date: Date,
    isAddToList: boolean
  ) => {
    setProduct((prevProduct) => [
      ...prevProduct,
      { name, place, quantity, date, isAddToList },
    ]);
    setUpdateUI((prevUpdateUI) => !prevUpdateUI);
  };

  const handleBadgeVisibility = () => {
    if (shoppingList.length >= 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  };

  const addToShoppingListHandler = async (productId: string) => {
    try {
      const targetProduct = (product as ProductWithIdProps[]).find(
        (product) => product._id === productId
      );
      if (
        targetProduct &&
        !shoppingList.some((item) => item._id === productId)
      ) {
        setShoppingList((prevList) => [...prevList, targetProduct]);
        handleBadgeVisibility();
        targetProduct.isAddToList = true;
        setAlert('リストへの追加に成功しました');
        await axios.patch(`${baseURL}/patch/${productId}`, {
          isAddToList: true,
        });
      }
    } catch (err) {
      console.error('リストへの追加に失敗しました', err);
      setAlert('リストへの追加に失敗しました');
    }
  };

  const deleteShoppingListHandler = async (productId: string) => {
    try {
      const productIndex = shoppingList.findIndex(
        (product) => product._id === productId
      );
      if (productIndex !== -1) {
        const updatedShoppingList = shoppingList.filter(
          (product) => product._id !== productId
        );
        setShoppingList(updatedShoppingList);
        await axios.patch(`${baseURL}/patch/${productId}`, {
          isAddToList: false,
        });
        console.log('リストから削除に成功しました');
      }
      if (shoppingList.length === 0) {
        setInvisible(true);
      }
    } catch (err) {
      console.error('リストから削除に失敗しました', err);
    }
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

  const saveProductHandler = (updatedProduct: ProductWithIdProps) => {
    setProduct((prevProduct) =>
      (prevProduct as ProductWithIdProps[]).map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setEditingProduct({
      _id: '',
      name: '',
      place: '',
      quantity: null,
      date: new Date(),
      isAddToList: false,
    });
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
      <Navbar invisible={invisible} />
      <div>
        {alert && <TransitionAlerts alertMessage={alert} />}
        <Routes>
          <Route
            path={'/'}
            element={
              <Home
                items={product as ProductWithIdProps[]}
                updateProduct={productUpdateHandler}
                onDeleteProduct={productDeleteHandler}
                onAddProduct={productAddHandler}
                addToShoppingList={addToShoppingListHandler}
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
                product={shoppingList}
                DeleteShoppingList={deleteShoppingListHandler}
              />
            }
          />
          <Route
            path={'/editProduct/'}
            element={
              <EditProduct
                product={editingProduct}
                onSaveProduct={saveProductHandler}
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
