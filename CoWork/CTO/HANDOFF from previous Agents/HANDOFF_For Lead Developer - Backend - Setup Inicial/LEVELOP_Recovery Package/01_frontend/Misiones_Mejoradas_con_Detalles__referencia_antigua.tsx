import React, { useState, useEffect } from 'react';
import { Sword, Plus, Check, X, Clock, Coins, Send, ChevronUp, ChevronDown, Search, LogOut } from 'lucide-react';

export default function LvlUpApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const defaultUser = {
    name: 'Héroe Empresarial',
    level: 5,
    xp: 1500,
    xpToNext: 2000,
    gold: 500
  };

  const defaultTasks = [
    { id: 1, title: 'Completa el tutorial', category: 'upcoming', dueDate: '2024-12-25', urgency: 'media', importance: 'alta', xpReward: 100, goldReward: 50, completed: false, assignedTo: 1, collaborators: [], comments: [] },
    { id: 2, title: 'Invita a un amigo', category: 'upcoming', dueDate: '2024-12-30', urgency: 'baja', importance: 'media', xpReward: 200, goldReward: 100, completed: false, assignedTo: 1, collaborators: [], comments: [] },
    { id: 3, title: 'Diseña interfaz', category: 'review', dueDate: '2024-11-28', urgency: 'alta', importance: 'alta', xpReward: 300, goldReward: 150, completed: false, assignedTo: 2, collaborators: [], comments: [] }
  ];

  const [user, setUser] = useState(defaultUser);
  const [tasks, setTasks] = useState(defaultTasks);
  const [currentUser, setCurrentUser] = useState(null);

  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const [taskTimers, setTaskTimers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const [newTask, setNewTask] = useState({
    title: '',
    urgency: 'media',
    importance: 'media',
    dueDate: '',
    assignedTo: 1,
    team: 'TI'
  });

  const [mockUsers] = useState([
    { id: 1, name: 'Juan Pérez', level: 8, department: 'TI', team: 'TI', avatar: '👨‍💻', color: 'bg-blue-500' },
    { id: 2, name: 'María González', level: 12, department: 'Marketing', team: 'Marketing', avatar: '👩‍💼', color: 'bg-pink-500' },
    { id: 3, name: 'Carlos Ramírez', level: 6, department: 'Diseño', team: 'Diseño', avatar: '👨‍💼', color: 'bg-green-500' },
    { id: 4, name: 'Ana Martínez', level: 15, department: 'Legal', team: 'Legal', avatar: '👩‍⚖️', color: 'bg-purple-500' },
    { id: 5, name: 'Pedro López', level: 9, department: 'TI', team: 'TI', avatar: '👨‍🔧', color: 'bg-orange-500' }
  ]);

  const teams = ['TI', 'Marketing', 'Diseño', 'Legal'];
  const teamColors = {
    'TI': 'bg-blue-50 border-blue-200',
    'Marketing': 'bg-pink-50 border-pink-200',
    'Diseño': 'bg-green-50 border-green-200',
    'Legal': 'bg-purple-50 border-purple-200'
  };
  const teamIcons = {
    'TI': '💻',
    'Marketing': '📱',
    'Diseño': '🎨',
    'Legal': '⚖️'
  };

  const categoryLabels = {
    upcoming: 'Próximas Misiones',
    review: 'En Revisión',
    delayed: 'Retrasadas',
    completed: 'Completadas'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple check
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
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setUser(defaultUser);
    setTasks(defaultTasks);
  };

  const getCategoryTasks = (category) => {
    let filtered = tasks.filter(t => t.category === category);
    if (searchQuery) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff < 0) return { expired: true, text: 'Vencida', color: 'text-red-600' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { expired: false, text: `${days}d ${hours}h`, color: 'text-blue-600' };
    if (hours > 0) return { expired: false, text: `${hours}h ${minutes}m`, color: hours < 3 ? 'text-orange-600' : 'text-blue-600' };
    return { expired: false, text: `${minutes}m`, color: 'text-red-600' };
  };

  // ===== BASE DE DATOS SIMPLE (localStorage) =====
  const DATABASE = {
    // Guardar datos
    save: (username, userData) => {
      try {
        const timestamp = new Date().toISOString();
        const dataWithTimestamp = {
          ...userData,
          lastSaved: timestamp
        };
        localStorage.setItem(`user_${username}`, JSON.stringify(dataWithTimestamp));
        return { success: true, message: 'Datos guardados' };
      } catch (error) {
        return { success: false, message: 'Error al guardar' };
      }
    },

    // Cargar datos
    load: (username) => {
      try {
        const data = localStorage.getItem(`user_${username}`);
        if (data) {
          return { success: true, data: JSON.parse(data) };
        }
        return { success: true, data: null };
      } catch (error) {
        return { success: false, message: 'Error al cargar' };
      }
    },

    // Obtener todos los usuarios
    getAllUsers: () => {
      const users = [];
      for (let key in localStorage) {
        if (key.startsWith('user_')) {
          const username = key.replace('user_', '');
          users.push(username);
        }
      }
      return users;
    },

    // Eliminar usuario
    deleteUser: (username) => {
      try {
        localStorage.removeItem(`user_${username}`);
        return { success: true, message: 'Usuario eliminado' };
      } catch (error) {
        return { success: false, message: 'Error al eliminar' };
      }
    },

    // Exportar datos (para respaldo)
    export: (username) => {
      const response = this.load(username);
      if (response.success && response.data) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${username}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        return { success: true, message: 'Datos exportados' };
      }
      return { success: false, message: 'Error al exportar' };
    }
  };

  // Sincronizar datos automáticamente con la base de datos
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      DATABASE.save(currentUser, {
        user,
        tasks
      });
    }
  }, [user, tasks, isLoggedIn, currentUser]);

  const getUserById = (userId) => mockUsers.find(u => u.id === userId);

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const closeTaskDetail = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
  };

  const completeTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newXP = user.xp + task.xpReward;
    const newGold = user.gold + task.goldReward;
    
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true, category: 'completed' } : t));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, completed: true, category: 'completed' } : prev);
    
    if (newXP >= user.xpToNext) {
      setUser({
        ...user,
        level: user.level + 1,
        xp: newXP - user.xpToNext,
        xpToNext: Math.floor(user.xpToNext * 1.5),
        gold: newGold
      });
    } else {
      setUser({ ...user, xp: newXP, gold: newGold });
    }
  };

  const addTask = () => {
    if (newTask.title.trim() && newTask.dueDate) {
      const urgencyMult = { baja: 1, media: 1.5, alta: 2 };
      const importanceMult = { baja: 1, media: 1.5, alta: 2 };
      
      const xpReward = Math.floor(50 * urgencyMult[newTask.urgency] * importanceMult[newTask.importance]);
      const goldReward = Math.floor(20 * urgencyMult[newTask.urgency] * importanceMult[newTask.importance]);
      
      setTasks([...tasks, { 
        ...newTask, 
        id: Date.now(), 
        category: 'upcoming',
        xpReward,
        goldReward,
        completed: false,
        collaborators: [],
        comments: []
      }]);
      
      setNewTask({ title: '', urgency: 'media', importance: 'media', dueDate: '', assignedTo: 1 });
      setShowNewTask(false);
    }
  };

  const deleteTask = (taskId) => {
    if (currentUser) {
      DATABASE.deleteUser(currentUser);
    }
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const moveTaskUp = (taskId) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    const categoryTasks = getCategoryTasks(taskToMove.category);
    const currentIndex = categoryTasks.findIndex(t => t.id === taskId);
    
    if (currentIndex <= 0) return;
    
    const allTasks = [...tasks];
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    const prevTaskIndex = allTasks.findIndex(t => t.id === categoryTasks[currentIndex - 1].id);
    
    [allTasks[taskIndex], allTasks[prevTaskIndex]] = [allTasks[prevTaskIndex], allTasks[taskIndex]];
    setTasks(allTasks);
  };

  const moveTaskDown = (taskId) => {
    const taskToMove = tasks.find(t => t.id === taskId);
    const categoryTasks = getCategoryTasks(taskToMove.category);
    const currentIndex = categoryTasks.findIndex(t => t.id === taskId);
    
    if (currentIndex >= categoryTasks.length - 1) return;
    
    const allTasks = [...tasks];
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    const nextTaskIndex = allTasks.findIndex(t => t.id === categoryTasks[currentIndex + 1].id);
    
    [allTasks[taskIndex], allTasks[nextTaskIndex]] = [allTasks[nextTaskIndex], allTasks[taskIndex]];
    setTasks(allTasks);
  };

  const addComment = () => {
    if (newComment.trim() === '') return;
    const comment = {
      id: Date.now(),
      userId: 1,
      text: newComment,
      timestamp: new Date().toISOString()
    };
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, comments: [...(t.comments || []), comment] } : t));
    setSelectedTask({ ...selectedTask, comments: [...(selectedTask.comments || []), comment] });
    setNewComment('');
  };

  const formatCommentTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    return 'Hace poco';
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
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="prueba"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {loginError}
              </div>
            )}

            <button
              onClick={() => {
                // Validar credenciales
                if (username === 'prueba' && password === '123456789') {
                  // Cargar datos de la base de datos
                  const userData = DATABASE.load(username);
                  
                  if (userData.success && userData.data) {
                    setUser(userData.data.user);
                    setTasks(userData.data.tasks);
                  } else {
                    setUser(defaultUser);
                    setTasks(defaultTasks);
                  }
                  
                  setCurrentUser(username);
                  setIsLoggedIn(true);
                  setUsername('');
                  setPassword('');
                  setLoginError('');
                } else {
                  setLoginError('Usuario o contraseña incorrectos');
                }
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold transition"
            >
              Iniciar Sesión
            </button>
          </div>

          <div className="mt-6 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-semibold mb-2">Credenciales de prueba:</p>
            <p>Usuario: <span className="font-mono">prueba</span></p>
            <p>Contraseña: <span className="font-mono">123456789</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div className="text-2xl font-bold">LVL UP!</div>
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

        <div className="relative">
          <Search className="absolute left-3 top-2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 rounded-full text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Misiones</h2>
          <button
            onClick={() => setShowNewTask(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>

        {showNewTask && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <input
              type="text"
              placeholder="Título"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={newTask.urgency} onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value })} className="p-2 border rounded">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
              <select value={newTask.importance} onChange={(e) => setNewTask({ ...newTask, importance: e.target.value })} className="p-2 border rounded">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
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
          if (categoryTasks.length === 0 && category !== 'upcoming') return null;
          
          return (
            <div key={category} className="mb-4 bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">
                {categoryLabels[category]} ({categoryTasks.length})
              </h3>
              
              {categoryTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">Sin tareas</div>
              ) : (
                <div className="space-y-2">
                  {categoryTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={() => openTaskDetail(task)}
                      className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:shadow-md hover:bg-blue-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">{task.title}</span>
                        <div className="flex gap-1">
                          {!task.completed && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); moveTaskUp(task.id); }} className="text-gray-500 hover:text-blue-600 p-1">
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); moveTaskDown(task.id); }} className="text-gray-500 hover:text-blue-600 p-1">
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-red-500 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {task.assignedTo && getUserById(task.assignedTo) && (
                          <div className={`w-6 h-6 ${getUserById(task.assignedTo).color} rounded-full flex items-center justify-center text-sm`}>
                            {getUserById(task.assignedTo).avatar}
                          </div>
                        )}
                      </div>
                      
                      {category === 'upcoming' && taskTimers[task.id] && (
                        <div className="flex items-center gap-1 mb-2">
                          <Clock className={`w-4 h-4 ${taskTimers[task.id].color}`} />
                          <span className={`text-sm font-bold ${taskTimers[task.id].color}`}>
                            {taskTimers[task.id].text}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>{formatDate(task.dueDate)}</span>
                        <span className="text-green-600 font-bold">XP: {task.xpReward}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${task.urgency === 'alta' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                          {task.urgency}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${task.importance === 'alta' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                          {task.importance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h2>
                <button onClick={closeTaskDetail} className="text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Entrega</p>
                  <p className="font-bold">{formatDate(selectedTask.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">XP</p>
                  <p className="font-bold text-green-600">{selectedTask.xpReward}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Comentarios ({selectedTask.comments?.length || 0})</h3>
                <div className="space-y-2 mb-3 max-h-24 overflow-y-auto">
                  {selectedTask.comments && selectedTask.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 p-2 rounded text-sm">
                      <p className="font-semibold">{getUserById(comment.userId)?.name}</p>
                      <p className="text-gray-600">{comment.text}</p>
                      <p className="text-xs text-gray-500">{formatCommentTime(comment.timestamp)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Comentar..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                    className="flex-1 p-2 border rounded text-sm"
                  />
                  <button onClick={addComment} className="bg-blue-600 text-white p-2 rounded">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-2">
              <button onClick={closeTaskDetail} className="flex-1 px-4 py-2 bg-gray-200 rounded">
                Cerrar
              </button>
              {!selectedTask.completed && (
                <button onClick={() => { completeTask(selectedTask.id); closeTaskDetail(); }} className="flex-1 px-4 py-2 bg-green-600 text-white rounded flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Completar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}