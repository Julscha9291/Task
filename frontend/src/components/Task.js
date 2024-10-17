import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import './Task.css';
import PropTypes from 'prop-types';

const Task = ({ show, onClose, createTask, editTask, taskToEdit, initialCategory }) => {
  const navigate = useNavigate();

  const categories = [
    { id: 'todo', name: 'To Do' },
    { id: 'inProgress', name: 'In Progress' },
    { id: 'awaitingFeedback', name: 'Awaiting Feedback' },
    { id: 'done', name: 'Done' }
  ];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory || '');
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

  const [users, setUsers] = useState([]);
  const [usedColors, setUsedColors] = useState({});
  const [selectedContacts, setSelectedContacts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}api/users/`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else {
          throw new Error('Received non-JSON response');
        }
      })
      .then(data => {
        console.log('Fetched users:', data); // Log the fetched users
        setUsers(data); // Set users state with received JSON data
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }, []);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category || ''); // Handle undefined category
      setDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date) : null);
      setSubtasks(taskToEdit.subtasks || []);
      setAssignedContacts(taskToEdit.contacts || []);
      setSelectedPriority(taskToEdit.priority || null);
    } else {
      setCategory(initialCategory || ''); // Set category to an empty string if undefined
    }
  }, [taskToEdit, initialCategory]);
  
  

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      setSubtasks([...subtasks, { text: subtaskText, completed: false }]);
      setSubtaskText('');
    }
  };

  const handleAssignContact = event => {
    const selectedContactId = parseInt(event.target.value);
    const selectedContact = users.find(user => user.id === selectedContactId);

    if (selectedContact && !assignedContacts.some(contact => contact.id === selectedContact.id)) {
      setAssignedContacts([...assignedContacts, selectedContact]);
      setSelectedContacts([...selectedContacts, selectedContact]);
      setUsedColors({ ...usedColors, [selectedContact.color]: true });
      console.log('Assigned contact color:', selectedContact.color); // Log the color of the assigned contact
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
        id: contact.id,  // ID des Kontakts
        first_name: contact.first_name,
        last_name: contact.last_name,
        color: contact.color
      }))
    };

    // Check for invalid contact IDs
    const invalidContacts = taskData.contacts.filter(contact => !contact.id);
    if (invalidContacts.length > 0) {
      console.error('Invalid contacts detected:', invalidContacts);
      return; // Prevent form submission
    }

    console.log('Task data to send:', taskData);

    if (taskToEdit) {
      fetch(`${process.env.REACT_APP_API_URL}/api/tasks/${taskToEdit.id}/`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
      })
      .then(response => {
          if (!response.ok) {
              return response.json().then(errorData => {
                  console.error('Error response:', errorData);
                  throw new Error(`HTTP error! status: ${response.status}`);
              });
          }
          return response.json();
      })
      .then(data => {
          console.log('Updated task:', data);
          handleClearAll();
          onClose();
          navigate('/board'); // Redirect to the board
         // window.location.reload();
      })
      .catch((error) => {
          console.error('Fetch error:', error);
      });
    } else {
      fetch(`${process.env.REACT_APP_API_URL}api/tasks/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
      })
      .then(response => {
          if (!response.ok) {
              return response.json().then(errorData => {
                  console.error('Error response:', errorData);
                  throw new Error(`HTTP error! status: ${response.status}`);
              });
          }
          return response.json();
      })
      .then(data => {
         // window.location.reload();
          console.log('Created task:', data);
          handleClearAll();
          onClose();
          navigate('/board'); // Redirect to the board
         
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
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          {formErrors.category && <div className="error-text">This field is required</div>}
          <label>Assigned to</label>
          <select onChange={handleAssignContact}>
            <option value="">Select contacts to assign</option>
            {users.map(user => (
              <option key={user.id} value={user.id} disabled={selectedContacts.some(c => c.id === user.id)}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
          <ul className="assigned-contacts">
            {assignedContacts.map(contact => (
              <li key={contact.id}>
                <div className="contact-info-task">
                  <div
                    className="contact-initials"
                    style={{ backgroundColor: contact.color  }}
                  >
                    {contact.first_name.charAt(0).toUpperCase()}
                    {contact.last_name.charAt(0).toUpperCase()}
                  </div>
                  <span>{contact.first_name} {contact.last_name}</span>
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
            <button type="button" className="clear-button-add" onClick={handleAddSubtask}>
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


Task.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
  editTask: PropTypes.func.isRequired,
  taskToEdit: PropTypes.object,
  initialCategory: PropTypes.string,
};

export default Task;
