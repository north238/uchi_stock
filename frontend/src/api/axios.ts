import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ここにベースURLを指定
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// async function updateDatabase(
//   productId: string,
//   newCount: number
// ): Promise<void> {
//   try {
//     const requestData = {
//       productId: productId,
//       quantity: newCount,
//     };
//     const response = await api.put(`/update/${productId}`, requestData);
//     console.log('データベースの更新に成功しました', response.data);
//   } catch (error) {
//     console.error('データベースの更新に失敗しました', error);

//     throw error;
//   }
// }

// export default updateDatabase;

export { api };
