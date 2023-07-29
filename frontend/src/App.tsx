import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from './components/index';
import { ProductProps, ProductWithIdProps } from './models/product-props';
import Home from './pages/Home';
import Products from './pages/Products';
import NotFound from './pages/NotFound';
import EditProduct from './pages/EditProduct';
import { baseURL } from './utils/constant';

const App: React.FC = () => {
  const [product, setProduct] = useState<ProductProps[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductWithIdProps>({
    _id: '',
    name: '',
    place: '',
    quantity: null,
    date: new Date(),
  });
  const [updateUI, setUpdateUI] = useState(false);

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
          })
        );
        setProduct(fetchProducts as ProductWithIdProps[]);
        console.log(fetchProducts);
        
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
    date: Date
  ) => {
    setProduct((prevProduct) => [
      ...prevProduct,
      { name, place, quantity, date },
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
      <Navbar />
      <div>
        <Routes>
          <Route
            path={'/'}
            element={
              <Home
                items={product as ProductWithIdProps[]}
                updateProduct={productUpdateHandler}
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
