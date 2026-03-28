import { useContext } from 'react';
import { ConnectivityContext } from '../context/ConnectivityContext';

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity must be used inside ConnectivityProvider');
  return context;
}
