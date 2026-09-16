import React, { useState, useEffect } from 'react';
import { Sword, User, Plus, Check, X, Clock, Coins, Search, MessageCircle, Send, Trophy, Bell, BarChart3, ChevronDown, ChevronUp, Filter, GripVertical, Zap, Gem, Sparkles, Info, SlidersHorizontal } from 'lucide-react';

export default function LvlUpApp() {
  const [activeTab, setActiveTab] = useState('rewards'); // Empezar en Tienda para testing

  const [user, setUser] = useState({
    name: 'Héroe Empresarial',
    level: 5,
    xp: 1500,
    xpToNext: 2000,
    gold: 300,
    avatar: '⚔️',
    avatarColor: 'bg-blue-600'
  });

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Completa el tutorial', category: 'upcoming', dueDate: '2025-10-22', urgency: 'media', importance: 'alta', xpReward: 90, goldReward: 45, completed: false, assignedTo: 1, collaborators: [], comments: [] },
    { id: 2, title: 'Invita a un amigo', category: 'upcoming', dueDate: '2025-10-23', urgency: 'baja', importance: 'media', xpReward: 45, goldReward: 22, completed: false, assignedTo: 1, collaborators: [2], comments: [] },
    { id: 3, title: 'Diseña interfaz', category: 'review', dueDate: '2025-10-28', urgency: 'alta', importance: 'alta', xpReward: 120, goldReward: 60, completed: false, assignedTo: 2, collaborators: [1], comments: [] }
  ]);

  const [mockUsers] = useState([
    { id: 1, name: 'Juan Pérez', level: 8, department: 'Desarrollo', avatar: '👨‍💻', color: 'bg-blue-500' },
    { id: 2, name: 'María González', level: 12, department: 'Marketing', avatar: '👩‍💼', color: 'bg-pink-500' },
    { id: 3, name: 'Carlos Ramírez', level: 6, department: 'Ventas', avatar: '👨‍💼', color: 'bg-green-500' },
    { id: 4, name: 'Ana Martínez', level: 15, department: 'RRHH', avatar: '👩‍🎓', color: 'bg-purple-500' },
  ]);

  const [showNewTask, setShowNewTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignMode, setAssignMode] = useState('assign');
  const [taskTimers, setTaskTimers] = useState({});
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    urgency: 'all',
    importance: 'all',
    assignedTo: 'all',
    collaborator: 'all',
    sortBy: 'dueDate'
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [expandedSection, setExpandedSection] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [shopCategory, setShopCategory] = useState('main');
  const [wishlist, setWishlist] = useState([]);
  const [userPurchases, setUserPurchases] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [rarityFilter, setRarityFilter] = useState('all');
  
  // Estados para el modal de bienvenida y banner
  const [showShopWelcome, setShowShopWelcome] = useState(false);
  const [showShopBanner, setShowShopBanner] = useState(false);

  // ===== NUEVOS ESTADOS PARA FILTROS DE TIENDA (SINGLE-SELECT) =====
  const [showShopFilters, setShowShopFilters] = useState(false);
  const [shopFilters, setShopFilters] = useState({
    benefit: null,    // 'tiempo', 'experiencia', 'oro', 'proteccion' o null
    type: null,       // 'weapons', 'armor', 'potions' o null
    priceRange: null  // '0-100', '100-300', '300-500', '500+' o null
  });
  const [tempShopFilters, setTempShopFilters] = useState(shopFilters);
  
  // ===== ESTADOS PARA OFERTAS CON TIMER =====
  const [offerTimers, setOfferTimers] = useState({});

  const [newTask, setNewTask] = useState({
    title: '',
    urgency: 'media',
    importance: 'media',
    dueDate: '',
    assignedTo: 1
  });

  const rarityConfig = {
    common: {
      label: 'Común',
      icon: Zap,
      badgeColor: 'bg-gray-500',
      borderColor: 'border-gray-300',
      bgGradient: 'from-gray-50 to-gray-100'
    },
    rare: {
      label: 'Raro',
      icon: Gem,
      badgeColor: 'bg-blue-600',
      borderColor: 'border-blue-400',
      bgGradient: 'from-blue-50 to-cyan-100'
    },
    epic: {
      label: 'Épico',
      icon: Sparkles,
      badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
      borderColor: 'border-purple-400',
      bgGradient: 'from-purple-50 to-pink-100'
    }
  };

  // ===== CONFIGURACIÓN DE FILTROS DE TIENDA =====
  const benefitTypes = {
    tiempo: {
      label: 'Tiempo',
      icon: '⏰',
      color: 'bg-blue-500',
      keywords: ['hora', 'minuto', 'tiempo', 'congela', 'reduce', 'extiende', 'velocidad', 'inmunidad', 'no recibirás', 'congelación']
    },
    experiencia: {
      label: 'Experiencia',
      icon: '⚡',
      color: 'bg-yellow-500',
      keywords: ['xp', 'experiencia', 'x1.5', 'x2', 'x3', '%']
    },
    oro: {
      label: 'Oro',
      icon: '💰',
      color: 'bg-amber-500',
      keywords: ['gold', 'oro']
    },
    proteccion: {
      label: 'Protección',
      icon: '🛡️',
      color: 'bg-green-500',
      keywords: ['penalización', 'protección', 'sin penalizaciones']
    }
  };

  const priceRanges = [
    { id: '0-100', label: '< 100 gold', min: 0, max: 100 },
    { id: '100-300', label: '100-300 gold', min: 100, max: 300 },
    { id: '300-500', label: '300-500 gold', min: 300, max: 500 },
    { id: '500+', label: '> 500 gold', min: 500, max: Infinity }
  ];

  const [shopItems] = useState([
    // ========== COMÚN (50-100 gold) ==========
    { 
      id: 'p1', 
      name: 'Poción Energía', 
      category: 'potions',
      rarity: 'common',
      description: 'Aumenta tu productividad temporalmente', 
      benefit: '+5% XP en todas las misiones',
      icon: '🧪', 
      price: 60,
      discountPercentage: 0,
      isOffer: false,
      durationHours: 4,
      available: true,
      color: 'from-green-100 to-emerald-200',
      borderColor: 'border-green-300'
    },
    { 
      id: 'p2', 
      name: 'Elixir Enfoque', 
      category: 'potions',
      rarity: 'common',
      description: 'Mejora tu concentración', 
      benefit: 'Reduce 15min en 1 tarea',
      icon: '⚗️', 
      price: 75,
      discountPercentage: 15,
      isOffer: true,
      durationHours: 6,
      available: true,
      color: 'from-blue-100 to-cyan-200',
      borderColor: 'border-blue-300'
    },
    { 
      id: 'w1', 
      name: 'Daga Práctica', 
      category: 'weapons',
      rarity: 'common',
      description: 'Herramienta para tareas rutinarias', 
      benefit: '+10% XP en tareas de baja urgencia',
      icon: '🗡️', 
      price: 85,
      discountPercentage: 0,
      isOffer: false,
      durationHours: 8,
      available: true,
      color: 'from-teal-100 to-green-200',
      borderColor: 'border-teal-300'
    },
    { 
      id: 'a1', 
      name: 'Guantes de Cuero', 
      category: 'armor',
      rarity: 'common',
      description: 'Protección básica para tu desempeño', 
      benefit: '-20% penalización por retrasos',
      icon: '🧤', 
      price: 90,
      discountPercentage: 10,
      isOffer: true,
      durationHours: 12,
      available: true,
      color: 'from-brown-100 to-orange-200',
      borderColor: 'border-orange-300'
    },

    // ========== RARO (200-400 gold) ==========
    { 
      id: 'w2', 
      name: 'Espada de Acero', 
      category: 'weapons',
      rarity: 'rare',
      description: 'Bloquea nuevas asignaciones temporalmente', 
      benefit: 'No recibirás tareas por 2 horas',
      icon: '⚔️', 
      price: 280,
      discountPercentage: 15,
      isOffer: true,
      durationHours: 16,
      available: true,
      color: 'from-red-100 to-orange-200',
      borderColor: 'border-red-300'
    },
    { 
      id: 'w3', 
      name: 'Arco Élfico', 
      category: 'weapons',
      rarity: 'rare',
      description: 'Congela el tiempo de 1 misión', 
      benefit: '+1 hora en 1 tarea a tu elección',
      icon: '🏹', 
      price: 320,
      discountPercentage: 0,
      isOffer: false,
      durationHours: 18,
      available: true,
      color: 'from-cyan-100 to-blue-200',
      borderColor: 'border-cyan-300'
    },
    { 
      id: 'w4', 
      name: 'Báculo del Mago', 
      category: 'weapons',
      rarity: 'rare',
      description: 'Multiplica tu experiencia', 
      benefit: 'x1.5 XP en las próximas 2 misiones',
      icon: '🔮', 
      price: 360,
      discountPercentage: 20,
      isOffer: true,
      durationHours: 24,
      available: true,
      color: 'from-purple-100 to-indigo-200',
      borderColor: 'border-purple-300'
    },
    { 
      id: 'a2', 
      name: 'Armadura de Placas', 
      category: 'armor',
      rarity: 'rare',
      description: 'Protección avanzada contra penalizaciones', 
      benefit: '-50% penalización por 24h',
      icon: '🛡️', 
      price: 300,
      discountPercentage: 0,
      isOffer: false,
      durationHours: 24,
      available: true,
      color: 'from-amber-100 to-yellow-200',
      borderColor: 'border-amber-300'
    },
    { 
      id: 'a3', 
      name: 'Casco Estratega', 
      category: 'armor',
      rarity: 'rare',
      description: 'Mejora tu desempeño en tareas complejas', 
      benefit: '+30% XP en tareas de alta importancia',
      icon: '⛑️', 
      price: 340,
      discountPercentage: 10,
      isOffer: true,
      durationHours: 20,
      available: true,
      color: 'from-purple-100 to-indigo-200',
      borderColor: 'border-purple-300'
    },
    { 
      id: 'p3', 
      name: 'Poción Velocidad', 
      category: 'potions',
      rarity: 'rare',
      description: 'Acelera tu ritmo de trabajo', 
      benefit: '+40% velocidad por 6 horas',
      icon: '🍶', 
      price: 380,
      discountPercentage: 25,
      isOffer: true,
      durationHours: 10,
      available: true,
      color: 'from-yellow-100 to-amber-200',
      borderColor: 'border-yellow-300'
    },

    // ========== ÉPICO (500-800 gold) ==========
    { 
      id: 'w5', 
      name: 'Lanza Legendaria', 
      category: 'weapons',
      rarity: 'epic',
      description: 'Poder supremo para 3 misiones', 
      benefit: 'x2 XP + x2 Gold en 3 misiones',
      icon: '🔱', 
      price: 650,
      discountPercentage: 0,
      isOffer: false,
      durationHours: 48,
      available: true,
      color: 'from-yellow-100 to-amber-200',
      borderColor: 'border-yellow-400'
    },
    { 
      id: 'w6', 
      name: 'Espada del Dragón', 
      category: 'weapons',
      rarity: 'epic',
      description: 'Dominio total sobre tu productividad', 
      benefit: 'Inmunidad 6h + 50% XP extra',
      icon: '🐉', 
      price: 720,
      discountPercentage: 10,
      isOffer: true,
      durationHours: 36,
      available: true,
      color: 'from-red-100 to-orange-200',
      borderColor: 'border-red-400'
    },
    { 
      id: 'a4', 
      name: 'Armadura Celestial', 
      category: 'armor',
      rarity: 'epic',
      description: 'Protección divina y bonificación oro', 
      benefit: 'Sin penalizaciones + 25% Gold',
      icon: '✨', 
      price: 780,
      discountPercentage: 15,
      isOffer: true,
      durationHours: 48,
      available: true,
      color: 'from-blue-100 to-indigo-200',
      borderColor: 'border-blue-400'
    },
    { 
      id: 'p4', 
      name: 'Elixir Gran Maestro', 
      category: 'potions',
      rarity: 'epic',
      description: 'El poder definitivo', 
      benefit: 'x3 XP urgentes + congelación',
      icon: '🏆', 
      price: 550,
      discountPercentage: 0,
      isOffer: false,
      durationHours: 24,
      available: true,
      color: 'from-purple-100 to-pink-200',
      borderColor: 'border-purple-400'
    },
  ]);

  // ===== FUNCIONES DE CLASIFICACIÓN =====
  
  // Clasificar item por beneficio
  const getItemBenefitTypes = (item) => {
    const benefitText = (item.benefit + ' ' + item.description).toLowerCase();
    const types = [];
    
    Object.entries(benefitTypes).forEach(([key, config]) => {
      if (config.keywords.some(keyword => benefitText.includes(keyword))) {
        types.push(key);
      }
    });
    
    return types;
  };

  // Filtrar items de tienda (SINGLE-SELECT)
  const getFilteredShopItems = () => {
    let filtered = [...shopItems];

    // Filtro por rareza (ya existente)
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(item => item.rarity === rarityFilter);
    }

    // Filtro por beneficio (SINGLE-SELECT)
    if (shopFilters.benefit) {
      filtered = filtered.filter(item => {
        const itemBenefits = getItemBenefitTypes(item);
        return itemBenefits.includes(shopFilters.benefit);
      });
    }

    // Filtro por tipo (SINGLE-SELECT)
    if (shopFilters.type) {
      filtered = filtered.filter(item => item.category === shopFilters.type);
    }

    // Filtro por precio (SINGLE-SELECT)
    if (shopFilters.priceRange) {
      const range = priceRanges.find(r => r.id === shopFilters.priceRange);
      if (range) {
        filtered = filtered.filter(item => {
          const finalPrice = calculateFinalPrice(item);
          return finalPrice >= range.min && finalPrice < range.max;
        });
      }
    }

    return filtered;
  };

  // Contar filtros activos (SINGLE-SELECT)
  const getActiveShopFiltersCount = () => {
    let count = 0;
    if (shopFilters.benefit) count++;
    if (shopFilters.type) count++;
    if (shopFilters.priceRange) count++;
    return count;
  };

  // Toggle filtro (SINGLE-SELECT - actúa como radio button)
  const toggleShopFilter = (filterType, value) => {
    setTempShopFilters(prev => {
      const newFilters = { ...prev };
      
      // Si ya está seleccionado, deseleccionar
      if (newFilters[filterType] === value) {
        newFilters[filterType] = null;
      } else {
        // Si no, seleccionar (reemplaza el anterior)
        newFilters[filterType] = value;
      }
      
      return newFilters;
    });
  };

  // Aplicar filtros
  const applyShopFilters = () => {
    setShopFilters(tempShopFilters);
    setShowShopFilters(false);
  };

  // Limpiar filtros (SINGLE-SELECT)
  const clearShopFilters = () => {
    const emptyFilters = { benefit: null, type: null, priceRange: null };
    setShopFilters(emptyFilters);
    setTempShopFilters(emptyFilters);
  };

  // Verificar si hay cambios
  const hasShopFilterChanges = () => {
    return JSON.stringify(shopFilters) !== JSON.stringify(tempShopFilters);
  };

  const categoryConfig = {
    weapons: {
      title: 'Armas',
      icon: '⚔️',
      gradient: 'from-red-100 to-orange-100',
      border: 'border-red-200',
      hoverBorder: 'hover:border-red-300'
    },
    armor: {
      title: 'Armaduras',
      icon: '🛡️',
      gradient: 'from-blue-100 to-indigo-100',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300'
    },
    potions: {
      title: 'Pociones',
      icon: '🧪',
      gradient: 'from-green-100 to-emerald-100',
      border: 'border-green-200',
      hoverBorder: 'hover:border-green-300'
    }
  };

  // ... (resto del código: useEffect, handlers, etc. - mantener igual)
  // Solo voy a agregar las funciones relevantes y la UI

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
      body.modal-open { overflow: hidden; }
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .shimmer-effect {
        animation: shimmer 3s infinite;
        background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
        background-size: 1000px 100%;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      .animate-pulse-offer {
        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5), 0 0 10px rgba(239, 68, 68, 0.3); }
        50% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5); }
      }
      .glow-red {
        animation: glow 2s ease-in-out infinite;
      }
      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .overflow-x-auto::-webkit-scrollbar {
        height: 4px;
      }
      .overflow-x-auto::-webkit-scrollbar-track {
        background: transparent;
      }
      .overflow-x-auto::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.5);
        border-radius: 2px;
      }
      @media (min-width: 475px) {
        .xs\\:inline { display: inline; }
        .xs\\:block { display: block; }
        .xs\\:hidden { display: none; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (showShopFilters) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showShopFilters]);

  // ===== TIMER PARA OFERTAS =====
  useEffect(() => {
    const updateOfferTimers = () => {
      const offerItems = shopItems.filter(item => item.isOffer);
      const newTimers = {};
      
      offerItems.forEach(item => {
        // Simulamos que la oferta expira en X horas desde ahora
        // En producción, cada item tendría un campo offerExpiresAt
        const hoursUntilExpiry = item.durationHours; // Usar duración como tiempo de oferta
        const expiryTime = new Date(Date.now() + hoursUntilExpiry * 60 * 60 * 1000);
        const now = new Date();
        const diff = expiryTime - now;
        
        if (diff <= 0) {
          newTimers[item.id] = { expired: true, text: 'Expirada', isPulse: false };
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          // Determinar si debe pulsar (menos de 1 hora)
          const isPulse = hours === 0;
          
          if (hours > 0) {
            newTimers[item.id] = {
              expired: false,
              text: `${hours}h ${minutes}m`,
              isPulse: false,
              color: 'text-orange-600'
            };
          } else if (minutes > 0) {
            newTimers[item.id] = {
              expired: false,
              text: `${minutes}m ${seconds}s`,
              isPulse: isPulse,
              color: 'text-red-600'
            };
          } else {
            newTimers[item.id] = {
              expired: false,
              text: `${seconds}s`,
              isPulse: true,
              color: 'text-red-600'
            };
          }
        }
      });
      
      setOfferTimers(newTimers);
    };
    
    updateOfferTimers();
    const interval = setInterval(updateOfferTimers, 1000);
    return () => clearInterval(interval);
  }, [shopItems]);

  const calculateFinalPrice = (item) => {
    if (item.isOffer && item.discountPercentage > 0) {
      return Math.floor(item.price - (item.price * (item.discountPercentage / 100)));
    }
    return item.price;
  };

  const toggleWishlist = (itemId) => {
    if (wishlist.includes(itemId)) {
      setWishlist(wishlist.filter(id => id !== itemId));
    } else {
      setWishlist([...wishlist, itemId]);
    }
  };

  const isPurchased = (itemId) => {
    return userPurchases.some(p => p.itemId === itemId && p.isActive && new Date(p.expiresAt) > new Date());
  };

  const openPurchaseModal = (item) => {
    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const purchaseItem = () => {
    if (!selectedItem) return;
    const finalPrice = calculateFinalPrice(selectedItem);
    if (user.gold < finalPrice) {
      alert('No tienes suficiente oro para comprar este ítem.');
      setShowPurchaseModal(false);
      return;
    }
    const purchase = {
      id: Date.now(),
      userId: 1,
      itemId: selectedItem.id,
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + selectedItem.durationHours * 60 * 60 * 1000).toISOString(),
      isActive: true
    };
    setUserPurchases([...userPurchases, purchase]);
    setUser({ ...user, gold: user.gold - finalPrice });
    setShowPurchaseModal(false);
    alert('¡Compra realizada con éxito!');
  };

  const getItemsByCategory = (category) => {
    const filteredItems = getFilteredShopItems();
    return filteredItems.filter(item => item.category === category && item.available);
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 sm:px-4 py-2 sm:py-3 shadow-lg">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <div className="text-xl sm:text-2xl font-bold">LVL UP!</div>
          <div className="flex-1 max-w-sm sm:max-w-md relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-white text-gray-800 rounded-full text-xs sm:text-sm focus:outline-none" 
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm min-h-[32px]">
              <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-semibold">{user.gold}</span>
            </div>
            <span className="text-xs sm:text-sm bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap min-h-[32px] flex items-center">
              Nivel {user.level}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'rewards' && (
          <div>
            {/* Header con botón de filtros */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tienda</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  Mejora tu productividad con estos recursos
                  {getActiveShopFiltersCount() > 0 && (
                    <span className="ml-2 text-blue-600 font-semibold">
                      ({getFilteredShopItems().length} ítems)
                    </span>
                  )}
                </p>
              </div>
              
              <button
                onClick={() => {
                  setTempShopFilters(shopFilters);
                  setShowShopFilters(true);
                }}
                className="bg-white border-2 border-gray-300 text-gray-800 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-colors relative min-h-[44px] shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-semibold">Filtros Avanzados</span>
                {getActiveShopFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                    {getActiveShopFiltersCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Filtros de rareza (mantener existentes) */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              <button 
                onClick={() => setRarityFilter('all')} 
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors min-h-[44px] ${
                  rarityFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Todos
              </button>
              {Object.entries(rarityConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button 
                    key={key}
                    onClick={() => setRarityFilter(key)} 
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 sm:gap-2 transition-colors min-h-[44px] ${
                      rarityFilter === key 
                        ? config.badgeColor + ' text-white' 
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* Chips de filtros activos (SINGLE-SELECT) */}
            {getActiveShopFiltersCount() > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {shopFilters.benefit && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span>{benefitTypes[shopFilters.benefit].icon}</span>
                    <span>{benefitTypes[shopFilters.benefit].label}</span>
                    <button 
                      onClick={() => {
                        setShopFilters(prev => ({ ...prev, benefit: null }));
                        setTempShopFilters(prev => ({ ...prev, benefit: null }));
                      }}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {shopFilters.type && (
                  <div className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span>{categoryConfig[shopFilters.type].icon}</span>
                    <span>{categoryConfig[shopFilters.type].title}</span>
                    <button 
                      onClick={() => {
                        setShopFilters(prev => ({ ...prev, type: null }));
                        setTempShopFilters(prev => ({ ...prev, type: null }));
                      }}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {shopFilters.priceRange && (
                  <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <span>💰</span>
                    <span>{priceRanges.find(r => r.id === shopFilters.priceRange)?.label}</span>
                    <button 
                      onClick={() => {
                        setShopFilters(prev => ({ ...prev, priceRange: null }));
                        setTempShopFilters(prev => ({ ...prev, priceRange: null }));
                      }}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={clearShopFilters}
                  className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-red-200"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Lista de categorías con items filtrados */}
            {shopCategory === 'main' && (
              <div className="space-y-4">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const categoryItems = getItemsByCategory(key);
                  if (categoryItems.length === 0 && getActiveShopFiltersCount() > 0) return null;
                  
                  return (
                    <div key={key} className={`bg-gradient-to-br ${config.gradient} rounded-lg shadow-lg border-2 ${config.border} transition-all duration-300`}>
                      <button 
                        onClick={() => toggleCategory(key)} 
                        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-white/20 transition-colors rounded-t-lg"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-3xl sm:text-4xl md:text-5xl">{config.icon}</div>
                          <div className="text-left">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{config.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {categoryItems.length} {categoryItems.length === 1 ? 'ítem' : 'ítems'} 
                              {getActiveShopFiltersCount() > 0 && ' (filtrados)'}
                            </p>
                          </div>
                        </div>
                        <div className={`transform transition-transform duration-300 ${expandedCategory === key ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                        </div>
                      </button>

                      <div 
                        className="overflow-hidden transition-all duration-500 ease-in-out" 
                        style={{ 
                          maxHeight: expandedCategory === key ? '3000px' : '0px', 
                          opacity: expandedCategory === key ? 1 : 0 
                        }}
                      >
                        <div className="p-4 sm:p-6 pt-0">
                          {categoryItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No hay ítems que coincidan con los filtros</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                              {categoryItems.map(item => {
                                const RarityIcon = rarityConfig[item.rarity].icon;
                                const itemBenefits = getItemBenefitTypes(item);
                                
                                return (
                                  <div 
                                    key={item.id} 
                                    className={`bg-gradient-to-br ${item.color} rounded-xl shadow-lg border-3 ${item.borderColor} transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden ${
                                      item.rarity === 'epic' ? 'ring-2 ring-yellow-400 shimmer-effect' : ''
                                    }`}
                                  >
                                    {/* Badge de rareza */}
                                    <div className={`absolute top-2 left-2 ${rarityConfig[item.rarity].badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 flex items-center gap-1`}>
                                      <RarityIcon className="w-3 h-3" />
                                      {rarityConfig[item.rarity].label}
                                    </div>

                                    {/* Badges de beneficio */}
                                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                                      {itemBenefits.map(benefitType => (
                                        <div 
                                          key={benefitType}
                                          className={`${benefitTypes[benefitType].color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-md`}
                                          title={benefitTypes[benefitType].label}
                                        >
                                          {benefitTypes[benefitType].icon}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Badge OFERTA mejorado con timer */}
                                    {item.isOffer && (
                                      <div className="absolute top-12 right-2 z-10 flex flex-col gap-1 items-end">
                                        <div className={`bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${offerTimers[item.id]?.isPulse ? 'animate-pulse-offer glow-red' : ''}`}>
                                          <div className="flex items-center gap-1">
                                            <span className="text-base">🔥</span>
                                            <span>-{item.discountPercentage}% OFF</span>
                                          </div>
                                        </div>
                                        {offerTimers[item.id] && !offerTimers[item.id].expired && (
                                          <div className={`bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md backdrop-blur ${offerTimers[item.id].isPulse ? 'animate-pulse-offer' : ''}`}>
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              <span>{offerTimers[item.id].text}</span>
                                            </div>
                                          </div>
                                        )}
                                        {offerTimers[item.id]?.expired && (
                                          <div className="bg-gray-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                                            ⏰ Expirada
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className="p-3 sm:p-4 md:p-5 pt-12 sm:pt-14">
                                      <div className="flex gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                                        <div className="flex-shrink-0">
                                          <div className="bg-white/80 backdrop-blur rounded-lg p-2 sm:p-3 shadow-md border-2 border-gray-300">
                                            <div className="text-center">
                                              <div className="text-2xl sm:text-3xl font-bold text-gray-800">{item.durationHours}</div>
                                              <div className="text-xs font-semibold text-gray-600">Hrs</div>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between mb-2 gap-2">
                                            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                                              <div className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">{item.icon}</div>
                                              <h4 
                                                className="font-black text-base sm:text-lg md:text-xl text-gray-900 leading-tight truncate" 
                                                title={item.name}
                                              >
                                                {item.name}
                                              </h4>
                                            </div>
                                            <button 
                                              onClick={() => toggleWishlist(item.id)} 
                                              className="text-xl sm:text-2xl flex-shrink-0 hover:scale-125 transition-transform drop-shadow-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                                              aria-label="Agregar a favoritos"
                                            >
                                              {wishlist.includes(item.id) ? '💖' : '🤍'}
                                            </button>
                                          </div>

                                          <div className="bg-white/60 backdrop-blur rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 mb-2 border border-gray-300">
                                            <p 
                                              className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2" 
                                              title={item.description}
                                            >
                                              {item.description}
                                            </p>
                                          </div>

                                          <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-amber-500 shadow-md">
                                            <div className="flex items-start gap-1 sm:gap-2">
                                              <span className="text-base sm:text-lg flex-shrink-0">✨</span>
                                              <p 
                                                className="text-xs sm:text-sm font-bold text-amber-900 leading-tight line-clamp-2" 
                                                title={item.benefit}
                                              >
                                                {item.benefit}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-2 sm:pt-3 border-t-2 border-white/40 gap-2">
                                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                          {item.isOffer ? (
                                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                              <span className="text-gray-500 line-through text-xs sm:text-sm font-semibold">{item.price}</span>
                                              <div className="flex items-center gap-1 bg-amber-500 px-2 sm:px-3 py-1 rounded-full shadow-md">
                                                <span className="text-lg sm:text-xl md:text-2xl font-black text-white">{calculateFinalPrice(item)}</span>
                                                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1 bg-amber-500 px-2 sm:px-3 py-1 rounded-full shadow-md">
                                              <span className="text-lg sm:text-xl md:text-2xl font-black text-white">{item.price}</span>
                                              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <button 
                                          onClick={() => openPurchaseModal(item)} 
                                          disabled={isPurchased(item.id)} 
                                          className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg transition-all min-h-[44px] whitespace-nowrap ${
                                            isPurchased(item.id) 
                                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95'
                                          }`}
                                        >
                                          {isPurchased(item.id) ? '✓ EQUIPADO' : 'COMPRAR'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Placeholder para otras tabs */}
        {activeTab !== 'rewards' && (
          <div className="text-center py-12 text-gray-500">
            <p>Contenido de {activeTab}</p>
          </div>
        )}
      </div>

      {/* Modal de Filtros Avanzados */}
      {showShopFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center" onClick={() => setShowShopFilters(false)}>
          <div 
            className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col animate-slide-up h-[85vh] md:h-auto md:max-h-[80vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <SlidersHorizontal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Filtros Avanzados</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Encuentra exactamente lo que necesitas</p>
                </div>
              </div>
              <button onClick={() => setShowShopFilters(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Filtro por Beneficio (SINGLE-SELECT) */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm">
                    Por Beneficio
                  </span>
                  <span className="text-xs text-gray-500">(selecciona uno)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(benefitTypes).map(([key, config]) => {
                    const isSelected = tempShopFilters.benefit === key;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleShopFilter('benefit', key)}
                        className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[70px] ${
                          isSelected
                            ? `${config.color} text-white border-transparent shadow-lg scale-105`
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {/* Radio indicator */}
                        <div className={`absolute top-2 left-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-white bg-white' : 'border-gray-400 bg-white'
                        }`}>
                          {isSelected && (
                            <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
                          )}
                        </div>
                        <div className="text-2xl sm:text-3xl mb-1">{config.icon}</div>
                        <div className="text-xs sm:text-sm font-bold">{config.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro por Tipo (SINGLE-SELECT) */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm">
                    Por Tipo
                  </span>
                  <span className="text-xs text-gray-500">(selecciona uno)</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const isSelected = tempShopFilters.type === key;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleShopFilter('type', key)}
                        className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[80px] ${
                          isSelected
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-transparent shadow-lg scale-105'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {/* Radio indicator */}
                        <div className={`absolute top-2 left-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-white bg-white' : 'border-gray-400 bg-white'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          )}
                        </div>
                        <div className="text-2xl sm:text-3xl mb-1">{config.icon}</div>
                        <div className="text-xs sm:text-sm font-bold">{config.title}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro por Precio (SINGLE-SELECT) */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                    Por Precio
                  </span>
                  <span className="text-xs text-gray-500">(selecciona uno)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {priceRanges.map(range => {
                    const isSelected = tempShopFilters.priceRange === range.id;
                    return (
                      <button
                        key={range.id}
                        onClick={() => toggleShopFilter('priceRange', range.id)}
                        className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[70px] ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-transparent shadow-lg scale-105'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {/* Radio indicator */}
                        <div className={`absolute top-2 left-2 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-white bg-white' : 'border-gray-400 bg-white'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          )}
                        </div>
                        <div className="text-xl sm:text-2xl mb-1">💰</div>
                        <div className="text-xs sm:text-sm font-bold">{range.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="p-4 sm:p-6 border-t bg-gray-50 flex gap-3 flex-shrink-0">
              <button
                onClick={clearShopFilters}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={applyShopFilters}
                disabled={!hasShopFilterChanges()}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  hasShopFilterChanges()
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compra */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">{selectedItem.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.name}</h3>
              <p className="text-gray-600 text-sm">{selectedItem.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Precio:</span>
                {selectedItem.isOffer ? (
                  <div className="text-right">
                    <div className="text-gray-400 line-through text-sm">{selectedItem.price} oro</div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xl font-bold text-amber-600">{calculateFinalPrice(selectedItem)}</span>
                      <Coins className="w-5 h-5 text-amber-600" />
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">-{selectedItem.discountPercentage}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-amber-600">{selectedItem.price}</span>
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vigencia:</span>
                <span className="font-semibold text-gray-800">{selectedItem.durationHours} horas</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-600">Tu oro actual:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">{user.gold}</span>
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Oro después:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${user.gold - calculateFinalPrice(selectedItem) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {user.gold - calculateFinalPrice(selectedItem)}
                  </span>
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>

            {user.gold < calculateFinalPrice(selectedItem) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm font-semibold text-center">
                  ⚠️ No tienes suficiente oro para esta compra
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPurchaseModal(false)} 
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={purchaseItem}
                disabled={user.gold < calculateFinalPrice(selectedItem)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  user.gold < calculateFinalPrice(selectedItem)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-around items-center h-14 sm:h-16 shadow-lg z-50">
        <button 
          onClick={() => setActiveTab('missions')} 
          className={`flex flex-col items-center justify-center h-full px-2 sm:px-4 min-w-[60px] ${activeTab === 'missions' ? 'text-white' : 'text-blue-200'}`}
        >
          <Sword className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
          <span className="text-[10px] sm:text-xs font-medium">Misiones</span>
        </button>
        <button 
          onClick={() => setActiveTab('rewards')} 
          className={`flex flex-col items-center justify-center h-full px-2 sm:px-4 min-w-[60px] ${activeTab === 'rewards' ? 'text-white' : 'text-blue-200'}`}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
          <span className="text-[10px] sm:text-xs font-medium">Tienda</span>
        </button>
        <button 
          onClick={() => setActiveTab('notifications')} 
          className={`flex flex-col items-center justify-center h-full px-2 sm:px-4 min-w-[60px] relative ${activeTab === 'notifications' ? 'text-white' : 'text-blue-200'}`}
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
          <span className="text-[10px] sm:text-xs font-medium">Alertas</span>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute top-1 sm:top-2 right-2 sm:right-3 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('leaders')} 
          className={`flex flex-col items-center justify-center h-full px-2 sm:px-4 min-w-[60px] ${activeTab === 'leaders' ? 'text-white' : 'text-blue-200'}`}
        >
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
          <span className="text-[10px] sm:text-xs font-medium">Líderes</span>
        </button>
        <button 
          onClick={() => setActiveTab('hero')} 
          className={`flex flex-col items-center justify-center h-full px-2 sm:px-4 min-w-[60px] ${activeTab === 'hero' ? 'text-white' : 'text-blue-200'}`}
        >
          <User className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
          <span className="text-[10px] sm:text-xs font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
}
