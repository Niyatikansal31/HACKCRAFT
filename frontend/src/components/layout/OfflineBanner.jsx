import { useConnectivity } from '../../hooks/useConnectivity';

function OfflineBanner() {
  const { isOnline, networkStrength } = useConnectivity();

  if (isOnline) {
    return (
      <div className="fixed left-1/2 top-2 z-[110] -translate-x-1/2 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 shadow-sm dark:bg-green-950/30 dark:text-green-200">
        Online • Network: {networkStrength}
      </div>
    );
  }

  return (
    <div className="fixed left-1/2 top-2 z-[110] -translate-x-1/2 rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-700 shadow-sm dark:bg-red-950/30 dark:text-red-200">
      You are Offline • Showing cached data
    </div>
  );
}

export default OfflineBanner;
