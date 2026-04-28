import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Wallet, Bitcoin, ChevronRight, Sparkles } from 'lucide-react';
import { PAYMENT_METHODS, PaymentMethod } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RECHARGE_AMOUNTS = [
  { coins: 1000, price: 'PKR 250' },
  { coins: 5000, price: 'PKR 1200' },
  { coins: 10000, price: 'PKR 2300' },
  { coins: 50000, price: 'PKR 11000' },
];

export default function TopUpModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'method' | 'amount' | 'processing'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleRecharge = async (amount: number) => {
    if (!auth.currentUser) return;
    setStep('processing');

    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        coins: increment(amount)
      });
      
      onClose();
      setStep('method');
      alert(`Successfully recharged ${amount.toLocaleString()} coins via ${selectedMethod?.name}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      setStep('amount');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Recharge <span className="text-brand-pink">Coins</span></h2>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Get more gifts to support your stars</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-white/50" />
                </button>
              </div>

              {step === 'method' && (
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method)}
                      className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-brand-pink/30 hover:scale-[1.02] transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${method.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                          {method.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-black uppercase tracking-tight text-lg">{method.name}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{method.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-brand-pink transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {step === 'amount' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setStep('method')} className="text-xs font-black uppercase tracking-widest text-brand-pink hover:underline">Change Method</button>
                    <span className="text-white/20">/</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white/40">{selectedMethod?.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {RECHARGE_AMOUNTS.map((item) => (
                      <button
                        key={item.coins}
                        onClick={() => handleRecharge(item.coins)}
                        className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-brand-pink group transition-all text-center"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-xl font-black group-hover:text-white">{item.coins.toLocaleString()}</span>
                          <Sparkles className="w-4 h-4 text-brand-gold group-hover:text-white" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80">{item.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'processing' && (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="relative">
                     <div className="w-20 h-20 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin mb-8" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-brand-pink" />
                     </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Processing Payment</h3>
                  <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">Contacting {selectedMethod?.name} Gateway...</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-white/5 border-t border-white/5 text-center">
               <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Secure Transaction &bull; 256-bit Encryption</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
