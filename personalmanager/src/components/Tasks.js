import React, { useState, useCallback, useEffect } from 'react';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';

const TaskPage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const tokenid = localStorage.getItem('jwttoken');
  
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endtime, setEndTime] = useState('');

  const [loading, setLoading] = useState(true);

  // Function to add a new task
  const addNewTask = async (e) => {
    e.preventDefault();
    const sqlDateTime = endtime.replace("T", " ") + ":00";
    const taskdata = { username, tokenid, title, description, endtime: sqlDateTime };
    
    try {
      const responseAddTask = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenid}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskdata)
      });
      if (responseAddTask.ok) {
        alert("Task Added Successfully");
        fetchData();
      } else {
        alert("Error in adding Task");
      }
    } catch (error) {
      console.error('Error posting task:', error);
      alert(error);
    }
  };

  // Function to fetch tasks
  const fetchData = useCallback(async () => {
    if (!tokenid) {
      console.error('No token found');
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true); // start loading
      const responseTask = await fetch('http://localhost:5000/tasklist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenid}`,
          'Content-Type': 'application/json',
        }
      });
  
      const dataTask = await responseTask.json();
      if (!responseTask.ok) {
        throw new Error('Failed to fetch tasks');
      }
      setTasks(dataTask);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert(error.message);
    } finally {
      setLoading(false); // stop loading
    }
  }, [tokenid]);
  

  useEffect(() => {
    const controller = new AbortController();
    fetchData();
    return () => controller.abort();
  }, [fetchData]);

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");
    if (isConfirmed) {
      localStorage.removeItem('jwttoken');
      localStorage.removeItem('username');
      localStorage.setItem('isAuthenticated', 'false');
      navigate('/login', { replace: true });
      alert("Logging out...");
    } else {
      alert("Logout cancelled.");
    }
  };

  const deleteTask = async( title) => {
    
    const isConfirmed = window.confirm("Are you sure you want to delete this task? ");
  if (!isConfirmed) return;
  try{
    const DelTask= {title}
    const responseDelNote = await fetch('http://localhost:5000/deletetask', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(DelTask)
    });
    if (responseDelNote.ok) {
      alert("Task Deleted Successfully");
      fetchData();
    } else {
      alert("Error in deleting Task");
    }

  }catch(e){
    alert(e);
  }


  };

  return (
    <div className="container-fluid vh-100 d-flex p-0 image-side">
      
      {/* Sidebar Navbar */}
      <div className="d-flex flex-column p-3 bg-light" style={{ width: '250px', height: '100vh' }}>
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
          <i className="bi bi-bootstrap-fill me-2 fs-4"></i>
          <span className="fs-4">PERSONAL MANAGER</span>
        </a>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <a href="/home" className="nav-link text-dark fw-semibold fs-4">
               Home
            </a>
          </li>
          <li>
            <a href="/tasks" className="nav-link text-secondary fw-semibold fs-4">
              Tasks
            </a>
          </li>
          <li>
            <a href="/notes" className="nav-link text-dark fw-semibold fs-4">
               Notes
            </a>
          </li>
        </ul>
        <hr />
        <button className="btn btn-secondary" onClick={()=>{fetchData();alert("Fetched Data");}}>Refresh</button>
        <hr />
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {/* Tasks List */}
      <div className="col-md-7 p-4 d-flex flex-column" id="tasks" style={{ height: "calc(100vh - 30px)" }}>
        <div className="card shadow-sm flex-grow-1 d-flex flex-column">
          <div className="card-body overflow-auto">
            <h4 className="card-title">Tasks</h4>
            {loading?(<div className="d-flex justify-content-center align-items-center" style={{ height: '80%' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) :(
              tasks.length>0 ? (
              tasks.map((task, index) => (
              <div className="card-body shadow-lg rounded border border-dark m-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">{task.title}</h5>
                  <p className="card-text">{task.description}</p>
                  <p className="card-text"><strong>End Time:</strong> {task.endtime}</p>
                </div>
                <button className="btn btn-danger btn-sm ms-3" onClick={() => deleteTask(task.title)}>
                  Delete
                </button>
              </div>
            </div>
            ))):
            (<p>No tasks found.</p>)
          ) 
            
          }
            
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="col-md-4 d-flex align-items-center justify-content-center bg-white p-5 shadow-lg">
        <div className="w-100 shadow-lg p-3 mb-5 rounded" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Personal Manager</h2>
          <h4 className="text-center mb-4 text-muted">New Task</h4>
          <form onSubmit={addNewTask}>
            <div className="mb-3">
              <label htmlFor="taskTitle" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="taskTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="taskDescription" className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                id="taskDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="taskEndTime" className="form-label">End Time</label>
              <input
                type="datetime-local"
                className="form-control"
                id="taskEndTime"
                value={endtime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Add New Task</button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default TaskPage;
