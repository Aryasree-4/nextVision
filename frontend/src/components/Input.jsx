const Input = ({ label, id, className = '', ...props }) => {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                name={id}
                className="input-field"
                {...props}
            />
        </div>
    );
};

export default Input;
