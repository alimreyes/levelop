import React, { useState, useEffect } from 'react';
import { Sword, User, Plus, Check, X, Clock, Coins, Search, MessageCircle, Send, Trophy, Bell, BarChart3, ChevronDown, ChevronUp, LogOut, Filter, GripVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function LvlUpApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('missions');

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
  const [userPurchases, setUserPurchases] = useState([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
  const [showCharts, setShowCharts] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState('global');
  const [selectedMetric, setSelectedMetric] = useState('xp');

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

  // Mock data para analytics
  const [historicalData] = useState([
    { date: '2025-11-05', xp: 1200, gold: 400, tasks: 3, level: 4 },
    { date: '2025-11-06', xp: 1350, gold: 450, tasks: 4, level: 5 },
    { date: '2025-11-07', xp: 1500, gold: 500, tasks: 5, level: 5 },
    { date: '2025-11-08', xp: 1650, gold: 550, tasks: 4, level: 5 },
    { date: '2025-11-09', xp: 1800, gold: 600, tasks: 6, level: 5 },
    { date: '2025-11-10', xp: 1950, gold: 650, tasks: 5, level: 5 },
    { date: '2025-11-11', xp: 2100, gold: 700, tasks: 7, level: 6 },
  ]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up { animation: slideUp 0.3s ease-out; }
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
      isActive: true
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
    alert('¡Compra realizada con éxito!');
  };

  const getItemsByCategory = (category) => {
    return shopItems.filter(item => item.category === category && item.available);
  };

  const getWishlistItems = () => {
    return shopItems.filter(item => wishlist.includes(item.id) && item.available);
  };

  const isPurchased = (itemId) => {
    return userPurchases.some(p => p.itemId === itemId && p.isActive && new Date(p.expiresAt) > new Date());
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 shadow-lg">
        <div className="flex justify-between items-center gap-4">
          <div className="text-2xl font-bold">LVL UP!</div>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 rounded-full text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
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

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'missions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Misiones</h2>
              <div className="flex gap-2">
                <button onClick={openFiltersModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 relative">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>
                <button onClick={() => setShowNewTask(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  Nueva
                </button>
              </div>
            </div>

            {showNewTask && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <input type="text" placeholder="Título" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="w-full p-2 border rounded mb-3" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select value={newTask.urgency} onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })} className="p-2 border rounded">
                    <option value="baja">Urgencia Baja</option>
                    <option value="media">Urgencia Media</option>
                    <option value="alta">Urgencia Alta</option>
                  </select>
                  <select value={newTask.importance} onChange={(e) => setNewTask({ ...newTask, importance: e.target.value })} className="p-2 border rounded">
                    <option value="baja">Importancia Baja</option>
                    <option value="media">Importancia Media</option>
                    <option value="alta">Importancia Alta</option>
                  </select>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="p-2 border rounded col-span-2" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded flex-1">Agregar</button>
                  <button onClick={() => setShowNewTask(false)} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
                </div>
              </div>
            )}

            {['upcoming', 'review', 'delayed', 'completed'].map(category => {
              const categoryTasks = getCategoryTasks(category);
              const isDragOver = dragOverCategory === category;
              return (
                <div key={category} className={`mb-4 bg-white rounded-lg shadow p-4 transition-all ${isDragOver ? 'ring-4 ring-blue-400' : ''}`} onDragOver={(e) => handleDragOver(e, category)} onDragLeave={() => setDragOverCategory(null)} onDrop={(e) => handleDrop(e, category)}>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">{categoryLabels[category]} ({categoryTasks.length})</h3>
                  {categoryTasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">Sin tareas</div>
                  ) : (
                    <div className="space-y-2">
                      {categoryTasks.map(task => {
                        const deadline = getDeadlineLabel(task.dueDate);
                        return (
                          <div key={task.id} draggable={!task.completed} onDragStart={(e) => handleDragStart(e, task)} onDragOver={(e) => handleDragOver(e, category, task.id)} onDrop={(e) => handleDrop(e, category, task.id)} className={`p-3 bg-gray-50 rounded border-2 ${dragOverTaskId === task.id ? 'border-blue-400 border-dashed' : 'border-gray-200'} cursor-pointer hover:shadow-md transition-all ${draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''}`}>
                            <div className="flex gap-2">
                              {!task.completed && (
                                <div className="flex items-center text-gray-400 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                              )}
                              <div className="flex-1" onClick={() => openTaskDetail(task)}>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-gray-800">{task.title}</span>
                                  {!task.completed && <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>}
                                </div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  {task.assignedTo && getUserById(task.assignedTo) && <div className={`w-6 h-6 ${getUserById(task.assignedTo).color} rounded-full flex items-center justify-center text-sm`}>{getUserById(task.assignedTo).avatar}</div>}
                                  {task.collaborators?.slice(0, 2).map(id => {
                                    const u = getUserById(id);
                                    return u ? <div key={id} className={`w-6 h-6 ${u.color} rounded-full flex items-center justify-center text-sm border border-gray-300`}>{u.avatar}</div> : null;
                                  })}
                                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${deadline.color} flex items-center gap-1`}>
                                    <span>{deadline.icon}</span>
                                    {deadline.label}
                                  </span>
                                </div>
                                {category === 'upcoming' && taskTimers[task.id] && (
                                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${taskTimers[task.id].bgColor}`}>
                                    <Clock className={`w-4 h-4 ${taskTimers[task.id].color}`} />
                                    <span className={`text-sm font-bold ${taskTimers[task.id].color}`}>{taskTimers[task.id].text}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-xs text-gray-500"><span>{formatDate(task.dueDate)}</span><span className="text-green-600 font-bold">XP: {task.xpReward}</span></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tienda</h2>
              <p className="text-gray-600 text-sm">Invierte tu oro en lo que necesites</p>
            </div>

            {shopCategory === 'main' && (
              <div className="space-y-4">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <div key={key} className={`bg-gradient-to-br ${config.gradient} rounded-lg shadow-lg border-2 ${config.border} transition-all duration-300`}>
                    <button onClick={() => toggleCategory(key)} className="w-full p-6 flex items-center justify-between hover:bg-white/20 transition-colors rounded-t-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{config.icon}</div>
                        <div className="text-left">
                          <h3 className="text-2xl font-bold text-gray-800">{config.title}</h3>
                          <p className="text-sm text-gray-600">{getItemsByCategory(key).length} ítems disponibles</p>
                        </div>
                      </div>
                      <div className={`transform transition-transform duration-300 ${expandedCategory === key ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-8 h-8 text-gray-700" />
                      </div>
                    </button>

                    <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: expandedCategory === key ? '3000px' : '0px', opacity: expandedCategory === key ? 1 : 0 }}>
                      <div className="p-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getItemsByCategory(key).map(item => (
                            <div key={item.id} className={`bg-gradient-to-br ${item.color} rounded-xl shadow-lg border-3 ${item.borderColor} transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] relative overflow-hidden`}>
                              {item.isOffer && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-pulse">
                                  -{item.discountPercentage}% OFERTA
                                </div>
                              )}
                              <div className="p-5">
                                <div className="flex gap-4 mb-4">
                                  <div className="flex-shrink-0">
                                    <div className="bg-white/80 backdrop-blur rounded-lg p-3 shadow-md border-2 border-gray-300">
                                      <div className="text-center">
                                        <div className="text-3xl font-bold text-gray-800">{item.durationHours}</div>
                                        <div className="text-xs font-semibold text-gray-600">Hrs</div>
                                        <div className="text-xs text-gray-500 mt-1">Vence</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="text-4xl">{item.icon}</div>
                                        <h4 className="font-black text-xl text-gray-900 leading-tight">{item.name}</h4>
                                      </div>
                                      <button onClick={() => toggleWishlist(item.id)} className={`text-2xl ${wishlist.includes(item.id) ? 'text-pink-500' : 'text-gray-400'} hover:scale-125 transition-transform drop-shadow-md`}>
                                        {wishlist.includes(item.id) ? '💖' : '🤍'}
                                      </button>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur rounded-lg px-3 py-2 mb-2 border border-gray-300">
                                      <p className="text-sm text-gray-700 font-medium">{item.description}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-lg px-3 py-2 border-2 border-amber-500 shadow-md">
                                      <div className="flex items-start gap-2">
                                        <span className="text-lg">✨</span>
                                        <p className="text-sm font-bold text-amber-900 leading-tight">{item.benefit}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t-2 border-white/40">
                                  <div className="flex items-center gap-2">
                                    {item.isOffer ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500 line-through text-sm font-semibold">{item.price}</span>
                                        <div className="flex items-center gap-1 bg-amber-500 px-3 py-1 rounded-full shadow-md">
                                          <span className="text-2xl font-black text-white">{calculateFinalPrice(item)}</span>
                                          <Coins className="w-5 h-5 text-white" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 bg-amber-500 px-3 py-1 rounded-full shadow-md">
                                        <span className="text-2xl font-black text-white">{item.price}</span>
                                        <Coins className="w-5 h-5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <button onClick={() => openPurchaseModal(item)} disabled={isPurchased(item.id)} className={`px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all ${isPurchased(item.id) ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 active:scale-95'}`}>
                                    {isPurchased(item.id) ? '✓ EQUIPADO' : 'COMPRAR'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setShopCategory('wishlist')} className="w-full bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all border-2 border-purple-200 hover:border-purple-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">💝</span>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-gray-800">Mis Deseos</h3>
                        <p className="text-sm text-gray-600">{wishlist.length} {wishlist.length === 1 ? 'ítem guardado' : 'ítems guardados'}</p>
                      </div>
                    </div>
                    <div className="text-purple-600">
                      <ChevronDown className="w-8 h-8 -rotate-90" />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {shopCategory === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setShopCategory('main')} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 transition-colors">
                    <ChevronDown className="w-5 h-5 rotate-90" />
                    Volver
                  </button>
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span>💝</span>
                    Mis Deseos
                  </h3>
                  <div className="w-20"></div>
                </div>
                {getWishlistItems().length === 0 ? (
                  <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <div className="text-7xl mb-4">💔</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Lista vacía</h4>
                    <p className="text-gray-600">No tienes ítems en tu lista de deseos</p>
                    <button onClick={() => setShopCategory('main')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Explorar Tienda
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getWishlistItems().map(item => (
                      <div key={item.id} className={`bg-gradient-to-br ${item.color} rounded-xl shadow-lg p-5`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-4xl">{item.icon}</span>
                            <h4 className="font-bold text-lg">{item.name}</h4>
                          </div>
                          <button onClick={() => toggleWishlist(item.id)} className="text-2xl text-pink-500">💖</button>
                        </div>
                        <p className="text-sm mb-3">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-bold">{calculateFinalPrice(item)}</span>
                            <Coins className="w-4 h-4" />
                          </div>
                          <button onClick={() => openPurchaseModal(item)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Comprar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                    {notif.taskId && (
                      <button onClick={() => { const task = tasks.find(t => t.id === notif.taskId); if (task) { setActiveTab('missions'); setTimeout(() => openTaskDetail(task), 100); } }} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold">
                        Ver misión →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaders' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Líderes</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setLeaderboardPeriod('weekly')} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${leaderboardPeriod === 'weekly' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  Semanal
                </button>
                <button onClick={() => setLeaderboardPeriod('monthly')} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${leaderboardPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  Mensual
                </button>
              </div>
            </div>

            <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Tu Progreso</h3>
                <button onClick={() => setShowCharts(!showCharts)} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                  {showCharts ? 'Ocultar' : 'Ver'} Gráficas
                </button>
              </div>

              {getProgressComparison() && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">XP</span>
                      {getProgressComparison().xpDelta > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{user.xp}</div>
                    <div className={`text-xs ${getProgressComparison().xpDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getProgressComparison().xpDelta > 0 ? '+' : ''}{getProgressComparison().xpDelta} ({getProgressComparison().xpPercentage}%)
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Oro</span>
                      {getProgressComparison().goldDelta > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{user.gold}</div>
                    <div className={`text-xs ${getProgressComparison().goldDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getProgressComparison().goldDelta > 0 ? '+' : ''}{getProgressComparison().goldDelta} ({getProgressComparison().goldPercentage}%)
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tareas</span>
                      {getProgressComparison().tasksDelta > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{tasks.filter(t => t.completed).length}</div>
                    <div className={`text-xs ${getProgressComparison().tasksDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getProgressComparison().tasksDelta > 0 ? '+' : ''}{getProgressComparison().tasksDelta}
                    </div>
                  </div>
                </div>
              )}

              {showCharts && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Evolución de XP</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={getFilteredHistoricalData()}>
                        <defs>
                          <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="xp" stroke="#8884d8" fillOpacity={1} fill="url(#colorXp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Tareas Completadas</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={getFilteredHistoricalData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="tasks" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">Top 5 Líderes</h3>
              <div className="space-y-3">
                {getTopPerformers().map((performer, index) => (
                  <div key={performer.id} className={`flex items-center gap-4 p-3 rounded-lg ${performer.id === 1 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'}`}>
                    <div className="text-2xl font-bold text-gray-400 w-8">#{index + 1}</div>
                    <div className={`w-12 h-12 ${performer.color} rounded-full flex items-center justify-center text-2xl`}>
                      {performer.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{performer.name}</div>
                      <div className="text-xs text-gray-500">{performer.department}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{performer.xp} XP</div>
                      <div className="text-xs text-gray-500">Nivel {performer.level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Mi Héroe</h2>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg shadow-lg p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-20 h-20 ${user.avatarColor} rounded-full flex items-center justify-center text-4xl cursor-pointer hover:scale-105`} onClick={() => setShowAvatarSelector(!showAvatarSelector)}>{user.avatar}</div>
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
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full" style={{ width: `${(user.xp / user.xpToNext) * 100}%` }} />
                </div>
              </div>
            </div>

            {showAvatarSelector && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4 border-2 border-purple-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Cambiar Avatar</h3>
                <div className="grid grid-cols-4 gap-3">
                  {availableAvatars.map((avatar, idx) => (
                    <button key={idx} onClick={() => selectAvatar(avatar)} className={`flex flex-col items-center p-3 rounded-lg ${user.avatar === avatar.icon ? 'bg-purple-100 ring-2 ring-purple-500' : 'bg-gray-50'}`}>
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
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(achievement.progress / achievement.total) * 100}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
            <div className="flex justify-between items-start p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h2>
              <button onClick={closeTaskDetail} className="text-gray-500 hover:text-gray-700 ml-4">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Entrega</p>
                  <p className="font-bold text-gray-800">{formatDate(selectedTask.dueDate)}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-gray-600 mb-2">Recompensas</p>
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-bold text-purple-600">{selectedTask.xpReward} XP</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Equipo</h3>
                  {!selectedTask.completed && (
                    <button onClick={() => { setAssignMode('assign'); setShowAssignModal(true); }} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                      Reasignar
                    </button>
                  )}
                </div>
                {selectedTask.assignedTo && getUserById(selectedTask.assignedTo) && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${getUserById(selectedTask.assignedTo).color} rounded-full flex items-center justify-center text-2xl`}>
                      {getUserById(selectedTask.assignedTo).avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{getUserById(selectedTask.assignedTo).name}</p>
                      <p className="text-xs text-gray-500">Responsable</p>
                    </div>
                  </div>
                )}
                {selectedTask.collaborators?.map(collabId => {
                  const collab = getUserById(collabId);
                  return collab ? (
                    <div key={collabId} className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 ${collab.color} rounded-full flex items-center justify-center text-lg`}>{collab.avatar}</div>
                      <div className="flex-1"><p className="font-semibold text-sm">{collab.name}</p></div>
                      {!selectedTask.completed && (
                        <button onClick={() => removeCollaborator(selectedTask.id, collabId)} className="text-red-500 text-sm">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : null;
                })}
                {!selectedTask.completed && (
                  <button onClick={() => { setAssignMode('collaborate'); setShowAssignModal(true); }} className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
                    <Plus className="w-4 h-4" />
                    Agregar Colaborador
                  </button>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comentarios ({selectedTask.comments?.length || 0})
                </h3>
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {selectedTask.comments?.map(comment => {
                    const commUser = getUserById(comment.userId);
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className={`w-8 h-8 ${commUser.color} rounded-full flex items-center justify-center text-sm flex-shrink-0`}>{commUser.avatar}</div>
                        <div className="flex-1 bg-white rounded p-2 border">
                          <p className="font-semibold text-sm text-gray-800">{commUser.name}</p>
                          <p className="text-sm text-gray-700">{renderCommentText(comment.text)}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatCommentTime(comment.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="relative">
                  <textarea value={newComment} onChange={handleCommentChange} placeholder="Escribe un comentario... (usa @ para mencionar)" className="w-full p-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows="2" onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) { addComment(); } }} />

                  {showMentionSuggestions && (
                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {mockUsers.filter(u => u.name.toLowerCase().includes(mentionSearch.toLowerCase())).map(u => (
                        <button key={u.id} onClick={() => insertMention(u)} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 text-left">
                          <div className={`w-8 h-8 ${u.color} rounded-full flex items-center justify-center text-lg`}>{u.avatar}</div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.department}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={addComment} disabled={newComment.trim() === ''} className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Presiona <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> para enviar
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button onClick={closeTaskDetail} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cerrar</button>
              {!selectedTask.completed && (
                <button onClick={() => { completeTask(selectedTask.id); closeTaskDetail(); }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Completar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {assignMode === 'assign' ? 'Asignar Responsable' : 'Agregar Colaborador'}
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockUsers.map(u => {
                const isAssigned = selectedTask?.assignedTo === u.id;
                const isCollab = selectedTask?.collaborators?.includes(u.id);
                const isDisabled = assignMode === 'collaborate' && (isAssigned || isCollab);
                return (
                  <button key={u.id} onClick={() => !isDisabled && assignUserToTask(u.id)} disabled={isDisabled} className={`w-full flex items-center gap-3 p-3 rounded-lg ${isDisabled ? 'bg-gray-100 opacity-50' : 'bg-gray-50 hover:bg-blue-50'}`}>
                    <div className={`w-10 h-10 ${u.color} rounded-full flex items-center justify-center text-lg`}>{u.avatar}</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.department}</p>
                    </div>
                    {isAssigned && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Responsable</span>}
                    {isCollab && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Colaborador</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col animate-slide-up h-[85vh] md:h-auto md:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">Filtros y Orden</h2>
              <div className="flex gap-3">
                <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                  Reset
                </button>
                <button onClick={applyFilters} disabled={!hasFilterChanges()} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${hasFilterChanges() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                  Aceptar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Ordenar por</h3>
                <div className="space-y-2">
                  {[
                    { value: 'dueDate', label: 'Fecha de entrega', icon: '📅' },
                    { value: 'xpReward', label: 'Recompensa (XP)', icon: '⚡' },
                    { value: 'urgency', label: 'Urgencia', icon: '🔥' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                      <input type="radio" name="sortBy" value={option.value} checked={tempFilters.sortBy === option.value} onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })} className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl">{option.icon}</span>
                      <span className={`text-base ${tempFilters.sortBy === option.value ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {[
                { key: 'urgency', label: '🔥 Urgencia', options: ['all', 'alta', 'media', 'baja'] },
                { key: 'importance', label: '⭐ Importancia', options: ['all', 'alta', 'media', 'baja'] }
              ].map(section => (
                <div key={section.key} className="border-t pt-4">
                  <button onClick={() => toggleSection(section.key)} className="w-full flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                    <span className="font-bold text-gray-800">{section.label}</span>
                    {expandedSection === section.key ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSection === section.key && (
                    <div className="mt-2 pl-4 space-y-2">
                      {section.options.map(opt => (
                        <label key={opt} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg">
                          <input type="radio" name={section.key} value={opt} checked={tempFilters[section.key] === opt} onChange={(e) => setTempFilters({ ...tempFilters, [section.key]: e.target.value })} className="w-4 h-4 text-blue-600" />
                          <span className={`${tempFilters[section.key] === opt ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                            {opt === 'all' ? 'Todas' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="h-32"></div>
            </div>

            <div className="p-4 border-t bg-white flex-shrink-0 sticky bottom-0 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.15)]">
              <button onClick={() => setShowFilters(false)} className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm md:text-base">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
        <button onClick={() => setActiveTab('hero')} className={`flex flex-col items-center justify-center h-full px-4 ${activeTab === 'hero' ? 'text-white' : 'text-blue-200'}`}>
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Héroe</span>
        </button>
      </div>
    </div>
  );
}