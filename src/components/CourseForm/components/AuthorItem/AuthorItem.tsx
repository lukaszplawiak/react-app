import Button from '../../../../common/Button/Button';
import type { Author } from '../../../../types';

interface AuthorItemProps {
  author: Author;
  onAction: () => void;
  action: string;
}

function AuthorItem({ author, onAction, action }: AuthorItemProps) {
  return (
    <div className="AuthorItem">
      <span>{author.name}</span>
      <Button label={action} onClick={onAction} />
    </div>
  );
}

export default AuthorItem;