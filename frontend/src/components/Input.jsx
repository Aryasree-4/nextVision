const Input = ({ label, id, className, ...props }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-200">
                {label}
            </label>
            <div className="mt-1">
                <input
                    id={id}
                    name={id}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
