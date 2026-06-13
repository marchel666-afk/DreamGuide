import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NewDream from './pages/NewDream';
import DreamDetail from './pages/DreamDetail';
import Gallery from './pages/Gallery';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="new" element={<NewDream />} />
          <Route path="dream/:id" element={<DreamDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
