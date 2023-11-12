import axios from 'axios';
import { baseURL } from '../utils/constant';

const client = axios.create({
  baseURL: baseURL,
});

async function updateDatabase(
  productId: string,
  newCount: number
): Promise<void> {
  try {
    const requestData = {
      productId: productId,
      quantity: newCount
    };
    const response = await client.put(`/update/${productId}`, requestData);
    console.log('データベースの更新に成功しました', response.data);
  } catch (error) {
    console.error('データベースの更新に失敗しました', error);

    throw error;
  }
}

export default updateDatabase;
