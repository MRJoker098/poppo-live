import React from 'react';
import { motion } from 'motion/react';
import { Users, Play } from 'lucide-react';
import { Stream } from '../types';

export const StreamCard: React.FC<{
  stream: Stream;
  onClick: (stream: Stream) => void;
}> = ({ stream, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="group cursor-pointer relative"
      onClick={() => onClick(stream)}
    >
      <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-4 shadow-2xl border border-white/5">
        <img 
          src={stream.thumbnail} 
          alt={stream.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlays */}
        <div className="absolute inset-x-0 bottom-0 p-8 bg-linear-to-t from-black via-black/60 to-transparent">
          <h3 className="text-2xl font-black tracking-tight uppercase leading-none mb-1 truncate">{stream.title}</h3>
          <p className="text-brand-pink text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            Host: {stream.hostName}
          </p>
        </div>

        <div className="absolute top-6 left-6 z-20 flex gap-2">
          <div className="bg-red-600 text-[10px] font-black px-3 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
          </div>
          <div className="bg-black/40 backdrop-blur-md text-[10px] font-black px-3 py-1 rounded-md border border-white/10 uppercase tracking-tighter">
            {stream.viewerCount.toLocaleString()} Viewers
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-brand-pink/50 scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="text-black w-8 h-8 fill-black ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
