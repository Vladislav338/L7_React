// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // Состояния
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
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

  // Справочник статусов
  const statusOptions = ['Активная задача', 'Задача выполнена', 'Задача отменена'];
  
  // Референсы для редактирования
  const editInputRef = useRef(null);

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status === 'Активная задача';
    if (filter === 'completed') return ['Задача выполнена', 'Задача отменена'].includes(task.status);
    return true;
  });

  // Добавление новой задачи
  const handleAddTask = () => {
    // Валидация
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

  // Удаление задачи
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Начало редактирования
  const handleStartEdit = (taskId, field) => {
    setEditingTaskId(taskId);
    setEditingField(field);
  };

  // Сохранение редактирования
  const handleSaveEdit = (taskId, field, value) => {
    if (!value.trim()) {
      alert('Поле не может быть пустым');
      return;
    }

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, [field]: value };
      }
      return task;
    }));

    setEditingTaskId(null);
    setEditingField(null);
  };

  // Сохранение при потере фокуса
  const handleBlurSave = (taskId, field, e) => {
    const value = e.target.value || e.target.textContent;
    handleSaveEdit(taskId, field, value);
  };

  // Изменение статуса через dropdown
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status: newStatus };
      }
      return task;
    }));
    setEditingTaskId(null);
    setEditingField(null);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="app">
      {/* Хедер */}
      <header className="header">
        <h1>Список задач</h1>
      </header>

      <div className="container">
        {/* Фильтры */}
        <div className="filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все задачи
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Активные задачи
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Завершенные задачи
          </button>
        </div>

        {/* Кнопка добавления */}
        <div className="add-task-section">
          <button className="add-btn" onClick={() => setShowPopup(true)}>
            + Добавить задачу
          </button>
        </div>

        {/* Таблица задач */}
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
                  {/* Название задачи */}
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

                  {/* Описание */}
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

                  {/* Исполнитель */}
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

                  {/* Дедлайн */}
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

                  {/* Статус */}
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

                  {/* Кнопка удаления */}
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
                    Нет задач
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Попап добавления задачи */}
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