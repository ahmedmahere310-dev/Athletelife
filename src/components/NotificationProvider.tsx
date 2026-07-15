import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, HelpCircle, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
}

interface AlertOptions {
  title?: string;
  buttonText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface AlertState {
  message: string;
  title?: string;
  buttonText?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  resolve: () => void;
}

interface ConfirmState {
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  resolve: (value: boolean) => void;
}

export const NotificationProvider: React.FC<{ children: ReactNode; isArabic: boolean }> = ({ children, isArabic }) => {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const alert = (message: string, options?: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        message,
        title: options?.title,
        buttonText: options?.buttonText || (isArabic ? 'حسناً' : 'OK'),
        type: options?.type || 'info',
        resolve: () => {
          setAlertState(null);
          resolve();
        },
      });
    });
  };

  const confirm = (message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        title: options?.title,
        confirmText: options?.confirmText || (isArabic ? 'تأكيد' : 'Confirm'),
        cancelText: options?.cancelText || (isArabic ? 'إلغاء' : 'Cancel'),
        type: options?.type || 'info',
        resolve: (val) => {
          setConfirmState(null);
          resolve(val);
        },
      });
    });
  };

  return (
    <NotificationContext.Provider value={{ alert, confirm }}>
      {children}

      {/* Modern Alert Modal */}
      <AnimatePresence>
        {alertState && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
              onClick={alertState.resolve}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl space-y-5 overflow-hidden"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border shrink-0 ${
                  alertState.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : alertState.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : alertState.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                }`}>
                  {alertState.type === 'success' ? (
                    <CheckCircle size={22} />
                  ) : (
                    <AlertCircle size={22} />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  {alertState.title && (
                    <h3 className="text-md font-display font-bold text-white leading-none">
                      {alertState.title}
                    </h3>
                  )}
                  <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                    {alertState.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={alertState.resolve}
                  className="w-full px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 active:scale-98 shadow-lg shadow-emerald-500/10 transition"
                >
                  {alertState.buttonText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Confirm Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
              onClick={() => confirmState.resolve(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl space-y-5 overflow-hidden"
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border shrink-0 ${
                  confirmState.type === 'danger'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : confirmState.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {confirmState.type === 'danger' ? (
                    <AlertCircle size={22} className="text-red-400" />
                  ) : confirmState.type === 'warning' ? (
                    <AlertCircle size={22} className="text-amber-400" />
                  ) : (
                    <HelpCircle size={22} className="text-emerald-400" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-md font-display font-bold text-white leading-none">
                    {confirmState.title || (isArabic ? 'تأكيد الإجراء' : 'Confirm Action')}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {confirmState.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => confirmState.resolve(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 font-bold text-xs hover:text-white hover:border-zinc-700 active:scale-98 transition flex-1"
                >
                  {confirmState.cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => confirmState.resolve(true)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs active:scale-98 transition flex-1 shadow-lg ${
                    confirmState.type === 'danger'
                      ? 'bg-red-500 text-zinc-950 hover:bg-red-400 shadow-red-500/10'
                      : confirmState.type === 'warning'
                      ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-amber-500/10'
                      : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/10'
                  }`}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};
