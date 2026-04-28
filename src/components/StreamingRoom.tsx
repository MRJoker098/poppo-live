import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  getDoc
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { X, Send, Heart, Gift as GiftIcon, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Stream, ChatMessage, POPPO_GIFTS, Gift } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

interface Props {
  stream: Stream;
  onClose: () => void;
}

export default function StreamingRoom({ stream, onClose }: Props) {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'streams', stream.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `streams/${stream.id}/messages`);
    });

    // Increment viewer count
    updateDoc(doc(db, 'streams', stream.id), {
      viewerCount: increment(1)
    }).catch(e => console.error(e));

    return () => {
      unsubscribe();
      updateDoc(doc(db, 'streams', stream.id), {
        viewerCount: increment(-1)
      }).catch(e => console.error(e));
    };
  }, [stream.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, type: 'text' | 'gift' = 'text', giftName?: string) => {
    if (!user) return;
    if (!text.trim() && type === 'text') return;

    try {
      await addDoc(collection(db, 'streams', stream.id, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || 'Anon',
        text,
        type,
        giftName,
        timestamp: serverTimestamp()
      });
      setInputText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `streams/${stream.id}/messages`);
    }
  };

  const handleSendGift = async (gift: Gift) => {
    if (!user) return;
    
    // Check balance
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const currentCoins = userDoc.data()?.coins || 0;

    if (currentCoins < gift.price) {
      alert('Not enough coins!');
      return;
    }

    try {
      // Deduct coins
      await updateDoc(userDocRef, {
        coins: increment(-gift.price)
      });

      // Send message
      await sendMessage(`${user.displayName} sent a ${gift.name} ${gift.icon}`, 'gift', gift.name);
      setShowGifts(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black sm:p-6 flex items-center justify-center"
    >
      <div className="relative w-full h-full max-w-5xl bg-[#050505] sm:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full border border-white/20 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video Area */}
        <div className="relative flex-1 bg-black overflow-hidden group">
          <img 
            src={stream.thumbnail} 
            className="w-full h-full object-cover blur-3xl opacity-50 absolute inset-0"
          />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="aspect-[9/16] h-full shadow-2xl relative overflow-hidden">
               <img src={stream.thumbnail} className="w-full h-full object-cover" />
               <div className="absolute top-8 left-8 flex items-center gap-3">
                  <div className="glass-panel p-1 rounded-full flex items-center gap-2 pr-4 min-w-[150px]">
                    <img src={stream.thumbnail} className="w-10 h-10 rounded-full border-2 border-brand-pink" />
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-bold truncate">{stream.hostName}</p>
                       <p className="text-[10px] text-white/60 flex items-center gap-1">
                          <Users className="w-3 h-3 text-brand-gold" /> {stream.viewerCount}
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Interaction Area */}
        <div className="w-full md:w-[400px] flex flex-col bg-[#0A0A0A] border-l border-white/10">
          
          {/* Header */}
          <div className="p-6 border-bottom border-white/5 flex items-center gap-3">
             <MessageSquare className="w-5 h-5 text-brand-pink" />
             <h2 className="font-bold text-lg">Live Interaction</h2>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.type === 'gift' ? 'bg-brand-pink/10 p-3 rounded-2xl border border-brand-pink/20 animate-pulse' : ''}`}>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-tighter">LVL 1</span>
                  <span className="text-sm font-black text-white/90">{msg.senderName}</span>
                </div>
                <p className={`text-sm ${msg.type === 'gift' ? 'text-brand-gold font-bold italic' : 'text-white/70'}`}>
                  {msg.text}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10 bg-black/50">
            <div className="flex items-center gap-4 mb-4">
               <button 
                onClick={() => setShowGifts(!showGifts)}
                className={`p-3 rounded-2xl transition-all ${showGifts ? 'bg-brand-pink text-white' : 'glass-panel text-brand-pink hover:bg-white/10'}`}
               >
                 <GiftIcon className="w-6 h-6" />
               </button>
               <div className="flex-1 relative">
                 <input 
                   type="text"
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                   placeholder="Say something nice..."
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-brand-pink transition-colors pr-12"
                 />
                 <button 
                  onClick={() => sendMessage(inputText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-pink hover:scale-110 transition-transform"
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {/* Gifts Grid */}
            <AnimatePresence>
              {showGifts && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="grid grid-cols-5 gap-2 pt-2 border-t border-white/5"
                >
                  {POPPO_GIFTS.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => handleSendGift(gift)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">{gift.icon}</span>
                      <span className="text-[10px] font-bold text-brand-gold">{gift.price}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
