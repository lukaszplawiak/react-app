import PropTypes from 'prop-types';

function AuthorItem({ author, onAction, action }) {
	return (
		<div className='AuthorItem'>
			<span>{author.name}</span>
			<button onClick={onAction}>{action} Author</button>
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
