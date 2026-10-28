import { useState, useCallback, useEffect } from 'react';
import { detectMyPublicIp } from '../utils/geo-api';

export function useMyIp() {
  const [state, setState] = useState({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await detectMyPublicIp();
      setState({ status: 'ready', data });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Could not detect your IP.',
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
