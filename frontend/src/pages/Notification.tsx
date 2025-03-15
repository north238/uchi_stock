import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import {
  getNotifications,
  updateNotificationStatus,
} from '../api/notificationApi'; // APIをインポート
import NotificationCreate from 'components/mui/NotificationCreate';

const Notification = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // 通知をAPIから取得
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data); // 通知データを設定
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification); // 通知詳細を選択
    setOpen(true); // モーダルを開く
  };

  const handleApproval = async (status: number) => {
    if (!selectedNotification) return;

    try {
      await updateNotificationStatus(selectedNotification.id, status); // 承認・非承認をAPIに送信
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 1:
        return '作成済み';
      case 2:
        return '送信済み';
      case 3:
        return '承認済み';
      case 4:
        return '非承認';
      default:
        return '不明なステータス';
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1:
        return '低';
      case 2:
        return '中';
      case 3:
        return '高';
      default:
        return '不明な優先度';
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      {/* 通知作成ボタン */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setCreateModalOpen(true)}
        sx={{ marginBottom: 2 }}
      >
        通知作成
      </Button>
      <List>
        {notifications &&
          notifications.map((notification: any) => (
            <ListItem
              component="a"
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* 通知メッセージを表示 */}
              <ListItemText
                primary={notification.message}
                secondary={`優先度: ${getPriorityLabel(
                  notification.priority
                )} | ステータス: ${getStatusLabel(notification.status)}`}
              />
            </ListItem>
          ))}
      </List>

      {/* モーダルで通知詳細を表示 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box sx={{ padding: 3 }}>
          {selectedNotification ? (
            <>
              <Typography variant="h6" gutterBottom>
                通知詳細
              </Typography>
              <Typography variant="body1" gutterBottom>
                メッセージ: {selectedNotification.message}
              </Typography>
              <Typography variant="body2" gutterBottom>
                アイテムID: {selectedNotification.item_id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                ユーザーID: {selectedNotification.user_id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                優先度: {getPriorityLabel(selectedNotification.priority)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                ステータス: {getStatusLabel(selectedNotification.status)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                種類: {selectedNotification.type}
              </Typography>
              <Typography variant="body2" gutterBottom>
                送信日時: {selectedNotification.sent_at}
              </Typography>
            </>
          ) : (
            <Typography>通知が選択されていません。</Typography>
          )}
        </Box>
        <DialogActions>
          <Button onClick={() => handleApproval(1)} color="primary">
            承認
          </Button>
          <Button onClick={() => handleApproval(2)} color="secondary">
            非承認
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知作成モーダル */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <Box
          sx={{
            padding: 3,
            width: 360,
            maxWidth: '100%',
          }}
        >
          <NotificationCreate />
        </Box>
      </Dialog>
    </Box>
  );
};

export default Notification;
