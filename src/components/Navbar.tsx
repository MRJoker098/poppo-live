import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Coins, LogIn, LogOut, Plus, Video } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import TopUpModal from './TopUpModal';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Use onSnapshot for real-time balance updates
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          // Initialize profile
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Anon',
            photoURL: user.photoURL || '',
            coins: 1000,
            level: 1,
            isLive: false,
            createdAt: serverTimestamp(),
          };
          setDoc(doc(db, 'users', user.uid), newProfile);
        }
      });
      return () => unsubscribe();
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => signOut(auth);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 glass-panel px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-brand-purple to-brand-indigo uppercase">
            Poppo
          </h1>
          <div className="flex gap-4 mt-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-brand-pink border-b-2 border-brand-pink pb-0.5">Live</span>
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white cursor-pointer transition-colors">Party</span>
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white cursor-pointer transition-colors">Nearby</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div 
                className="hidden md:flex items-center gap-3 bg-white/5 rounded-full pl-4 pr-1 py-1 border border-white/10 hover:border-brand-pink/50 transition-colors group cursor-pointer"
                onClick={() => setIsTopUpOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <Coins className="text-brand-gold w-4 h-4" />
                  <span className="text-sm font-black text-brand-gold uppercase tracking-tight">{profile?.coins?.toLocaleString() ?? 0}</span>
                </div>
                <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-full border border-white/10">
                <img 
                  src={user.photoURL || ''} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-brand-pink"
                />
                <div className="hidden sm:block pr-2">
                  <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{profile?.displayName}</p>
                  <p className="text-[8px] text-brand-pink font-black uppercase tracking-widest">LVL {profile?.level}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="bg-gradient-to-r from-brand-pink to-brand-purple text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:shadow-brand-pink/40 transition-all"
            >
              Join Party
            </motion.button>
          )}
        </div>
      </nav>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
    </>
  );
}

