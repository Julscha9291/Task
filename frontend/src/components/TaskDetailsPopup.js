import React from 'react';
import './TaskDetailsPopup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const TaskDetailsPopup = ({ task, onClose, onEdit, onDelete }) => {
  if (!task) return null;

  const formatDate = (dateString) => {
    if (!dateString) {
      return ''; // Oder einen Standardwert zurückgeben, je nach Anwendungsfall
    }

    const date = new Date(dateString);

    // Überprüfe, ob das Datum gültig ist
    if (isNaN(date.getTime())) {
      return ''; // Oder einen Standardwert zurückgeben, falls das Datum ungültig ist
    }

    return date.toLocaleDateString();
  };

  const mapCategoryName = (category) => {
    switch (category) {
      case 'inProgress':
        return 'in Progress';
      case 'awaitingFeedback':
        return 'awaiting Feedback';
      default:
        return category;
    }
  };

  const handleEditClick = () => {
    onEdit(task);
  };

  const handleSubtaskToggle = async (subtaskIndex) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;

    try {
      const response = await fetch(`http://localhost:8000/api/tasks/${task.id}/subtasks/${subtaskIndex}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: updatedSubtasks[subtaskIndex].completed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      task.subtasks = updatedSubtasks; // Update local state for re-render
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const calculateProgress = () => {
    if (task.subtasks.length === 0) return 0;

    const completedCount = task.subtasks.filter(subtask => subtask.completed).length;
    return (completedCount / task.subtasks.length) * 100;
  };

  return (
    <div className="task-details-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="task-title-popup">
          <h2>{task.title}</h2>
          <button className={`priority-button-popup ${task.priority?.toLowerCase() || 'low'}`}>
            {task.priority || 'Low'}
          </button>
        </div>
        <p><strong>Description:</strong> {task.description}</p>
        <p>
          <strong>Category:</strong> {mapCategoryName(task.category)}
        </p>
        {task.due_date && <p><strong>Due Date:</strong> {formatDate(task.due_date)}</p>}
        {task.subtasks.length > 0 && (
          <div className="subtask-input">
            <p><strong>Subtasks:</strong></p>
            <ul className="subtask-list">
              {task.subtasks.map((subtask, index) => (
                <li key={index} className={subtask.completed ? 'completed' : ''}>
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(index)}
                  />
                  <label>{subtask.text}</label>
                </li>
              ))}
            </ul>
            <div className="subtask-progress">
              Progress: {`${task.subtasks.filter(subtask => subtask.completed).length}/${task.subtasks.length}`}
              <div className="subtask-bar">
                <div
                  className="subtask-progress-fill"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {task.contacts.length > 0 && (
          <div>
            <p><strong>Assigned Contacts:</strong></p>
            <div className="assigned-contacts">
              {task.contacts.map(contact => (
                <div key={contact.id} className="contact-info">
                  <div className="contact-initials" style={{ backgroundColor: contact.color }}>
                    {contact.first_name && contact.last_name
                      ? `${contact.first_name.charAt(0).toUpperCase()}${contact.last_name.charAt(0).toUpperCase()}`
                      : ''}
                  </div>
                  <span>{contact.first_name} {contact.last_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="icon-container">
          <FontAwesomeIcon icon={faEdit} className="edit-icon" onClick={handleEditClick} />
          <FontAwesomeIcon icon={faTrash} className="delete-icon" onClick={() => onDelete(task.id)} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPopup;
