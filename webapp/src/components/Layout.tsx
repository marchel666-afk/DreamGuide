import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import StarsBg from './StarsBg';

export default function Layout() {
  return (
    <>
      <StarsBg />
      <Outlet />
      <Navigation />
    </>
  );
}
