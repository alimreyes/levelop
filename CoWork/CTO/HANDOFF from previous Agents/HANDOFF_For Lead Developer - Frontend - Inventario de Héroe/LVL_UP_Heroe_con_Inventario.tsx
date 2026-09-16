import React, { useState, useEffect } from 'react';
import { Sword, User, Plus, Check, X, Clock, Coins, Search, MessageCircle, Send, Trophy, Bell, BarChart3, ChevronDown, ChevronUp, LogOut, Filter, GripVertical, TrendingUp, TrendingDown, Package, Shield, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function LvlUpApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('missions');
  const [heroSubTab, setHeroSubTab] = useState('profile'); // 'profile' o 'inventory'

  const [user, setUser] = useState({
    name: 'Héroe Empresarial',
    level: 5,
    xp: 1500,
    xpToNext: 2000,
    gold: 500,
    avatar: '⚔️',
    avatarColor: 'bg-blue-600'
  });

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Completa el tutorial', category: 'upcoming', dueDate: '2025-11-15', urgency: 'media', importance: 'alta', xpReward: 100, goldReward: 50, completed: false, assignedTo: 1, collaborators: [], comments: [] },
    { id: 2, title: 'Invita a un amigo', category: 'upcoming', dueDate: '2025-11-20', urgency: 'baja', importance: 'media', xpReward: 200, goldReward: 100, completed: false, assignedTo: 1, collaborators: [], comments: [] },
    { id: 3, title: 'Diseña interfaz', category: 'review', dueDate: '2025-11-28', urgency: 'alta', importance: 'alta', xpReward: 300, goldReward: 150, completed: false, assignedTo: 2, collaborators: [], comments: [] }
  ]);

  const [mockUsers] = useState([
    { id: 1, name: 'Juan Pérez', level: 8, department: 'Desarrollo', avatar: '👨‍💻', color: 'bg-blue-500', xp: 2400, tasksCompleted: 45, gold: 1200 },
    { id: 2, name: 'María González', level: 12, department: 'Marketing', avatar: '👩‍💼', color: 'bg-pink-500', xp: 3800, tasksCompleted: 67, gold: 1900 },
    { id: 3, name: 'Carlos Ramírez', level: 6, department: 'Ventas', avatar: '👨‍💼', color: 'bg-green-500', xp: 1800, tasksCompleted: 32, gold: 900 },
    { id: 4, name: 'Ana Martínez', level: 15, department: 'RRHH', avatar: '👩‍🎓', color: 'bg-purple-500', xp: 4500, tasksCompleted: 89, gold: 2300 },
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
  const [userPurchases, setUserPurchases] = useState([
    // Agregamos algunas compras de ejemplo
    {
      id: 1,
      userId: 1,
      itemId: 'w2',
      purchasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      isActive: false,
      equipped: false
    },
    {
      id: 2,
      userId: 1,
      itemId: 'a2',
      purchasedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      equipped: true
    },
    {
      id: 3,
      userId: 1,
      itemId: 'p1',
      purchasedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      isActive: false,
      equipped: false
    }
  ]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
  const [showCharts, setShowCharts] = useState(false);
  const [itemTimers, setItemTimers] = useState({}); // Para countdown de ítems
  const [equipAnimation, setEquipAnimation] = useState(null); // Para animaciones

  const [newTask, setNewTask] = useState({
    title: '',
    urgency: 'media',
    importance: 'media',
    dueDate: '',
    assignedTo: 1
  });

  const [shopItems] = useState([
    { id: 'w1', name: 'Arco de Hielo', category: 'weapons', description: 'Congela las misiones durante 50 minutos.', benefit: 'Tendrás 50 minutos adicionales en 1 tarea.', icon: '🏹', price: 50, discountPercentage: 0, isOffer: false, durationHours: 8, available: true, color: 'from-cyan-100 to-blue-200', borderColor: 'border-cyan-300' },
    { id: 'w2', name: 'Espada de Fuego', category: 'weapons', description: 'Quema las misiones durante 1 hora.', benefit: 'No podrán asignarte tareas nuevas por 1 hora.', icon: '⚔️', price: 75, discountPercentage: 20, isOffer: true, durationHours: 12, available: true, color: 'from-red-100 to-orange-200', borderColor: 'border-red-300' },
    { id: 'a1', name: 'Coraza del Amanecer', category: 'armor', description: 'Protege tu desempeño.', benefit: 'Reduce en 50% la penalización por tareas atrasadas.', icon: '🛡️', price: 80, discountPercentage: 0, isOffer: false, durationHours: 24, available: true, color: 'from-amber-100 to-yellow-200', borderColor: 'border-amber-300' },
    { id: 'a2', name: 'Casco del Sabio', category: 'armor', description: 'Aumenta tu concentración.', benefit: 'Ganas +25% de experiencia en misiones difíciles.', icon: '⛑️', price: 65, discountPercentage: 25, isOffer: true, durationHours: 18, available: true, color: 'from-purple-100 to-indigo-200', borderColor: 'border-purple-300' },
    { id: 'p1', name: 'Poción de Energía', category: 'potions', description: 'Aumenta tu energía temporalmente.', benefit: 'Obtienes +10% de experiencia en todas las misiones activas.', icon: '🧪', price: 40, discountPercentage: 0, isOffer: false, durationHours: 6, available: true, color: 'from-green-100 to-emerald-200', borderColor: 'border-green-300' },
    { id: 'p2', name: 'Elixir de Claridad', category: 'potions', description: 'Despeja tu mente.', benefit: 'Reduce el tiempo de 1 misión en 1 hora.', icon: '⚗️', price: 55, discountPercentage: 30, isOffer: true, durationHours: 8, available: true, color: 'from-blue-100 to-cyan-200', borderColor: 'border-blue-300' },
  ]);

  const categoryLabels = {
    upcoming: 'Próximas Misiones',
    review: 'En Revisión',
    delayed: 'Retrasadas',
    completed: 'Completadas'
  };

  const availableAvatars = [
    { icon: '⚔️', name: 'Guerrero', color: 'bg-blue-600' },
    { icon: '🧙‍♂️', name: 'Mago', color: 'bg-purple-600' },
    { icon: '🏹', name: 'Arquero', color: 'bg-green-600' },
    { icon: '🛡️', name: 'Paladín', color: 'bg-yellow-600' }
  ];

  const [achievements] = useState([
    { id: 1, name: 'Primera Tarea', icon: '🎯', description: 'Completa tu primera tarea', type: 'daily', completed: true },
    { id: 2, name: 'Racha de 3 días', icon: '🔥', description: 'Mantén una racha de 3 días', type: 'daily', completed: true },
    { id: 3, name: '5 Tareas Diarias', icon: '⚡', description: 'Completa 5 tareas en un día', type: 'daily', completed: false, progress: 3, total: 5 },
    { id: 4, name: 'Colaborador', icon: '🤝', description: 'Trabaja con otros', type: 'weekly', completed: true }
  ]);

  const [historicalData] = useState([
    { date: '2025-11-05', xp: 1200, gold: 400, tasks: 3, level: 4 },
    { date: '2025-11-06', xp: 1350, gold: 450, tasks: 4, level: 5 },
    { date: '2025-11-07', xp: 1500, gold: 500, tasks: 5, level: 5 },
    { date: '2025-11-08', xp: 1650, gold: 550, tasks: 4, level: 5 },
    { date: '2025-11-09', xp: 1800, gold: 600, tasks: 6, level: 5 },
    { date: '2025-11-10', xp: 1950, gold: 650, tasks: 5, level: 5 },
    { date: '2025-11-11', xp: 2100, gold: 700, tasks: 7, level: 6 },
  ]);

  // Estilos y animaciones
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes equipPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      }
      @keyframes unequipFade {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0.7; transform: scale(0.95); }
      }
      @keyframes countdownWarning {
        0%, 100% { color: rgb(239, 68, 68); }
        50% { color: rgb(220, 38, 38); }
      }
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
      .animate-equip-pulse { animation: equipPulse 0.6s ease-out; }
      .animate-unequip-fade { animation: unequipFade 0.3s ease-out; }
      .animate-countdown-warning { animation: countdownWarning 1s ease-in-out infinite; }
      body.modal-open { overflow: hidden; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (showFilters) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [showFilters]);

  // Timer para tareas
  useEffect(() => {
    const updateTimers = () => {
      const upcomingTasks = tasks.filter(t => t.category === 'upcoming');
      const newTimers = {};
      upcomingTasks.forEach(task => {
        newTimers[task.id] = calculateTimeRemaining(task.dueDate);
      });
      setTaskTimers(newTimers);
    };
    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Timer para ítems del inventario
  useEffect(() => {
    const updateItemTimers = () => {
      const newTimers = {};
      userPurchases.forEach(purchase => {
        const remaining = calculateItemTimeRemaining(purchase.expiresAt);
        newTimers[purchase.id] = remaining;
        
        // Notificar cuando un ítem expira
        if (remaining.expired && purchase.equipped) {
          const item = getItemById(purchase.itemId);
          if (item) {
            const notification = {
              id: Date.now() + purchase.id,
              type: 'item_expired',
              from: 'Inventario',
              message: `"${item.name}" ha expirado`,
              timestamp: new Date().toISOString(),
              read: false
            };
            setNotifications(prev => {
              // Evitar duplicados
              if (!prev.find(n => n.type === 'item_expired' && n.message.includes(item.name))) {
                return [notification, ...prev];
              }
              return prev;
            });
            
            // Desequipar automáticamente
            setUserPurchases(prev => prev.map(p => 
              p.id === purchase.id ? { ...p, equipped: false, isActive: false } : p
            ));
          }
        }
      });
      setItemTimers(newTimers);
    };
    
    updateItemTimers();
    const interval = setInterval(updateItemTimers, 1000);
    return () => clearInterval(interval);
  }, [userPurchases]);

  const handleLogin = () => {
    if (username === 'prueba' && password === '123456789') {
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('missions');
  };

  const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff < 0) return { expired: true, text: 'Vencida', color: 'text-red-600', bgColor: 'bg-red-100' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      if (days === 1) return { expired: false, text: 'Entrega mañana', color: 'text-orange-600', bgColor: 'bg-orange-100' };
      return { expired: false, text: `Entrega en ${days} días`, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    }
    if (hours > 0) {
      return { expired: false, text: `Faltan ${hours} horas`, color: hours < 3 ? 'text-orange-600' : 'text-blue-600', bgColor: hours < 3 ? 'bg-orange-100' : 'bg-blue-100' };
    }
    return { expired: false, text: `Faltan ${minutes} minutos`, color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const calculateItemTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff < 0) return { 
      expired: true, 
      text: 'Expirado', 
      color: 'text-gray-400',
      warning: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const hours = totalHours;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const warning = totalHours < 1; // Advertencia si queda menos de 1 hora
    
    if (hours > 0) {
      return { 
        expired: false, 
        text: `${hours}h ${minutes}m`, 
        color: warning ? 'text-orange-600' : 'text-blue-600',
        warning,
        hours,
        minutes,
        seconds
      };
    }
    
    return { 
      expired: false, 
      text: `${minutes}m ${seconds}s`, 
      color: 'text-red-600',
      warning: true,
      hours: 0,
      minutes,
      seconds
    };
  };

  const getDeadlineLabel = (dueDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: '🚨' };
    if (diffDays === 0) return { label: 'Hoy', color: 'bg-orange-100 text-orange-700', icon: '⏰' };
    if (diffDays === 1) return { label: 'Mañana', color: 'bg-yellow-100 text-yellow-700', icon: '📅' };
    if (diffDays <= 7) return { label: 'Esta semana', color: 'bg-blue-100 text-blue-700', icon: '📆' };
    return { label: 'Próximamente', color: 'bg-gray-100 text-gray-700', icon: '🗓️' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const formatCommentTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    return 'Hace poco';
  };

  const getUserById = (userId) => mockUsers.find(u => u.id === userId);
  
  const getItemById = (itemId) => shopItems.find(i => i.id === itemId);

  const getCategoryTasks = (category) => {
    let filtered = tasks.filter(t => t.category === category);
    if (searchQuery) filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filters.urgency !== 'all') filtered = filtered.filter(t => t.urgency === filters.urgency);
    if (filters.importance !== 'all') filtered = filtered.filter(t => t.importance === filters.importance);
    if (filters.assignedTo !== 'all') filtered = filtered.filter(t => t.assignedTo === parseInt(filters.assignedTo));
    if (filters.collaborator !== 'all') filtered = filtered.filter(t => t.collaborators?.includes(parseInt(filters.collaborator)));
    if (filters.sortBy === 'dueDate') filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    else if (filters.sortBy === 'xpReward') filtered.sort((a, b) => b.xpReward - a.xpReward);
    else if (filters.sortBy === 'urgency') {
      const urgencyOrder = { alta: 3, media: 2, baja: 1 };
      filtered.sort((a, b) => urgencyOrder[b.urgency] - urgencyOrder[a.urgency]);
    }
    return filtered;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.urgency !== 'all') count++;
    if (filters.importance !== 'all') count++;
    if (filters.assignedTo !== 'all') count++;
    if (filters.collaborator !== 'all') count++;
    if (filters.sortBy !== 'dueDate') count++;
    return count;
  };

  const clearFilters = () => {
    const resetFilters = { urgency: 'all', importance: 'all', assignedTo: 'all', collaborator: 'all', sortBy: 'dueDate' };
    setFilters(resetFilters);
    setTempFilters(resetFilters);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const openFiltersModal = () => {
    setTempFilters(filters);
    setShowFilters(true);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const hasFilterChanges = () => {
    return JSON.stringify(filters) !== JSON.stringify(tempFilters);
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newXP = user.xp + task.xpReward;
    const newGold = user.gold + task.goldReward;
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true, category: 'completed' } : t));
    if (selectedTask?.id === taskId) setSelectedTask({ ...selectedTask, completed: true, category: 'completed' });
    if (newXP >= user.xpToNext) {
      setUser({ ...user, level: user.level + 1, xp: newXP - user.xpToNext, xpToNext: Math.floor(user.xpToNext * 1.5), gold: newGold });
    } else {
      setUser({ ...user, xp: newXP, gold: newGold });
    }
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.dueDate) {
      const urgMult = { baja: 1, media: 1.5, alta: 2 };
      const impMult = { baja: 1, media: 1.5, alta: 2 };
      const xpReward = Math.floor(50 * urgMult[newTask.urgency] * impMult[newTask.importance]);
      const goldReward = Math.floor(20 * urgMult[newTask.urgency] * impMult[newTask.importance]);
      setTasks([...tasks, { ...newTask, id: Date.now(), category: 'upcoming', xpReward, goldReward, completed: false, collaborators: [], comments: [] }]);
      setNewTask({ title: '', urgency: 'media', importance: 'media', dueDate: '', assignedTo: 1 });
      setShowNewTask(false);
    }
  };

  const deleteTask = (taskId) => setTasks(tasks.filter(t => t.id !== taskId));

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, category, taskId = null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(category);
    if (taskId) setDragOverTaskId(taskId);
  };

  const handleDrop = (e, targetCategory, targetTaskId = null) => {
    e.preventDefault();
    setDragOverCategory(null);
    setDragOverTaskId(null);
    if (!draggedTask) return;
    if (draggedTask.category === targetCategory && targetTaskId && targetTaskId !== draggedTask.id) {
      const categoryTasks = tasks.filter(t => t.category === targetCategory);
      const draggedIndex = categoryTasks.findIndex(t => t.id === draggedTask.id);
      const targetIndex = categoryTasks.findIndex(t => t.id === targetTaskId);
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newTasks = [...tasks];
        const draggedTaskIndex = newTasks.findIndex(t => t.id === draggedTask.id);
        const targetTaskIndex = newTasks.findIndex(t => t.id === targetTaskId);
        const [removed] = newTasks.splice(draggedTaskIndex, 1);
        newTasks.splice(targetTaskIndex, 0, removed);
        setTasks(newTasks);
      }
    } else if (draggedTask.category !== targetCategory) {
      setTasks(tasks.map(t => t.id === draggedTask.id ? { ...t, category: targetCategory } : t));
    }
    setDraggedTask(null);
  };

  const addComment = () => {
    if (newComment.trim() === '') return;
    const mentionRegex = /@([\wÀ-ÿ\s]+?)(?=\s|$|@)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(newComment)) !== null) {
      const mentionedName = match[1].trim();
      const mentionedUser = mockUsers.find(u => u.name === mentionedName);
      if (mentionedUser && mentionedUser.id !== 1) {
        mentions.push(mentionedUser.id);
        const notification = {
          id: Date.now() + mentionedUser.id,
          type: 'mention',
          from: getUserById(1).name,
          message: `te ha mencionado en la misión "${selectedTask.title}"`,
          taskId: selectedTask.id,
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
      }
    }
    const comment = { id: Date.now(), userId: 1, text: newComment, timestamp: new Date().toISOString(), mentions };
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, comments: [...(t.comments || []), comment] } : t));
    setSelectedTask({ ...selectedTask, comments: [...(selectedTask.comments || []), comment] });
    setNewComment('');
    setShowMentionSuggestions(false);
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(value);
    setCursorPosition(cursorPos);
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const beforeMention = newComment.substring(0, lastAtIndex);
    const mention = `@${user.name} `;
    setNewComment(beforeMention + mention + textAfterCursor);
    setShowMentionSuggestions(false);
  };

  const renderCommentText = (text) => {
    const parts = text.split(/(@[\wÀ-ÿ\s]+?)(?=\s|$|@)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedName = part.substring(1).trim();
        const mentionedUser = mockUsers.find(u => u.name === mentionedName);
        if (mentionedUser) {
          return <span key={index} className="bg-blue-100 text-blue-700 px-1 rounded font-semibold">{part}</span>;
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const reassignTask = (taskId, newUserId) => {
    const task = tasks.find(t => t.id === taskId);
    const oldUser = getUserById(task.assignedTo);
    const newUser = getUserById(newUserId);
    const notification = {
      id: Date.now(),
      type: 'reassign',
      from: oldUser.name,
      message: `te ha asignado la misión "${task.title}"`,
      taskId: task.id,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, assignedTo: newUserId } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, assignedTo: newUserId });
    }
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const closeTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
    setNewComment('');
  };

  const assignUserToTask = (userId) => {
    const taskId = selectedTask?.id;
    if (assignMode === 'assign') {
      reassignTask(taskId, userId);
    } else {
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.collaborators.includes(userId) && userId !== task.assignedTo) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, collaborators: [...t.collaborators, userId] } : t));
        if (selectedTask) setSelectedTask({ ...selectedTask, collaborators: [...selectedTask.collaborators, userId] });
      }
    }
    setShowAssignModal(false);
  };

  const removeCollaborator = (taskId, userId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, collaborators: t.collaborators.filter(id => id !== userId) } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, collaborators: selectedTask.collaborators.filter(id => id !== userId) });
    }
  };

  const selectAvatar = (avatar) => {
    setUser({ ...user, avatar: avatar.icon, avatarColor: avatar.color });
    setShowAvatarSelector(false);
  };

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
      isActive: false,
      equipped: false
    };
    setUserPurchases([...userPurchases, purchase]);
    setUser({ ...user, gold: user.gold - finalPrice });
    const notification = {
      id: Date.now(),
      type: 'purchase',
      from: 'Tienda',
      message: `has comprado "${selectedItem.name}" por ${finalPrice} oro`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notification, ...prev]);
    setShowPurchaseModal(false);
    alert('¡Compra realizada con éxito! Ve a tu inventario para equiparlo.');
    // Cambiar a tab de inventario automáticamente
    setActiveTab('hero');
    setHeroSubTab('inventory');
  };

  const getItemsByCategory = (category) => {
    return shopItems.filter(item => item.category === category && item.available);
  };

  const getWishlistItems = () => {
    return shopItems.filter(item => wishlist.includes(item.id) && item.available);
  };

  const isPurchased = (itemId) => {
    return userPurchases.some(p => p.itemId === itemId && !itemTimers[p.id]?.expired);
  };

  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const categoryConfig = {
    weapons: { title: 'Armas', icon: '⚔️', gradient: 'from-red-100 to-orange-100', border: 'border-red-200', hoverBorder: 'hover:border-red-300' },
    armor: { title: 'Armaduras', icon: '🛡️', gradient: 'from-blue-100 to-indigo-100', border: 'border-blue-200', hoverBorder: 'hover:border-blue-300' },
    potions: { title: 'Pociones', icon: '🧪', gradient: 'from-green-100 to-emerald-100', border: 'border-green-200', hoverBorder: 'hover:border-green-300' }
  };

  const getFilteredHistoricalData = () => {
    if (leaderboardPeriod === 'weekly') {
      return historicalData.slice(-7);
    }
    return historicalData.slice(-30);
  };

  const getProgressComparison = () => {
    const filteredData = getFilteredHistoricalData();
    if (filteredData.length < 2) return null;
    const latest = filteredData[filteredData.length - 1];
    const previous = filteredData[0];
    return {
      xpDelta: latest.xp - previous.xp,
      goldDelta: latest.gold - previous.gold,
      tasksDelta: latest.tasks - previous.tasks,
      xpPercentage: ((latest.xp - previous.xp) / previous.xp * 100).toFixed(1),
      goldPercentage: ((latest.gold - previous.gold) / previous.gold * 100).toFixed(1)
    };
  };

  const getTopPerformers = () => {
    return [...mockUsers].sort((a, b) => b.xp - a.xp).slice(0, 5);
  };

  // =============== FUNCIONES DE INVENTARIO ===============
  
  const getInventoryItems = () => {
    return userPurchases.filter(purchase => {
      const timer = itemTimers[purchase.id];
      return timer && !timer.expired;
    });
  };

  const getActiveItems = () => {
    return userPurchases.filter(purchase => {
      const timer = itemTimers[purchase.id];
      return purchase.equipped && timer && !timer.expired;
    });
  };

  const getExpiredItems = () => {
    return userPurchases.filter(purchase => {
      const timer = itemTimers[purchase.id];
      return timer && timer.expired;
    });
  };

  const toggleEquipItem = (purchaseId) => {
    const purchase = userPurchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const timer = itemTimers[purchaseId];
    if (timer && timer.expired) {
      alert('Este ítem ha expirado y no puede ser equipado.');
      return;
    }

    const newEquippedState = !purchase.equipped;
    
    // Animación
    setEquipAnimation(purchaseId);
    setTimeout(() => setEquipAnimation(null), 600);

    // Actualizar estado
    setUserPurchases(prev => prev.map(p => 
      p.id === purchaseId 
        ? { ...p, equipped: newEquippedState, isActive: newEquippedState }
        : p
    ));

    // Notificación
    const item = getItemById(purchase.itemId);
    if (item) {
      const notification = {
        id: Date.now(),
        type: newEquippedState ? 'item_equipped' : 'item_unequipped',
        from: 'Inventario',
        message: newEquippedState 
          ? `has equipado "${item.name}"`
          : `has desequipado "${item.name}"`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [notification, ...prev]);
    }
  };

  const getActiveItemsCount = () => {
    return getActiveItems().length;
  };

  const getActiveItemsIcons = () => {
    const activeItems = getActiveItems();
    return activeItems.map(purchase => {
      const item = getItemById(purchase.itemId);
      return item ? item.icon : null;
    }).filter(Boolean);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Sword className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">LVL UP!</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="prueba" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="123456789" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            {loginError && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{loginError}</div>}
            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold">Iniciar Sesión</button>
          </div>
          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-semibold mb-2">Credenciales:</p>
            <p>Usuario: <span className="font-mono">prueba</span></p>
            <p>Contraseña: <span className="font-mono">123456789</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 shadow-lg">
        <div className="flex justify-between items-center gap-4">
          <div className="text-2xl font-bold">LVL UP!</div>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 rounded-full text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            {/* Indicador de ítems activos */}
            {getActiveItemsCount() > 0 && (
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-white/30 transition-colors" onClick={() => { setActiveTab('hero'); setHeroSubTab('inventory'); }}>
                {getActiveItemsIcons().slice(0, 3).map((icon, idx) => (
                  <span key={idx} className="text-base">{icon}</span>
                ))}
                {getActiveItemsCount() > 3 && (
                  <span className="text-xs">+{getActiveItemsCount() - 3}</span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
              <Coins className="w-4 h-4" />
              <span>{user.gold}</span>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Nivel {user.level}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 p-1 rounded">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Tab HERO con sub-navegación */}
        {activeTab === 'hero' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Héroe</h2>
            
            {/* Sub-navegación */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button 
                onClick={() => setHeroSubTab('profile')} 
                className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  heroSubTab === 'profile' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                👤 Perfil
              </button>
              <button 
                onClick={() => setHeroSubTab('inventory')} 
                className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  heroSubTab === 'inventory' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📦 Inventario
                {getInventoryItems().length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getInventoryItems().length}
                  </span>
                )}
              </button>
            </div>

            {/* PERFIL */}
            {heroSubTab === 'profile' && (
              <>
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-20 h-20 ${user.avatarColor} rounded-full flex items-center justify-center text-4xl cursor-pointer hover:scale-105 transition-transform`} onClick={() => setShowAvatarSelector(!showAvatarSelector)}>{user.avatar}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
                      <p className="text-gray-600">Nivel {user.level}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Coins className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold">{user.gold} Oro</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experiencia</span>
                      <span>{user.xp} / {user.xpToNext} XP</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${(user.xp / user.xpToNext) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {showAvatarSelector && (
                  <div className="bg-white rounded-lg shadow-lg p-6 mb-4 border-2 border-purple-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Cambiar Avatar</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {availableAvatars.map((avatar, idx) => (
                        <button key={idx} onClick={() => selectAvatar(avatar)} className={`flex flex-col items-center p-3 rounded-lg transition-all ${user.avatar === avatar.icon ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <div className={`w-12 h-12 ${avatar.color} rounded-full flex items-center justify-center text-2xl mb-1`}>{avatar.icon}</div>
                          <span className="text-xs font-semibold">{avatar.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg shadow-lg p-6 border-2 border-amber-300">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Logros</h3>
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button onClick={() => setAchievementFilter('all')} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${achievementFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-white'}`}>Todos</button>
                    <button onClick={() => setAchievementFilter('daily')} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${achievementFilter === 'daily' ? 'bg-green-600 text-white' : 'bg-white'}`}>Diarios</button>
                    <button onClick={() => setAchievementFilter('weekly')} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${achievementFilter === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Semanales</button>
                  </div>
                  <div className="space-y-3">
                    {achievements.filter(a => achievementFilter === 'all' || a.type === achievementFilter).map(achievement => (
                      <div key={achievement.id} className={`bg-white rounded-lg p-4 border-2 ${achievement.completed ? 'border-green-300' : 'border-gray-200'}`}>
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.progress && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{achievement.progress} / {achievement.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${(achievement.progress / achievement.total) * 100}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* INVENTARIO */}
            {heroSubTab === 'inventory' && (
              <div className="space-y-6">
                {/* Ítems Activos */}
                {getActiveItems().length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-bold text-gray-800">Ítems Activos</h3>
                      <span className="ml-auto bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                        {getActiveItems().length} equipado{getActiveItems().length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getActiveItems().map(purchase => {
                        const item = getItemById(purchase.itemId);
                        const timer = itemTimers[purchase.id];
                        if (!item) return null;

                        return (
                          <div 
                            key={purchase.id} 
                            className={`bg-white rounded-lg p-4 border-2 border-green-400 shadow-md relative overflow-hidden ${
                              equipAnimation === purchase.id ? 'animate-equip-pulse' : ''
                            }`}
                          >
                            <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                              ✓ EQUIPADO
                            </div>
                            <div className="flex gap-3 items-start mt-2">
                              <div className="text-5xl">{item.icon}</div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                                <div className={`flex items-center gap-2 text-sm mb-2 ${timer?.warning ? 'animate-countdown-warning' : timer?.color}`}>
                                  <Clock className="w-4 h-4" />
                                  <span className="font-bold">
                                    {timer?.text || 'Cargando...'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  ✨ {item.benefit}
                                </p>
                                <button
                                  onClick={() => toggleEquipItem(purchase.id)}
                                  className="w-full px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                                >
                                  Desequipar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Inventario General */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-800">Mi Inventario</h3>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getInventoryItems().length} ítem{getInventoryItems().length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {getInventoryItems().length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Inventario vacío</h4>
                      <p className="text-gray-600 mb-4">No tienes ítems disponibles</p>
                      <button 
                        onClick={() => setActiveTab('rewards')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Ir a la Tienda
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getInventoryItems().map(purchase => {
                        const item = getItemById(purchase.itemId);
                        const timer = itemTimers[purchase.id];
                        if (!item) return null;

                        return (
                          <div 
                            key={purchase.id} 
                            className={`bg-gradient-to-br ${item.color} rounded-xl shadow-lg border-2 ${item.borderColor} p-5 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                              purchase.equipped ? 'ring-2 ring-green-500' : ''
                            } ${equipAnimation === purchase.id ? 'animate-equip-pulse' : ''}`}
                          >
                            {purchase.equipped && (
                              <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                EQUIPADO
                              </div>
                            )}

                            <div className="text-center mb-3">
                              <div className="text-6xl mb-2">{item.icon}</div>
                              <h4 className="font-black text-lg text-gray-900 mb-1">{item.name}</h4>
                              <p className="text-xs text-gray-700 mb-2">{item.description}</p>
                            </div>

                            {/* Countdown Timer */}
                            <div className={`bg-white/70 backdrop-blur rounded-lg px-3 py-2 mb-3 border border-gray-300 ${
                              timer?.warning ? 'border-red-300 bg-red-50' : ''
                            }`}>
                              <div className="text-xs text-gray-600 mb-1">Vence en:</div>
                              <div className={`flex items-center justify-center gap-2 ${
                                timer?.warning ? 'animate-countdown-warning' : timer?.color
                              }`}>
                                <Clock className="w-5 h-5" />
                                <span className="text-xl font-black">
                                  {timer?.text || 'Cargando...'}
                                </span>
                              </div>
                            </div>

                            {/* Beneficio */}
                            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg px-3 py-2 mb-3 border-2 border-amber-500 shadow-md">
                              <div className="flex items-start gap-2">
                                <Zap className="w-4 h-4 text-amber-900 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-amber-900 leading-tight">{item.benefit}</p>
                              </div>
                            </div>

                            {/* Botón Equipar/Desequipar */}
                            <button
                              onClick={() => toggleEquipItem(purchase.id)}
                              disabled={timer?.expired}
                              className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all ${
                                purchase.equipped
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  : timer?.expired
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105'
                              }`}
                            >
                              {purchase.equipped ? 'Desequipar' : timer?.expired ? 'Expirado' : 'Equipar'}
                            </button>

                            {/* Fecha de compra */}
                            <div className="mt-3 text-center text-xs text-gray-600">
                              Comprado: {new Date(purchase.purchasedAt).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Ítems Expirados */}
                {getExpiredItems().length > 0 && (
                  <div className="bg-gray-50 rounded-lg shadow p-6 border-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-600 mb-4 flex items-center gap-2">
                      <X className="w-5 h-5" />
                      Ítems Expirados ({getExpiredItems().length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {getExpiredItems().map(purchase => {
                        const item = getItemById(purchase.itemId);
                        if (!item) return null;

                        return (
                          <div key={purchase.id} className="bg-white rounded-lg p-3 border border-gray-200 opacity-60">
                            <div className="text-center">
                              <div className="text-3xl mb-1 grayscale">{item.icon}</div>
                              <p className="text-xs font-semibold text-gray-600">{item.name}</p>
                              <p className="text-xs text-gray-400 mt-1">Expirado</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Otros tabs permanecen igual... (missions, rewards, notifications, leaders) */}
        {activeTab === 'missions' && (
          <div>
            <div className="text-center py-12">
              <Sword className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Sección de Misiones (mantener código original)</p>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Sección de Tienda (mantener código original)</p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notificaciones</h2>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${notif.read ? 'border-gray-300' : 'border-blue-500'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-bold">{notif.from}</span> {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatCommentTime(notif.timestamp)}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaders' && (
          <div>
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Sección de Líderes (mantener código original)</p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-around items-center h-16 shadow-lg z-50">
        <button onClick={() => setActiveTab('missions')} className={`flex flex-col items-center justify-center h-full px-4 ${activeTab === 'missions' ? 'text-white' : 'text-blue-200'}`}>
          <Sword className="w-5 h-5 mb-1" />
          <span className="text-xs">Misiones</span>
        </button>
        <button onClick={() => setActiveTab('rewards')} className={`flex flex-col items-center justify-center h-full px-4 ${activeTab === 'rewards' ? 'text-white' : 'text-blue-200'}`}>
          <Trophy className="w-5 h-5 mb-1" />
          <span className="text-xs">Tienda</span>
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`flex flex-col items-center justify-center h-full px-4 relative ${activeTab === 'notifications' ? 'text-white' : 'text-blue-200'}`}>
          <Bell className="w-5 h-5 mb-1" />
          <span className="text-xs">Alertas</span>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute top-2 right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab('leaders')} className={`flex flex-col items-center justify-center h-full px-4 ${activeTab === 'leaders' ? 'text-white' : 'text-blue-200'}`}>
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-xs">Líderes</span>
        </button>
        <button onClick={() => { setActiveTab('hero'); setHeroSubTab('profile'); }} className={`flex flex-col items-center justify-center h-full px-4 relative ${activeTab === 'hero' ? 'text-white' : 'text-blue-200'}`}>
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Héroe</span>
          {getInventoryItems().length > 0 && (
            <span className="absolute top-1 right-2 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {getInventoryItems().length}
            </span>
          )}
        </button>
      </div>

      {/* MODALS (mantener los originales) */}
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
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-amber-600">{calculateFinalPrice(selectedItem)}</span>
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
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
            </div>

            {user.gold < calculateFinalPrice(selectedItem) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm font-semibold text-center">
                  ⚠️ No tienes suficiente oro para esta compra
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowPurchaseModal(false)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
              <button onClick={purchaseItem} disabled={user.gold < calculateFinalPrice(selectedItem)} className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${user.gold < calculateFinalPrice(selectedItem) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
