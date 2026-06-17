'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  return (
    <div className={`flex-1 flex flex-col ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-voxreal-100/40 via-transparent to-purple-dark/5 dark:from-voxreal-950/30 dark:via-transparent dark:to-purple-dark/20 pointer-events-none" />

        {/* Glow Effect */}
        <div className="absolute top-1/4 w-[400px] h-[400px] bg-voxreal-500/10 dark:bg-voxreal-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-voxreal-500 to-purple-mid flex items-center justify-center shadow-xl shadow-voxreal-500/25 mb-8">
            <span className="text-white font-bold text-4xl">V</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-voxreal-600 via-voxreal-500 to-purple-mid bg-clip-text text-transparent">
              VoxReal
            </span>
          </h1>

          {/* Slogan */}
          <p className="text-lg sm:text-xl text-text-muted dark:text-text-muted-dark mb-3 font-medium">
            Make it real. Make it count.
          </p>

          <p className="text-sm text-text-muted dark:text-text-muted-dark mb-10 max-w-sm leading-relaxed">
            Create polls that matter. Share with the world. 
            Let every voice be heard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none">
            <Link
              href="/create"
              className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-voxreal-600 to-purple-mid text-white font-bold text-lg shadow-lg shadow-voxreal-500/30 hover:shadow-xl hover:shadow-voxreal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-center"
            >
              Create a Poll
            </Link>
            <Link
              href="/feed"
              className="flex-1 px-8 py-4 rounded-xl border-2 border-voxreal-300 dark:border-voxreal-700 text-voxreal-700 dark:text-voxreal-300 font-bold text-lg hover:bg-voxreal-50 dark:hover:bg-voxreal-900/30 active:scale-[0.98] transition-all duration-200 text-center"
            >
              Browse Polls
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl px-4">
          {[
            { emoji: '📊', title: 'Create', desc: 'Build polls in seconds with our intuitive builder' },
            { emoji: '📱', title: 'Share', desc: 'Reach your audience on any device, anywhere' },
            { emoji: '📈', title: 'Analyze', desc: 'Real-time results with beautiful visualizations' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="card-enter bg-card dark:bg-card-dark rounded-2xl p-5 border border-voxreal-200/50 dark:border-voxreal-800/50 hover:border-voxreal-400 dark:hover:border-voxreal-600 transition-all duration-200"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="text-2xl mb-2">{feature.emoji}</div>
              <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
