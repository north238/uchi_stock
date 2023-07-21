import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/index';
import { ProductProps } from './models/product-props';
import Home from './pages/Home';
import Products from './pages/Products';
import NotFound from './pages/NotFound';
import EditProduct from './pages/EditProduct';

const App: React.FC = () => {
  const [product, setProduct] = useState<ProductProps[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductProps>({
    name: '',
    quantity: null,
    date: new Date(),
  });

  const productAddHandler = (
    name: string,
    quantity: number | null,
    date: Date
  ) => {
    setProduct((prevProduct) => [...prevProduct, { name, quantity, date }]);
  };

  const productUpdateHandler = (name: string) => {
    const targetProduct = product.find((product) => product.name === name);
    if (targetProduct) {
      setEditingProduct(targetProduct);
    }
  };

  const saveProductHandler = (updatedProduct: ProductProps) => {
    setProduct((prevProducts) =>
      prevProducts.map((product) =>
        product.name === updatedProduct.name ? updatedProduct : product
      )
    );
    setEditingProduct({ name: '', quantity: null, date: new Date() });
  };

  const productDeleteHandler = (productName: string) => {
    setProduct((prevProduct) =>
      prevProduct.filter((product) => product.name !== productName)
    );
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
                items={product}
                updateProduct={productUpdateHandler}
                onDeleteProduct={productDeleteHandler}
              />
            }
          />
          <Route
            path={'/addProducts/'}
            element={<Products onAddProduct={productAddHandler} />}
          />
          <Route
            path={'/edit/'}
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
