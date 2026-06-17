import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-surface dark:bg-surface-dark">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">404</h1>
        <p className="text-text-muted dark:text-text-muted-dark mb-6">
          Sayfa bulunamadı
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
