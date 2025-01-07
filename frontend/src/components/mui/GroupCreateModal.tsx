import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { User } from 'types';

interface GroupCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupData: {
    users: number[];
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
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedUsers(event.target.value as number[]);
  };

  interface User {
    id: number;
    name: string;
  }

  const users: User[] = [
    { id: 1, name: 'ユーザー1' },
    { id: 2, name: 'ユーザー2' },
    { id: 3, name: 'ユーザー3' },
  ];

  const handleSubmit = () => {
    const groupData = {
      users: selectedUsers,
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
        <FormControl fullWidth margin="normal">
          <InputLabel id="user-select-label">追加ユーザー</InputLabel>
          <Select
            labelId="user-select-label"
            multiple
            required
            value={selectedUsers}
            onChange={handleChange}
            renderValue={(selected) =>
              (selected as number[])
                .map((id) => users.find((user) => user.id === id)?.name)
                .join(', ')
            }
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                <Checkbox checked={selectedUsers.includes(user.id)} />
                <ListItemText primary={user.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="グループ名"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="家族"
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
          placeholder="家族との共有"
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
