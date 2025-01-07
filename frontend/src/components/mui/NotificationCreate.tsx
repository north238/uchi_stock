import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { createNotification } from 'api/notificationApi';

const NotificationCreate: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [itemId, setItemId] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<number | ''>('');
  const [type, setType] = useState<number | ''>('');
  const [priority, setPriority] = useState<number | ''>('');
  const [sentAt, setSentAt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const notificationData = {
      user_id: userId,
      item_id: itemId,
      message,
      status,
      type,
      priority,
      sent_at: sentAt,
    };
    console.log(notificationData);

    try {
      const response = await createNotification(notificationData);
      alert(response.message); // 通知作成成功メッセージを表示
    } catch (error) {
      console.error('通知の作成に失敗しました:', error);
      alert('通知の作成に失敗しました');
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        通知作成
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="ユーザーID"
          variant="outlined"
          fullWidth
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="アイテムID"
          variant="outlined"
          fullWidth
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="メッセージ"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-select-label">ステータス</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            required
          >
            <MenuItem value={1}>情報送信</MenuItem>
            <MenuItem value={2}>システムメンテナンス</MenuItem>
            <MenuItem value={3}>その他</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="type-select-label">タイプ</InputLabel>
          <Select
            labelId="type-select-label"
            value={type}
            onChange={(e) => setType(Number(e.target.value))}
            required
          >
            <MenuItem value={1}>情報</MenuItem>
            <MenuItem value={2}>警告</MenuItem>
            <MenuItem value={3}>エラー</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="priority-select-label">優先度</InputLabel>
          <Select
            labelId="priority-select-label"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            required
          >
            <MenuItem value={1}>低</MenuItem>
            <MenuItem value={2}>中</MenuItem>
            <MenuItem value={3}>高</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="送信日時"
          type="datetime-local"
          variant="outlined"
          fullWidth
          value={sentAt}
          onChange={(e) => setSentAt(e.target.value)}
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          作成
        </Button>
      </Box>
    </>
  );
};

export default NotificationCreate;
