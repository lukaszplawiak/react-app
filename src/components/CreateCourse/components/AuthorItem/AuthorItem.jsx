function AuthorItem({ author, onAction, action }) {
	return (
		<div className='AuthorItem'>
			<span>{author.name}</span>
			<button onClick={onAction}>{action} Author</button>
		</div>
	);
}

export default AuthorItem;
