function Badge({ children, color = 'blue' }) {
  const tones = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[color] || tones.blue}`}>{children}</span>;
}

export default Badge;
