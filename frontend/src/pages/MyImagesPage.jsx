import { useState } from 'react';
import { ImageIcon, Download, Trash2, Search, ZoomIn, X, Clock, Wand2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Parse image URL from a history item (handles both local and backend-fetched formats)
function parseImageUrl(item) {
  // Direct url field (saved locally after generation)
  if (item.url && item.url.startsWith('http')) return item.url;

  // Backend history: result is a JSON string like '{"url": "...", "seed": 123, ...}'
  if (item.result) {
    try {
      const parsed = JSON.parse(item.result);
      if (parsed.url) return parsed.url;
    } catch (_) {}
    // If result itself is a URL
    if (item.result.startsWith('http')) return item.result;
  }
  return null;
}

function ImageCard({ item, onView, onDelete, onDownload }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageUrl = parseImageUrl(item);
  const prompt = item.prompt || 'Generated image';
  const dateStr = (() => {
    const d = item.created_at || item.createdAt;
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  })();

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border border-white/8 hover:border-purple-500/40 transition-all duration-300"
      style={{ background: 'rgba(255,255,255,0.02)', aspectRatio: '1/1' }}
    >
      {/* Loading skeleton */}
      {!loaded && !error && imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center"
             style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full border-2 border-purple-700 border-t-purple-400 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {(error || !imageUrl) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3"
             style={{ background: 'rgba(255,255,255,0.04)' }}>
          <AlertCircle size={28} className="text-gray-600" />
          <p className="text-gray-600 text-xs text-center leading-tight">{prompt.slice(0, 40)}</p>
        </div>
      )}

      {/* Actual image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={prompt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}

      {/* Hover overlay — only show when image loaded */}
      {loaded && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 50%, rgba(0,0,0,0.25) 100%)' }}
        >
          {/* Top actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onView(item)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              title="View full size"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => onDownload(imageUrl, prompt)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              title="Download"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 transition-all hover:scale-110"
              style={{ background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(8px)' }}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Bottom info */}
          <div>
            <p className="text-white text-xs font-medium leading-tight line-clamp-2">{prompt}</p>
            {dateStr && (
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                <Clock size={10} /> {dateStr}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyImagesPage() {
  const { history, deleteFromHistory } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Only show image history items that have a valid image URL
  const images = history.filter(h => h.type === 'image' && parseImageUrl(h));

  const filtered = images.filter(h => {
    const q = search.toLowerCase();
    return !q || (h.prompt || '').toLowerCase().includes(q);
  });

  const handleDelete = async (id) => {
    await deleteFromHistory(id);
    if (selectedImage?.id === id) setSelectedImage(null);
    toast.success('Image removed from gallery');
  };

  const handleDownload = (url, prompt) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-image-${Date.now()}.jpg`;
    a.target = '_blank';
    a.click();
    toast.success('Download started!');
  };

  const selectedUrl = selectedImage ? parseImageUrl(selectedImage) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
            <ImageIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">My Image Gallery</h1>
            <p className="text-gray-500 text-sm">{images.length} image{images.length !== 1 ? 's' : ''} generated</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by prompt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 w-full"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="py-24 rounded-2xl border border-white/8 text-center flex flex-col items-center gap-4"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ background: 'rgba(139,92,246,0.15)' }}>
            <ImageIcon size={32} className="text-purple-400" />
          </div>
          <div>
            <p className="text-gray-300 font-semibold text-lg mb-1">
              {images.length === 0 ? 'No images yet' : 'No results found'}
            </p>
            <p className="text-gray-600 text-sm">
              {images.length === 0
                ? 'Generate your first AI image and it will appear here'
                : 'Try a different search term'}
            </p>
          </div>
          {images.length === 0 && (
            <button onClick={() => navigate('/dashboard/tools')} className="btn-primary flex items-center gap-2 mt-2">
              <Wand2 size={16} /> Generate an Image
            </button>
          )}
        </div>
      )}

      {/* Image Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <ImageCard
              key={item.id}
              item={item}
              onView={setSelectedImage}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && selectedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            >
              <X size={18} />
            </button>

            <img
              src={selectedUrl}
              alt={selectedImage.prompt || 'Generated image'}
              className="w-full max-h-[72vh] object-contain"
              style={{ background: '#050510' }}
            />

            <div className="px-5 py-4" style={{ background: 'rgba(10,10,30,0.95)' }}>
              <p className="text-white font-medium mb-3">{selectedImage.prompt || 'Generated image'}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(selectedUrl, selectedImage.prompt)}
                  className="btn-primary flex items-center gap-2 py-2 text-sm"
                >
                  <Download size={15} /> Download
                </button>
                <button
                  onClick={() => handleDelete(selectedImage.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
