
export const IconButton = ({
    onClick,
    icon,
    children,
    disabled
}) => {
    return <button onClick={onClick} className={'icon-button'} disabled={disabled}>
        <span
            className="material-symbols-rounded">{icon}</span>
        {children}
    </button>
}
