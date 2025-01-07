// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { useAuthContext } from 'contexts/AuthContext';
import Loader from 'components/ui/Loader';
import GroupCreateModal from 'components/mui/GroupCreateModal';

const Profile = () => {
  const { user } = useAuthContext();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => setModalOpen(false);

  const handleGroupSubmit = (groupData: {
    users: number[];
    name: string;
    description: string;
    approvalMessage: string;
  }) => {
    console.log('登録するグループデータ:', groupData);
    // APIに送信する処理をここに追加
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* ヘッダーセクション */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ width: 80, height: 80, mr: 2 }} />
              <Box>
                <Typography variant="h5" component="h1" gutterBottom>
                  プロフィール
                </Typography>
                <Typography color="textSecondary">
                  アカウント情報の確認・編集
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* プロフィール情報 */}
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    ユーザー名
                  </Typography>
                  <Typography variant="body1">{user.name}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    メールアドレス
                  </Typography>
                  <Typography variant="body1">
                    {user.email ?? '登録されていません。'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    登録日
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* アクションボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  /* 編集処理 */
                }}
              >
                プロフィールを編集
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleModalOpen}
              >
                グループを追加
              </Button>
            </Box>
          </Paper>
        </Box>
        {/* モーダルを設置 */}
        <GroupCreateModal
          open={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleGroupSubmit}
        />
      </Container>
    </>
  );
};

export default Profile;
