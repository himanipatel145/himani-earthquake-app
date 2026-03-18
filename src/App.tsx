import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarthquakes } from './storeManagement/action/earthquakeAction';
import type { RootState } from './storeManagement/redux/store';

const App = () => {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector(
    (state: RootState) => state.earthquakes
  );

  useEffect(() => {
    dispatch<any>(fetchEarthquakes());
  }, [dispatch]);

  useEffect(() => {
    if (data.length > 0) {
      console.log('Fetched Earthquake Data:', data);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <div>Check your console for fetched data 👀</div>;
};

export default App;
