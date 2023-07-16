import { Link } from 'react-router-dom';

const SomeRoute = () => {
  return (
    <>
      <h1>SomeRoute</h1>
      <div>
        ホームは<Link to={`/`}>こちら</Link>
        商品一覧は<Link to={`/addProducts/`}>こちら</Link>
      </div>
    </>
  );
};

export default SomeRoute;
