import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './lib/firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { StreamCard } from './components/StreamCard';
import StreamingRoom from './components/StreamingRoom';
import { Stream } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { handleFirestoreError, OperationType } from './lib/errorHandling';

export default function App() {
  const [user] = useAuthState(auth);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'streams'), where('status', '==', 'active'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeStreams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stream));
      setStreams(activeStreams);
      setLoading(false);

      // If no streams, add some mock ones for demo if desired, 
      // but let's stick to real time empty state for now
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'streams');
    });

    return () => unsubscribe();
  }, []);

  const startStreaming = async () => {
    if (!user) return;
    try {
      const newStream = {
        hostId: user.uid,
        hostName: user.displayName || 'Anon',
        title: `${user.displayName}'s Awesome Party 🎉`,
        thumbnail: `https://picsum.photos/seed/${user.uid}/600/800`,
        viewerCount: 0,
        startedAt: serverTimestamp(),
        status: 'active'
      };
      const docRef = await addDoc(collection(db, 'streams'), newStream);
      setSelectedStream({ id: docRef.id, ...newStream } as Stream);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'streams');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      <Navbar />
      
      {!user && <Hero />}

      <main className="max-w-7xl mx-auto px-8 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="max-w-xl">
              <h2 className="text-[80px] font-black uppercase tracking-tighter leading-none mb-4">
                 Live <span className="text-brand-pink">Now</span>
              </h2>
              <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">
                 Explore the most hyped party rooms in the world
              </p>
           </div>
           
           {user && (
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={startStreaming}
               className="h-16 w-56 rounded-full bg-gradient-to-r from-brand-pink to-brand-purple flex items-center justify-center font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-pink/30 cursor-pointer"
             >
               Start Live Session
             </motion.button>
           )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-[2rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : streams.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {streams.map(stream => (
              <StreamCard 
                key={stream.id} 
                stream={stream} 
                onClick={setSelectedStream} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-[3rem]">
            <Sparkles className="w-12 h-12 text-brand-pink mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">The party is just starting!</h3>
            <p className="text-white/40 mb-8">Be the first to start a stream and invite your friends.</p>
            {!user && (
              <p className="text-brand-pink font-bold">Sign in to start your own stream!</p>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedStream && (
          <StreamingRoom 
            stream={selectedStream} 
            onClose={() => setSelectedStream(null)} 
          />
        )}
      </AnimatePresence>

      <footer className="border-t border-white/5 py-10 text-center text-white/30 text-sm">
        <p>&copy; 2024 Poppo Live Clone. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Privacy</span>
          <span className="hover:text-white cursor-pointer">Support</span>
        </div>
      </footer>
    </div>
  );
}
