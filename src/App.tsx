import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Send, Image as ImageIcon, Delete, Sparkles, Loader2, Heart,
  Cloud, Star, Camera, Fingerprint, Settings, Lock, MessageCircle, Eye, BookHeart,
  Calendar, Clock, Music, Flower2, PenTool, Mail, PartyPopper, Upload
} from 'lucide-react';
import { loadBackgrounds, saveBackground, compressImage } from './lib/db';

export default function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState(() => localStorage.getItem('kotokoo_passcode') || '1234');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('kotokoo_apiKey') || '');
  const [proxyUrl, setProxyUrl] = useState(() => localStorage.getItem('kotokoo_proxyUrl') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('kotokoo_selectedModel') || '');
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({});

  useEffect(() => { localStorage.setItem('kotokoo_passcode', passcode); }, [passcode]);
  useEffect(() => { localStorage.setItem('kotokoo_apiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('kotokoo_proxyUrl', proxyUrl); }, [proxyUrl]);
  useEffect(() => { localStorage.setItem('kotokoo_selectedModel', selectedModel); }, [selectedModel]);

  useEffect(() => {
    const loadCustomizations = async () => {
      try {
        const bgs = await loadBackgrounds();
        if (bgs['home_bg']) {
          setCustomBg(bgs['home_bg']);
        }
        const icons: Record<string, string> = {};
        Object.keys(bgs).forEach(key => {
          if (key.startsWith('icon_')) {
            icons[key.replace('icon_', '')] = bgs[key];
          }
        });
        setCustomIcons(icons);
      } catch (e) {
        console.error("Failed to load customizations", e);
      }
    };
    loadCustomizations();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#FAF9F6] text-pink-900 font-sans selection:bg-pink-200">
      <AnimatePresence mode="wait">
        {isLocked ? (
          <LockScreen key="lock" onUnlock={() => setIsLocked(false)} passcode={passcode} />
        ) : (
          <HomeScreen 
            key="home"
            openApp={(app) => setCurrentApp(app)} 
            customBg={customBg}
            customIcons={customIcons}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentApp === 'settings' && (
          <SettingsApp 
            key="settings"
            onClose={() => setCurrentApp(null)}
            passcode={passcode}
            setPasscode={setPasscode}
            apiKey={apiKey}
            setApiKey={setApiKey}
            proxyUrl={proxyUrl}
            setProxyUrl={setProxyUrl}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            customBg={customBg}
            setCustomBg={setCustomBg}
            customIcons={customIcons}
            setCustomIcons={setCustomIcons}
          />
        )}
        {currentApp === 'chat' && (
          <ChatApp 
            key="chat"
            onClose={() => setCurrentApp(null)}
            selectedModel={selectedModel}
            proxyUrl={proxyUrl}
            apiKey={apiKey}
            customBg={customBg}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LockScreen({ onUnlock, passcode }: { onUnlock: () => void, passcode: string }) {
  const [showPasscode, setShowPasscode] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full z-50"
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background */}
      <img src="https://i.postimg.cc/9FnXQNpn/e1d0cd594c41440c5e1dadc28f25c69a.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Lock Screen Background" />
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-lock-pattern opacity-40"></div>

      <AnimatePresence>
        {!showPasscode ? (
          <motion.div 
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y < -50) {
                setShowPasscode(true);
              }
            }}
            className="absolute inset-0 flex flex-col cursor-grab active:cursor-grabbing"
            exit={{ y: -1000, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Greeting */}
            <div className="mt-20 mx-auto coquette-box px-8 py-3 rounded-full text-pink-800 font-medium shadow-sm flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400 fill-pink-400/20" /> Chào buổi sáng, Kotokoo! <Heart className="w-5 h-5 text-pink-400 fill-pink-400/20" />
            </div>

            {/* Time Box */}
            <div className="w-[85%] max-w-sm h-[220px] mx-auto mt-12 coquette-box flex flex-col items-center justify-center relative">
              <div className="flex justify-between w-[70%] absolute -top-6">
                <Cloud className="w-10 h-10 text-pink-300 fill-pink-300/20 drop-shadow-md" />
                <Star className="w-10 h-10 text-pink-300 fill-pink-300/20 drop-shadow-md" />
                <Heart className="w-10 h-10 text-pink-300 fill-pink-300/20 drop-shadow-md" />
              </div>
              <div className="text-[90px] font-semibold text-pink-400 leading-none tracking-tight drop-shadow-sm" style={{ textShadow: '2px 2px 4px rgba(255,255,255,0.8)' }}>
                {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-pink-400/80 font-medium mt-2 text-lg">
                {time.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Bottom Icons */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-between px-12 items-end">
               <div className="w-16 h-16 coquette-box rounded-full flex items-center justify-center">
                 <Camera className="w-8 h-8 text-pink-400" strokeWidth={1.5} />
               </div>
               <div className="flex flex-col items-center justify-center" onClick={() => setShowPasscode(true)}>
                 <div className="w-20 h-20 coquette-box rounded-full flex items-center justify-center animate-bounce cursor-pointer">
                   <Fingerprint className="w-10 h-10 text-pink-400" strokeWidth={1.5} />
                 </div>
                 <span className="text-pink-600 text-sm mt-3 font-medium bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">Vuốt lên để mở</span>
               </div>
               <div className="w-16 h-16 coquette-box rounded-full flex items-center justify-center">
                 <Settings className="w-8 h-8 text-pink-400" strokeWidth={1.5} />
               </div>
            </div>
          </motion.div>
        ) : (
          <Passcode onUnlock={onUnlock} expectedPasscode={passcode} onCancel={() => setShowPasscode(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Passcode({ onUnlock, expectedPasscode, onCancel }: { onUnlock: () => void, expectedPasscode: string, onCancel: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleKey = (key: string) => {
    if (input.length < 4) {
      const newVal = input + key;
      setInput(newVal);
      if (newVal.length === 4) {
        if (newVal === expectedPasscode) {
          setTimeout(onUnlock, 200);
        } else {
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center z-50"
    >
      <div className="text-pink-500 text-2xl font-medium mb-2 flex items-center gap-2">
        <Lock className="w-6 h-6 text-pink-400" /> Nhập mật khẩu <Lock className="w-6 h-6 text-pink-400" />
      </div>
      <p className="text-pink-400 mb-8 text-sm">Mật khẩu của công chúa là gì nhỉ?</p>
      
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-6 mb-16"
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 border-pink-300 transition-colors duration-300 ${input.length > i ? 'bg-pink-400 border-pink-400' : 'bg-transparent'}`} />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-x-10 gap-y-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handleKey(num.toString())} className="w-20 h-20 rounded-full coquette-box text-pink-500 text-3xl font-medium active:scale-95 transition-transform">
            {num}
          </button>
        ))}
        <button onClick={onCancel} className="w-20 h-20 rounded-full flex items-center justify-center text-pink-500 active:scale-95 transition-transform font-medium text-lg">
          Hủy
        </button>
        <button onClick={() => handleKey('0')} className="w-20 h-20 rounded-full coquette-box text-pink-500 text-3xl font-medium active:scale-95 transition-transform">
          0
        </button>
        <button onClick={() => setInput(input.slice(0, -1))} className="w-20 h-20 rounded-full flex items-center justify-center text-pink-500 active:scale-95 transition-transform">
          <Delete className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}

function HomeScreen({ openApp, customBg, customIcons }: { openApp: (app: string) => void, customBg: string | null, customIcons: Record<string, string> }) {
  const [page, setPage] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newPage = Math.round(scrollLeft / width);
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  return (
    <div 
      className={`relative w-full h-full bg-[#FAF9F6] overflow-hidden ${!customBg ? 'bg-home-pattern' : ''}`}
      style={customBg ? { 
        backgroundImage: `url(${customBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      {/* Pages container */}
      <div 
        className="flex w-full h-full pb-32 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        <div className="w-full shrink-0 h-full snap-center overflow-y-auto no-scrollbar"><Page1 openApp={openApp} customIcons={customIcons} /></div>
        <div className="w-full shrink-0 h-full snap-center overflow-y-auto no-scrollbar"><Page2 customIcons={customIcons} /></div>
        <div className="w-full shrink-0 h-full snap-center overflow-y-auto no-scrollbar"><Page3 /></div>
      </div>

      {/* Page Indicators */}
      <div className="fixed bottom-[110px] left-0 right-0 flex justify-center gap-3 z-40 pointer-events-none">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors shadow-sm ${page === i ? 'bg-pink-400' : 'bg-pink-200/80 backdrop-blur-sm'}`} />
        ))}
      </div>

      {/* Sticky Bottom Dock */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50">
        <div className="coquette-dock rounded-[35px] h-[90px] flex justify-around items-center px-4">
          <AppIcon id="chat" icon={<MessageCircle className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Chat" onClick={() => openApp('chat')} customIcon={customIcons['chat']} />
          <AppIcon id="preview" icon={<Eye className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Preview" onClick={() => {}} customIcon={customIcons['preview']} />
          <AppIcon id="diary" icon={<BookHeart className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Nhật ký" onClick={() => {}} customIcon={customIcons['diary']} />
          <AppIcon id="settings" icon={<Settings className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Cài đặt" onClick={() => openApp('settings')} customIcon={customIcons['settings']} />
        </div>
      </div>
    </div>
  );
}

function AppIcon({ id, icon, name, onClick, customIcon }: any) {
  return (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <div className="w-[60px] h-[60px] rounded-[20px] coquette-box flex items-center justify-center glow-pink overflow-hidden">
        {customIcon ? (
          <img src={customIcon} alt={name} className="w-full h-full object-cover" />
        ) : (
          icon
        )}
      </div>
      {name && <span className="text-[11px] text-pink-800 font-medium drop-shadow-sm">{name}</span>}
    </div>
  );
}

function Page1({ openApp, customIcons }: { openApp: (app: string) => void, customIcons: Record<string, string> }) {
  return (
    <div className="w-full min-h-full p-6 pt-16 grid grid-cols-4 gap-x-4 gap-y-8 auto-rows-max content-start">
      {/* 2x2 Widget */}
      <div className="col-span-2 row-span-2 aspect-square coquette-box flex flex-col items-center justify-center p-3 relative overflow-hidden">
        <img src="https://i.postimg.cc/9FnXQNpn/e1d0cd594c41440c5e1dadc28f25c69a.jpg" className="w-full h-full object-cover rounded-[16px]" alt="Widget" />
        <Heart className="absolute top-3 right-3 w-6 h-6 text-pink-400 fill-pink-400/30 drop-shadow-md" />
      </div>
      
      <AppIcon id="camera" icon={<Camera className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Camera" customIcon={customIcons['camera']} />
      <AppIcon id="calendar" icon={<Calendar className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Lịch" customIcon={customIcons['calendar']} />
      <AppIcon id="clock" icon={<Clock className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Đồng hồ" customIcon={customIcons['clock']} />
      <AppIcon id="music" icon={<Music className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Nhạc" customIcon={customIcons['music']} />

      {/* 4x2 Widget */}
      <div className="col-span-4 row-span-2 min-h-[140px] coquette-box p-5 flex items-center mt-2 relative overflow-hidden">
        <Flower2 className="absolute -right-4 -bottom-4 w-32 h-32 text-pink-200/40" strokeWidth={1} />
        <div className="flex-1 z-10">
          <h3 className="text-pink-600 font-bold text-xl flex items-center gap-2">
            <PenTool className="w-5 h-5 text-pink-500" /> Ghi chú nhỏ
          </h3>
          <p className="text-pink-800/80 text-sm mt-2 leading-relaxed">
            Đừng quên thiết lập API Key trong phần Cài đặt để trò chuyện với Kotokoo nhé! <Sparkles className="w-4 h-4 inline-block text-pink-400" />
          </p>
        </div>
      </div>
    </div>
  );
}

function Page2({ customIcons }: { customIcons: Record<string, string> }) {
  return (
    <div className="w-full min-h-full p-6 pt-16 grid grid-cols-4 gap-x-4 gap-y-8 auto-rows-max content-start">
      <AppIcon id="star" icon={<Star className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Sao" customIcon={customIcons['star']} />
      <AppIcon id="cloud" icon={<Cloud className="w-8 h-8 text-pink-400" strokeWidth={1.5} />} name="Mây" customIcon={customIcons['cloud']} />
      
      <div className="col-span-2 row-span-2 aspect-square coquette-box flex flex-col items-center justify-center p-4">
        <span className="text-pink-500 font-bold text-5xl drop-shadow-sm">5</span>
        <span className="text-pink-400 text-sm mt-2 font-medium flex items-center">
          Tin nhắn mới <Mail className="w-4 h-4 inline-block ml-1 text-pink-400" />
        </span>
      </div>
    </div>
  );
}

function Page3() {
  return (
    <div className="w-full min-h-full p-6 pt-16 flex flex-col items-center justify-center">
      <p className="text-pink-300 text-sm font-medium flex items-center">
        Trang trống <Flower2 className="w-4 h-4 inline-block ml-1 text-pink-300" />
      </p>
    </div>
  );
}

function SettingsApp({ onClose, passcode, setPasscode, apiKey, setApiKey, proxyUrl, setProxyUrl, selectedModel, setSelectedModel, customBg, setCustomBg, customIcons, setCustomIcons }: any) {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 1080, 1920, 0.8);
      await saveBackground('home_bg', base64);
      setCustomBg(base64);
      setSuccessMsg('Đã đổi hình nền thành công 🌸');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Lỗi khi tải ảnh lên 🥺');
    }
  };

  const handleIconUpload = async (appId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 200, 200, 0.8);
      await saveBackground(`icon_${appId}`, base64);
      setCustomIcons((prev: any) => ({ ...prev, [appId]: base64 }));
      setSuccessMsg('Đã đổi biểu tượng thành công 🎀');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Lỗi khi tải ảnh lên 🥺');
    }
  };

  const APP_LIST = [
    { id: 'chat', name: 'Chat' },
    { id: 'preview', name: 'Preview' },
    { id: 'diary', name: 'Nhật ký' },
    { id: 'settings', name: 'Cài đặt' },
    { id: 'camera', name: 'Camera' },
    { id: 'calendar', name: 'Lịch' },
    { id: 'clock', name: 'Đồng hồ' },
    { id: 'music', name: 'Nhạc' },
    { id: 'star', name: 'Sao' },
    { id: 'cloud', name: 'Mây' },
  ];

  const fetchModels = async () => {
    let finalUrl = proxyUrl.trim();
    if (!apiKey || !finalUrl) {
      alert('Vui lòng nhập đủ API Key và Proxy URL 🎀');
      return;
    }
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    setLoading(true);
    try {
      let url = finalUrl;
      if (!url.includes('/models')) {
        url = url.endsWith('/') ? `${url}models` : `${url}/models`;
      }
      
      let res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Fallback cho các proxy yêu cầu /v1/models nếu link gốc bị lỗi 404
      if (res.status === 404 && !finalUrl.includes('/v1')) {
        const fallbackUrl = finalUrl.endsWith('/') ? `${finalUrl}v1/models` : `${finalUrl}/v1/models`;
        res = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      }
      
      if (!res.ok) {
        throw new Error(`Lỗi HTTP: ${res.status} - Không thể kết nối đến Proxy`);
      }
      
      const data = await res.json();
      let modelList = [];
      if (data.data && Array.isArray(data.data)) {
        modelList = data.data;
      } else if (Array.isArray(data)) {
        modelList = data;
      } else {
        throw new Error('Định dạng dữ liệu model không hợp lệ từ Proxy');
      }
      
      setModels(modelList);
      
      // Tự động chọn model nếu danh sách có model và chưa có model nào được chọn hợp lệ
      if (modelList.length > 0) {
        const exists = modelList.find((m: any) => m.id === selectedModel);
        if (!exists) {
          setSelectedModel(modelList[0].id);
        }
      }
    } catch (e: any) {
      console.error("Fetch models error:", e);
      alert(`Lỗi khi lấy danh sách model: ${e.message} 🥺\nVui lòng kiểm tra lại URL proxy và API Key.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedModel) {
      alert('Công chúa chưa chọn model nào kìa 🥺');
      return;
    }
    // Lưu ngay lập tức vào bộ nhớ cục bộ để đảm bảo không bao giờ mất
    localStorage.setItem('kotokoo_selectedModel', selectedModel);
    localStorage.setItem('kotokoo_apiKey', apiKey);
    localStorage.setItem('kotokoo_proxyUrl', proxyUrl);
    localStorage.setItem('kotokoo_passcode', passcode);
    
    setSuccessMsg('Đã lưu thiết lập vĩnh viễn! Thoát app vẫn không mất 🌸🎀');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`absolute inset-0 bg-[#FAF9F6] z-50 flex flex-col ${!customBg ? 'bg-home-pattern' : ''}`}
      style={customBg ? { 
        backgroundImage: `url(${customBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      <div className="flex items-center p-4 bg-white/80 backdrop-blur-md pt-12 sticky top-0 z-10 border-b border-pink-100">
        <button onClick={onClose} className="text-pink-500 flex items-center bg-pink-50 px-3 py-1.5 rounded-full">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Trở về</span>
        </button>
        <h2 className="mx-auto text-xl font-bold text-pink-600 pr-24 flex items-center gap-2">
          <Settings className="w-6 h-6 text-pink-500" /> Cài đặt
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-pink-100 border border-pink-300 text-pink-700 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm"
            >
              <PartyPopper className="w-6 h-6 text-pink-500" />
              <span className="font-medium">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <section>
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" /> Tùy chỉnh giao diện
          </h3>
          <div className="coquette-box overflow-hidden divide-y divide-pink-100">
            <div className="p-5 flex justify-between items-center">
              <span className="text-pink-800 font-medium">Hình nền màn hình chính</span>
              <label className="cursor-pointer bg-pink-50 hover:bg-pink-100 text-pink-600 px-4 py-2 rounded-xl border border-pink-200 transition-colors flex items-center gap-2 text-sm font-medium">
                <Upload className="w-4 h-4" />
                Tải ảnh lên
                <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
              </label>
            </div>
            
            <div className="p-5">
              <span className="text-pink-800 font-medium block mb-4">Biểu tượng ứng dụng</span>
              <div className="grid grid-cols-2 gap-4">
                {APP_LIST.map(app => (
                  <div key={app.id} className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-pink-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center overflow-hidden border border-pink-200">
                        {customIcons[app.id] ? (
                          <img src={customIcons[app.id]} alt={app.name} className="w-full h-full object-cover" />
                        ) : (
                          <Heart className="w-5 h-5 text-pink-300" />
                        )}
                      </div>
                      <span className="text-sm text-pink-700 font-medium">{app.name}</span>
                    </div>
                    <label className="cursor-pointer text-pink-400 hover:text-pink-600 p-2">
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleIconUpload(app.id, e)} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-pink-400" /> Bảo mật
          </h3>
          <div className="coquette-box overflow-hidden">
            <div className="p-5 flex justify-between items-center">
              <span className="text-pink-800 font-medium">Mật khẩu màn hình khoá</span>
              <input 
                type="text" 
                maxLength={4}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                className="w-24 text-center text-pink-600 font-bold bg-pink-50 border border-pink-200 rounded-xl py-1 outline-none focus:border-pink-400"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3 ml-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" /> Kết nối AI
          </h3>
          <div className="coquette-box overflow-hidden divide-y divide-pink-100">
            <div className="p-5">
              <label className="block text-pink-800 font-medium mb-2">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API Key của công chúa..."
                className="w-full bg-white/80 border border-pink-200 rounded-xl px-4 py-3 text-pink-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all"
              />
            </div>
            <div className="p-5">
              <label className="block text-pink-800 font-medium mb-2">Proxy Ngược (v1)</label>
              <input 
                type="url" 
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                placeholder="https://your-proxy.com/v1"
                className="w-full bg-white/80 border border-pink-200 rounded-xl px-4 py-3 text-pink-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all"
              />
            </div>
            <div className="p-5">
              <button 
                onClick={fetchModels}
                disabled={loading}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Lấy danh sách Model
              </button>
            </div>

            {models.length > 0 && (
              <div className="p-5 bg-pink-50/50">
                <label className="block text-pink-800 font-medium mb-2">Chọn Model</label>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 text-pink-800 focus:outline-none focus:border-pink-400 mb-4"
                >
                  <option value="">-- Chọn model --</option>
                  {models.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.id}</option>
                  ))}
                </select>

                <button 
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  Lưu thiết lập
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function ChatApp({ onClose, selectedModel, proxyUrl, apiKey, customBg }: any) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`absolute inset-0 bg-[#FAF9F6] z-50 flex flex-col ${!customBg ? 'bg-home-pattern' : ''}`}
      style={customBg ? { 
        backgroundImage: `url(${customBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      {/* Header */}
      <div className="flex items-center p-4 bg-white/80 backdrop-blur-md pt-12 sticky top-0 z-10 border-b border-pink-100 shadow-sm">
        <button onClick={onClose} className="text-pink-500 flex items-center bg-pink-50 px-3 py-1.5 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-lg font-bold text-pink-600 flex items-center gap-2">
            Kotokoo <Sparkles className="w-5 h-5 text-pink-500" />
          </h2>
          <span className="text-xs text-pink-400 font-medium">
            {selectedModel ? `Model: ${selectedModel}` : 'Chưa chọn model'}
          </span>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="flex justify-start">
          <div className="coquette-box px-4 py-3 max-w-[80%] rounded-tl-none text-pink-800">
            Xin chào công chúa! Hôm nay người muốn trò chuyện về điều gì? <Heart className="w-4 h-4 inline-block ml-1 text-pink-400" />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-pink-100 pb-8 shadow-[0_-10px_20px_rgba(249,198,212,0.1)]">
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-pink-100 text-pink-500 rounded-full hover:bg-pink-200 transition-colors">
            <ImageIcon className="w-6 h-6" />
          </button>
          <input 
            type="text" 
            className="flex-1 bg-white border border-pink-200 rounded-full px-5 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 text-pink-900 shadow-inner" 
            placeholder="Nhắn tin cho Kotokoo..." 
          />
          <button className="p-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105">
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
