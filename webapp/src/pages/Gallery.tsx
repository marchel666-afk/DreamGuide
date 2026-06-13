import { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import type { GalleryDream } from '../types';
import GalleryItem from '../components/GalleryItem';
import { GridIcon } from '../components/Icons';

export default function Gallery() {
  const [items, setItems] = useState<GalleryDream[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await api.gallery.list(p);
      if (p === 1) setItems(data);
      else setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === 20);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <GridIcon size={20} color="var(--accent-primary)" />
        <h1 style={{ fontSize: 22 }}>Галерея снов</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
        Анонимные сны других пользователей
      </p>

      {loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="glass" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <GridIcon size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Галерея пока пуста. Поделитесь своим сном!
          </p>
        </div>
      )}

      {items.map((item) => (
        <GalleryItem key={item.id} item={item} />
      ))}

      {hasMore && items.length > 0 && (
        <button
          className="btn btn-ghost btn-full"
          onClick={() => { setPage((p) => p + 1); load(page + 1); }}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Загрузить ещё'}
        </button>
      )}
    </div>
  );
}
