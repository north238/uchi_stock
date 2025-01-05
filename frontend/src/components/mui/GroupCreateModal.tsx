import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
} from '@mui/material';

interface GroupCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupData: {
    name: string;
    description: string;
    approvalMessage: string;
  }) => void;
}

const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  open,
  onClose,
  onSubmit,
}: GroupCreateModalProps) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');

  const handleSubmit = () => {
    const groupData = {
      name: groupName,
      description: groupDescription,
      approvalMessage: approvalMessage,
    };
    onSubmit(groupData);
    // フォームをクリア
    setGroupName('');
    setGroupDescription('');
    setApprovalMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>グループを作成</DialogTitle>
      <DialogContent>
        <TextField
          label="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="グループ内容"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <TextField
          label="承認メッセージ"
          value={approvalMessage}
          onChange={(e) => setApprovalMessage(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          placeholder="承認時に表示するメッセージを入力してください"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          キャンセル
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupCreateModal;
