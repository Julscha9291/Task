import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './Board.css';
import Task from './Task';
import TaskDetailsPopup from './TaskDetailsPopup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

const Board = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    awaitingFeedback: [],
    done: [],
  });

  const [showTask, setShowTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [category, setCategory] = useState(''); 

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/');
      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }
      const data = await response.json();
      const formattedTasks = {
        todo: data.filter(task => task.category === 'todo'),
        inProgress: data.filter(task => task.category === 'inProgress'),
        awaitingFeedback: data.filter(task => task.category === 'awaitingFeedback'),
        done: data.filter(task => task.category === 'done'),
      };
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Fehler beim Abrufen der Aufgaben:', error.message);
    }
  };

  const toggleTask = (category = '') => {
    navigate('/task');
    setShowTask(!showTask);
    if (category.trim() === '') {
      console.warn('Kategorie ist leer');
      return;
    }
    setCategory(category); 
  };
  
  
  const createTask = async (taskData) => {
    try {
      const response = await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await fetchTasks(); // Aktualisiere die Aufgabenliste
      setShowTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setIsEdit(false);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
    setShowTask(false);
    setIsEdit(false);
  };

  const handleEditTask = (editedTask) => {
    const taskData = {
      title: editedTask.title,
      description: editedTask.description,
      category: editedTask.category,
      due_date: editedTask.due_date,
      priority: editedTask.priority,
      subtasks: editedTask.subtasks.map(subtask => ({
        text: subtask.text,
        completed: subtask.completed,
      })),
      contacts: editedTask.contacts.map(contact => ({
        id: contact.id,
        name: contact.name
      }))
    };
  
    fetch(`http://localhost:8000/api/tasks/${editedTask.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Bearbeitete Aufgabe:', data);
      setTasks(prevTasks => {
        const updatedTasks = { ...prevTasks };
        updatedTasks[data.category] = updatedTasks[data.category].map(task => 
          task.id === data.id ? data : task
        );
        return updatedTasks;
      });
      setSelectedTask(null);
      setIsEdit(false);
    })
    .catch((error) => {
      console.error('Fehler beim Bearbeiten der Aufgabe:', error);
    });
  };

  const handleDeleteTask = (taskId) => {
    fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP-Fehler! Status: ${response.status}`);
      }
      setTasks(prevTasks => {
        const updatedTasks = { ...prevTasks };
        for (const category in updatedTasks) {
          updatedTasks[category] = updatedTasks[category].filter(task => task.id !== taskId);
        }
        return updatedTasks;
      });
      setSelectedTask(null);
    })
    .catch(error => {
      console.error('Fehler beim Löschen der Aufgabe:', error);
    });
  };
  

  const renderTasks = (taskList) => {
    return taskList.map((task, index) => (
      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
        {(provided) => (
          <li
            className="task"
            onClick={() => openTaskDetails(task)}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="task-title">
              {task.title}
              <button className={`priority-button ${task.priority?.toLowerCase() || 'low'}`}>
                {task.priority || 'Low'}
              </button>
            </div>
            <div className="task-content">{task.description}</div>
            <div className="assigned-contacts-board">
              {task.contacts && task.contacts.slice(0, 3).map(contact => (
       <div className="contact-initials-board" style={{ backgroundColor: contact.color }}>
       {contact.first_name && contact.last_name
         ? `${contact.first_name.charAt(0).toUpperCase()}${contact.last_name.charAt(0).toUpperCase()}`
         : ''}
     </div>
              ))}
              {task.contacts.length > 3 && (
                <div className="contact-initials" style={{ backgroundColor: 'grey' }}>
                  +{task.contacts.length - 3}
                </div>
              )}
            </div>
            {task.subtasks.length > 0 && (
              <div className="subtask-progress">
                {`${task.subtasks.filter(subtask => subtask.completed).length}/${task.subtasks.length}`}
                <div className="subtask-bar">
                  <div className="subtask-progress-fill" style={{ width: `${(task.subtasks.filter(subtask => subtask.completed).length / task.subtasks.length) * 100}%` }}></div>
                </div>
              </div>
            )}
          </li>
        )}
      </Draggable>
    ));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const start = tasks[source.droppableId];
    const finish = tasks[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start);
      const [movedTask] = newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, movedTask);

      const newTasks = {
        ...tasks,
        [source.droppableId]: newTaskIds,
      };

      setTasks(newTasks);
      return;
    }

    const startTaskIds = Array.from(start);
    const [movedTask] = startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finish);
    finishTaskIds.splice(destination.index, 0, movedTask);

    const newTasks = {
      ...tasks,
      [source.droppableId]: startTaskIds,
      [destination.droppableId]: finishTaskIds,
    };

    setTasks(newTasks);

    const updatedTaskData = {
      category: destination.droppableId,
    };

    console.log('Updating task category:', draggableId, 'with data:', updatedTaskData);

    fetch(`http://localhost:8000/api/tasks/${draggableId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTaskData),
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          console.error('Fehlerdetails:', err);
          throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Kategorie aktualisiert:', data);
    })
    .catch((error) => {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
    });
  };

  return (
    <div className="board-container">
       <div className="header-board">
        Board Tasks
      </div>

    <button className="new-task-button" onClick={() => toggleTask('')}>
      <FontAwesomeIcon icon={faPlus} className="navbar-icon" />
      <p className="add-text">Add new Task</p>
    </button>
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {Object.keys(tasks).map(category => (
          <Droppable key={category} droppableId={category}>
            {(provided) => (
              <div className="board-column" ref={provided.innerRef} {...provided.droppableProps}>
              <h3 className="column-title">{category.replace(/([A-Z])/g, ' $1')}</h3>
              <ul className="task-list">
                  {renderTasks(tasks[category])}
                  {provided.placeholder}
              </ul>
          </div>
            )}
          </Droppable>
        ))}
      </div>
      <TaskDetailsPopup task={selectedTask} onClose={closeTaskDetails} onEdit={() => setIsEdit(true)} onDelete={handleDeleteTask} />
      <Task 
        show={showTask || isEdit} 
        onClose={closeTaskDetails} 
        createTask={createTask} 
        editTask={handleEditTask} 
        taskToEdit={isEdit ? selectedTask : null} 
        initialCategory={category}  
/>

      </DragDropContext>
      </div>
  );
};

export default Board;