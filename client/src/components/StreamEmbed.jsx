export default function StreamEmbed({ url, title }) {
  if (!url) return null;

  const getEmbedUrl = (url) => {
    if (url.includes('twitch.tv')) {
      const channel = url.split('twitch.tv/')[1]?.split('?')[0];
      if (channel) return `https://player.twitch.tv/?channel=${channel}&parent=localhost`;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let id = '';
      if (url.includes('youtube.com/watch')) {
        id = new URL(url).searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        id = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        id = url.split('embed/')[1]?.split('?')[0] || '';
      }
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="card-sport">
      {title && <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white mb-3">{title}</h4>}
      <div className="aspect-video bg-sport-black">
        <iframe
          src={getEmbedUrl(url)}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          title={title || 'Stream'}
        />
      </div>
    </div>
  );
}
