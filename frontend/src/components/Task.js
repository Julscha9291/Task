import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import './Task.css';

const Task = ({ show, onClose, createTask, editTask, taskToEdit }) => {
  const navigate = useNavigate();

  const categories = [
    { id: 'todo', name: 'To Do' },
    { id: 'inProgress', name: 'In Progress' },
    { id: 'awaitingFeedback', name: 'Awaiting Feedback' },
    { id: 'done', name: 'Done' }
  ];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [subtaskText, setSubtaskText] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [assignedContacts, setAssignedContacts] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [formErrors, setFormErrors] = useState({
    title: false,
    description: false,
    category: false
  });

  const dummyContacts = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Michael Johnson' },
    { id: 4, name: 'Emily Davis' },
    { id: 5, name: 'David Brown' }
  ];

  const [usedColors, setUsedColors] = useState({});
  const [selectedContacts, setSelectedContacts] = useState([]);

  const getRandomColor = () => {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
    const availableColors = colors.filter(color => !usedColors[color]);
    if (availableColors.length === 0) {
      return '#6c757d';
    }
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date) : null);
      setSubtasks(taskToEdit.subtasks || []);
      setAssignedContacts(taskToEdit.contacts || []);
      setSelectedPriority(taskToEdit.priority || null);
      setSelectedContacts(taskToEdit.contacts || []);
    }
  }, [taskToEdit]);

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      setSubtasks([...subtasks, { text: subtaskText, completed: false }]);
      setSubtaskText('');
    }
  };

  const handleAssignContact = event => {
    const selectedContactId = parseInt(event.target.value);
    const selectedContact = dummyContacts.find(contact => contact.id === selectedContactId);

    if (selectedContact && !selectedContacts.some(contact => contact.id === selectedContact.id)) {
      const color = getRandomColor();
      setAssignedContacts([...assignedContacts, { ...selectedContact, color }]);
      setUsedColors({ ...usedColors, [color]: true });
      setSelectedContacts([...selectedContacts, selectedContact]);
    }
  };

  const handleRemoveAssignedContact = contactId => {
    const removedContact = assignedContacts.find(contact => contact.id === contactId);
    if (removedContact) {
      const { color } = removedContact;
      const updatedContacts = assignedContacts.filter(contact => contact.id !== contactId);
      setAssignedContacts(updatedContacts);
      setUsedColors({ ...usedColors, [color]: false });
      setSelectedContacts(selectedContacts.filter(contact => contact.id !== contactId));
    }
  };

  const handleSelectPriority = priority => {
    setSelectedPriority(priority);
  };

  const handleClearAll = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setDueDate(null);
    setSubtaskText('');
    setSubtasks([]);
    setAssignedContacts([]);
    setSelectedContacts([]);
    setSelectedPriority(null);
    setUsedColors({});
    setFormErrors({
      title: false,
      description: false,
      category: false
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};

    if (!title.trim()) {
      errors = { ...errors, title: true };
    }
    if (!description.trim()) {
      errors = { ...errors, description: true };
    }
    if (!category) {
      errors = { ...errors, category: true };
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const taskData = {
      title,
      description,
      category,
      due_date: dueDate,
      priority: selectedPriority,
      subtasks: subtasks.map(subtask => ({
        text: subtask.text,
        completed: subtask.completed
      })),
      contacts: assignedContacts.map(contact => ({
        name: contact.name
      }))
    };

    if (taskToEdit) {
      // Edit existing task
      fetch(`http://localhost:8000/api/tasks/${taskToEdit.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Updated task:', data);
        handleClearAll();
        onClose();
        navigate('/board'); // Redirect to the board
        window.location.reload()
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });
    } else {
      // Create new task
      fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Created task:', data);
        handleClearAll();
        onClose();
        navigate('/board'); // Redirect to the board
        window.location.reload()
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });
    }
  };

  return (
    <div className={`task-container ${show ? 'show' : ''}`}>
      <div className="popup-content">
      <button className="close-button" onClick={() => { onClose(); navigate('/board'); }}>&times;</button>
        <div className="task-title-popup">
          <h2>{taskToEdit ? 'Edit Task' : 'Add Task'}</h2>
        </div>
      </div>
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-left">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a title"
            className={formErrors.title ? 'error' : ''}
          />
          {formErrors.title && <div className="error-text">This field is required</div>}
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter a description"
            className={formErrors.description ? 'error' : ''}
          ></textarea>
          {formErrors.description && <div className="error-text">This field is required</div>}
          <label>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={formErrors.category ? 'error' : ''}
          >
            <option value="">Select task category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formErrors.category && <div className="error-text">This field is required</div>}
          <label>Assigned to</label>
          <select onChange={handleAssignContact}>
            <option value="">Select contacts to assign</option>
            {dummyContacts.map(contact => (
              <option key={contact.id} value={contact.id} disabled={selectedContacts.some(c => c.id === contact.id)}>
                {contact.name}
              </option>
            ))}
          </select>
          <ul className="assigned-contacts">
            {assignedContacts.map(contact => (
              <li key={contact.id}>
                <div className="contact-info">
                  <div
                    className="contact-initials"
                    style={{ backgroundColor: contact.color }}
                  >
                    {contact.name
                      .split(' ')
                      .map(part => part.charAt(0))
                      .join('')
                      .toUpperCase()}
                  </div>
                  <span>{contact.name}</span>
                </div>
                <button
                  type="button"
                  className="remove-contact"
                  onClick={() => handleRemoveAssignedContact(contact.id)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-right">
          <label>Due date</label>
          <Datetime
            value={dueDate}
            onChange={date => setDueDate(date)}
            dateFormat="DD/MM/YYYY"
            timeFormat={false}
            inputProps={{ placeholder: 'Select due date' }}
          />
          <label>Prio</label>
          <div className="prio-buttons">
            <button
              type="button"
              className={`prio-button urgent ${selectedPriority === 'urgent' ? 'selected' : ''}`}
              onClick={() => handleSelectPriority('urgent')}
            >
              Urgent
            </button>
            <button
              type="button"
              className={`prio-button medium ${selectedPriority === 'medium' ? 'selected' : ''}`}
              onClick={() => handleSelectPriority('medium')}
            >
              Medium
            </button>
            <button
              type="button"
              className={`prio-button low ${selectedPriority === 'low' ? 'selected' : ''}`}
              onClick={() => handleSelectPriority('low')}
            >
              Low
            </button>
          </div>
          <label>Subtasks</label>
          <div className="subtask-input">
            <input
              type="text"
              value={subtaskText}
              onChange={e => setSubtaskText(e.target.value)}
              placeholder="Add new subtask"
            />
            <button type="button" onClick={handleAddSubtask}>
              Add
            </button>
          </div>
          <ul className="subtask-list">
            {subtasks.map((subtask, index) => (
              <li key={index} className={subtask.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => {
                    const updatedSubtasks = [...subtasks];
                    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
                    setSubtasks(updatedSubtasks);
                  }}
                />
                <span>{subtask.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="form-footer">
          <button type="button" className="clear-button" onClick={handleClearAll}>
            Clear
          </button>
          <button type="submit" className="create-button">
            {taskToEdit ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Task;
