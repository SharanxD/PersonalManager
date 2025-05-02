import React, { useState, useEffect ,useCallback} from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const tokenid = localStorage.getItem('jwttoken');
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
      if (!tokenid) {
        console.error('No token found');
        setLoading(false);
        return;
      }
  
      try {
        const responseData = await fetch('http://localhost:5000/alldata', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenid}`,
            'Content-Type': 'application/json'
          }
        });
        const alldata = await responseData.json();
        if (!responseData.ok) {
          if(alldata["message"]==="JWT Expired Please login again."){
            alert(alldata["message"]);
            navigate('/login', {replace:true});
          }
          else{
            throw new Error('Failed to fetch Data');
          }
        }
        setTasks(alldata["results"]["tasks"]);
        setNotes(alldata["results"]["notes"]);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(error.message);
      } finally {
        setLoading(false); // stop loading
      }
    }, [tokenid,navigate]);

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
      localStorage.setItem("isAuthenticated", "false");
      navigate('/login', { replace: true });
      alert("Logging out...");
    } else {
      alert("Logout cancelled.");
    }
  };
  return (
    <div className="container-fluid vh-100 d-flex p-0 image-side">
      <div className="d-flex flex-column p-3 bg-light" style={{ width: '159px', height: '100vh' }}>
        <a href="/home" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
          <span className="fs-4">PERSONAL MANAGER</span>
        </a>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <a href="/home" className="nav-link text-secondary fs-4  ">
              Home
            </a>
          </li>
          <li>
            <a href="/tasks" className="nav-link text-dark fw-semibold fs-4" >

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

      {/* Displaying tasks */}
      <div className='container-fluid vh-100 d-flex p-0'>

      <div className='container-fluid vh-100 d-flex flex-column'>
        <div className='d-inline-block rounded bg-light text-end mx-4 mt-4 mb-2 p-3'>
        <h2 className='text-dark'>Welcome {username}</h2></div>
        <div className='container-fluid vh-100 d-flex p-0'>


        <div className="col-md-6 p-4  d-flex flex-column" id="tasks" style={{height:'100%'}}>
          <div className="card shadow-sm flex-grow-1 d-flex flex-column">
            <div className="card-body">
              <h4 className="card-title">Tasks</h4>
              <hr/>
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '80%' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                tasks.length > 0 ? (
                  tasks.map((task, index) => (
                      <div className="card-body shadow-lg border border-dark rounded m-3">
                        <h5 className="card-title">{task.title}</h5>
                        <p className="card-text">{task.description}</p>
                        <p className="card-text"><strong>End Time:</strong> {task.endtime}</p>
                      </div>
                  ))
                ) : (
                  <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}><h3 className='text-muted'>No tasks found.</h3></div>
                )
              )}
            </div>
          </div>
      </div>

      {/* Displaying notes */}
      <div className="col-md-6 p-4 d-flex flex-column" id="Notes" style={{height:'100%'}}>
        <div className="card shadow-sm flex-grow-1 d-flex flex-column">
          <div className="card-body">
            <h4 className="card-title">Notes</h4>
            <hr/>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '80%' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              notes.length > 0 ? (
                notes.map((note, index) => (
                    <div className="card-body rounded border border-dark shadow-lg m-3 p-4">
                      <h5 className="card-title">{note.notedata}</h5>
                      <p className="card-text"><strong>Created Time: </strong>{note.createtime.split('.')[0]}</p>
                    </div>
                ))
              ) : (
                <div className='d-flex justify-content-center align-items-center' style={{ height: '100%' }}><h3 className='text-muted'>No Notes found.</h3></div>
              )
            )}
          </div>
        </div>
      </div>
      </div></div>

      
      </div>
    </div>
  );
};

export default HomePage;
