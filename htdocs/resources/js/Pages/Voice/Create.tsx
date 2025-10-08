import React from 'react';
import VoiceInput from '@/Components/VoiceInput';

const VoicePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">音声入力ページ</h1>
      <VoiceInput />
    </div>
  );
};

export default VoicePage;