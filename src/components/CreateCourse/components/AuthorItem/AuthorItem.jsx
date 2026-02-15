import PropTypes from 'prop-types';

function AuthorItem({ author, onAction, action }) {
  return (
    <div className="AuthorItem">
      <span>{author.name}</span>
      <Button
        className="Button--link"
        onClick={onAction}
        label={`${action} Author`}
      />
    </div>
  );
}

AuthorItem.propTypes = {
  author: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  onAction: PropTypes.func.isRequired,
  action: PropTypes.string.isRequired,
};

export default AuthorItem;
