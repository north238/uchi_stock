import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
// import axios from 'axios';
import { Navbar } from './components/index';
// import { Todo } from './models/todo.model';
import Home from './pages/Home';
import Products from './pages/Products';
import SomeRoute from './pages/SomeRoute';
import NotFound from './pages/NotFound';
// import { baseURL } from './utils/constant';

const App: React.FC = () => {
  // const [todos, setTodos] = useState<Todo[]>([]);

  // useEffect(() => {
  //   axios.get(`${baseURL}/get`).then((res) => {
  //     console.log(res.data);
  //   });
  // }, []);

  // const todoAddHandler = (text: string) => {
  //   setTodos((prevTodos) => [
  //     ...prevTodos,
  //     { id: Math.random().toString(), text: text },
  //   ]);
  // };

  // const todoDeleteHandler = (todoId: string) => {
  //   setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoId));
  // };

  return (
    <>
      <div className="App">
      <Navbar />
        <div>
          <Routes>
            <Route path={'/'} element={<Home />} />
            <Route path={'/addProducts/'} element={<Products input=''/>} />
            <Route path={'/someRoute/'} element={<SomeRoute />} />
            <Route path={'*'} element={<NotFound />} />
          </Routes>
        </div>
        {/* <NewTodo onAddTodo={todoAddHandler} />
        <TodoList items={todos} onDeleteTodo={todoDeleteHandler} /> */}
        {/* <Counter /> */}
      </div>
    </>
  );
};

export default App;
