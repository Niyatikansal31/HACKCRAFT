function Modal({ open, onClose, title, children, size = 'max-w-4xl' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-950/70 p-4">
      <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 ${size}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          ×
        </button>
        {title ? <h2 className="mb-6 text-2xl font-bold">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}

export default Modal;
