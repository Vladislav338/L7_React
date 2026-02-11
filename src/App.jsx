import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todo-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [filter, setFilter] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    executor: '',
    deadline: '',
    status: 'Активная задача'
  });

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const statusOptions = ['Активная задача', 'Задача выполнена', 'Задача отменена'];
  const editInputRef = useRef(null);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status === 'Активная задача';
    if (filter === 'completed') return ['Задача выполнена', 'Задача отменена'].includes(task.status);
    return true;
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert('Пожалуйста, введите название задачи');
      return;
    }
    if (!newTask.description.trim()) {
      alert('Пожалуйста, введите описание задачи');
      return;
    }
    if (!newTask.executor.trim()) {
      alert('Пожалуйста, укажите исполнителя');
      return;
    }
    if (!newTask.deadline) {
      alert('Пожалуйста, укажите дедлайн');
      return;
    }

    const newTaskObj = {
      id: Date.now(),
      ...newTask
    };

    setTasks([...tasks, newTaskObj]);
    setNewTask({
      title: '',
      description: '',
      executor: '',
      deadline: '',
      status: 'Активная задача'
    });
    setShowPopup(false);
  };

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
  };

  const handleStartEdit = (taskId, field) => {
    setEditingTaskId(taskId);
    setEditingField(field);
  };

  const handleSaveEdit = (taskId, field, value) => {
    if (!value.trim() && field !== 'deadline') {
      alert('Поле не может быть пустым');
      return;
    }

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, [field]: value };
      }
      return task;
    });

    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingField(null);
  };

  const handleBlurSave = (taskId, field, e) => {
    const value = e.target.value || e.target.textContent;
    handleSaveEdit(taskId, field, value);
  };

  const handleStatusChange = (taskId, newStatus) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: newStatus };
      }
      return task;
    });
    setTasks(updatedTasks);
    setEditingTaskId(null);
    setEditingField(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const handleClearAllTasks = () => {
    if (window.confirm('Вы уверены, что хотите удалить все задачи?')) {
      setTasks([]);
    }
  };

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'todo-tasks-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTasks = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target.result);
        if (Array.isArray(importedTasks)) {
          setTasks(importedTasks);
          alert('Задачи успешно импортированы!');
        } else {
          alert('Неверный формат файла');
        }
      } catch (error) {
        alert('Ошибка при чтении файла');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Список задач</h1>
        <div className="header-actions">
          <span className="task-count">Задач: {tasks.length}</span>
          <button className="export-btn" onClick={handleExportTasks}>
            Экспорт
          </button>
          <label className="import-btn">
            Импорт
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportTasks}
              style={{ display: 'none' }}
            />
          </label>
          <button className="clear-btn" onClick={handleClearAllTasks}>
            Очистить все
          </button>
        </div>
      </header>

      <div className="container">
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все задачи ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Активные задачи ({tasks.filter(t => t.status === 'Активная задача').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Завершенные задачи ({tasks.filter(t => ['Задача выполнена', 'Задача отменена'].includes(t.status)).length})
          </button>
        </div>

        <div className="add-task-section">
          <button className="add-btn" onClick={() => setShowPopup(true)}>
            + Добавить задачу
          </button>
          {tasks.length > 0 && (
            <div className="storage-info">
              Данные сохраняются автоматически при каждом изменении
            </div>
          )}
        </div>

        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Название задачи</th>
                <th>Описание задачи</th>
                <th>Исполнитель</th>
                <th>Дедлайн</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <tr key={task.id}>
                  <td 
                    onClick={() => handleStartEdit(task.id, 'title')}
                    className="editable-cell"
                  >
                    {editingTaskId === task.id && editingField === 'title' ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        defaultValue={task.title}
                        onBlur={(e) => handleBlurSave(task.id, 'title', e)}
                        autoFocus
                      />
                    ) : (
                      task.title
                    )}
                  </td>

                  <td 
                    onClick={() => handleStartEdit(task.id, 'description')}
                    className="editable-cell"
                  >
                    {editingTaskId === task.id && editingField === 'description' ? (
                      <textarea
                        ref={editInputRef}
                        defaultValue={task.description}
                        onBlur={(e) => handleBlurSave(task.id, 'description', e)}
                        autoFocus
                      />
                    ) : (
                      task.description
                    )}
                  </td>

                  <td 
                    onClick={() => handleStartEdit(task.id, 'executor')}
                    className="editable-cell"
                  >
                    {editingTaskId === task.id && editingField === 'executor' ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        defaultValue={task.executor}
                        onBlur={(e) => handleBlurSave(task.id, 'executor', e)}
                        autoFocus
                      />
                    ) : (
                      task.executor
                    )}
                  </td>

                  <td 
                    onClick={() => handleStartEdit(task.id, 'deadline')}
                    className="editable-cell"
                  >
                    {editingTaskId === task.id && editingField === 'deadline' ? (
                      <input
                        ref={editInputRef}
                        type="date"
                        defaultValue={task.deadline}
                        onBlur={(e) => handleBlurSave(task.id, 'deadline', e)}
                        autoFocus
                      />
                    ) : (
                      formatDate(task.deadline)
                    )}
                  </td>

                  <td 
                    onClick={() => handleStartEdit(task.id, 'status')}
                    className="editable-cell status-cell"
                  >
                    {editingTaskId === task.id && editingField === 'status' ? (
                      <select
                        ref={editInputRef}
                        defaultValue={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        autoFocus
                        onBlur={() => {
                          setEditingTaskId(null);
                          setEditingField(null);
                        }}
                      >
                        {statusOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`status-badge status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {task.status}
                      </span>
                    )}
                  </td>

                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    {tasks.length === 0 ? 'Нет задач. Добавьте первую!' : 'Нет задач по выбранному фильтру'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-header">
                <h2>Добавить задачу</h2>
                <button className="close-btn" onClick={() => setShowPopup(false)}>
                  ×
                </button>
              </div>
              <div className="popup-body">
                <div className="form-group">
                  <label>Название задачи *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Введите название"
                  />
                </div>
                <div className="form-group">
                  <label>Описание *</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Введите описание"
                  />
                </div>
                <div className="form-group">
                  <label>Исполнитель *</label>
                  <input
                    type="text"
                    value={newTask.executor}
                    onChange={(e) => setNewTask({...newTask, executor: e.target.value})}
                    placeholder="Введите имя исполнителя"
                  />
                </div>
                <div className="form-group">
                  <label>Дедлайн *</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Статус</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="popup-footer">
                <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                  Отмена
                </button>
                <button className="create-btn" onClick={handleAddTask}>
                  Создать задачу
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
