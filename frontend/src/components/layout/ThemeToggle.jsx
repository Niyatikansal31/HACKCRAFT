import { useTheme } from '../../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-gray-200 bg-white p-3 text-gray-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4.93 19.07L6.34 17.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.8A9 9 0 1 1 11.2 3C10.8 4.4 10.8 6 11.4 7.5C12.6 10.8 15.3 13.4 18.6 14.6C19.9 15.1 21.4 15.2 21 12.8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;
