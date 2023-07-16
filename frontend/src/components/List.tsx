import React from 'react';
import { BiEditAlt } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';

interface taskProps {
  id?: string;
  task: string;
  setUpdateUI?: boolean;
  updateMode?: boolean;
}

const List: React.FC<taskProps> = ({ id, task, setUpdateUI, updateMode }) => {
  return (
    <li>
      {task}
      <div className="icon_holder">
        <BiEditAlt className="icon" />
        <BsTrash className="icon" />
      </div>
    </li>
  );
};

export default List;
