import { motion } from 'motion/react';
import { Sparkles, Users, Mic2, Heart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-pink/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-gold/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full text-brand-pink text-[10px] font-black tracking-[0.3em] uppercase mb-8">
            <Sparkles className="w-3 h-3" />
            Vibe Worldwide
          </span>
          <h2 className="bold-heading mb-10">
            POPPO <span className="text-white">LIVE</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
             <div className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Meet the <span className="text-brand-pink">Stars</span>
             </div>
             <div className="w-2 h-2 rounded-full bg-white/20 hidden md:block" />
             <div className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                Join the <span className="text-brand-purple">Party</span>
             </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { label: '50M+ Worldwide', sub: 'Users' },
            { label: 'Group Audio', sub: 'Party Rooms' },
            { label: 'Expressive', sub: 'Virtual Gifts' },
            { label: 'Ultra High', sub: 'HD Streams' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-1 hover:bg-white/10 transition-colors cursor-default"
            >
              <span className="text-lg font-black uppercase tracking-tight">{item.label}</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.sub}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Side Decoration */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-5 hidden lg:block overflow-hidden h-full">
        <div className="text-[120px] font-black vertical-text uppercase tracking-tighter leading-none select-none h-full flex items-center justify-center">
          LIVE NOW / TRENDING / WORLDWIDE / POPPO
        </div>
      </div>
    </section>
  );
}
