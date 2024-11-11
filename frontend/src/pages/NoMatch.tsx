// src/pages/NoMatch.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NoMatch: React.FC = () => (
  <div>
    <h2>404: ページが見つかりません</h2>
    <p>申し訳ありませんが、お探しのページは存在しません。</p>
    <Link to="/">ホームへ戻る</Link>
  </div>
);

export default NoMatch;
