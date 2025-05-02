import React, { useState, useEffect, useCallback } from 'react';
import '../styles/LoginPage.css';
import { useNavigate } from 'react-router-dom';

const NotesPage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const tokenid = localStorage.getItem('jwttoken');
  const [notes, setNotes] = useState([]);
  const [notedata, setDesc] = useState('');
  const error='';
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!tokenid) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true); // start loading
      const responseNote = await fetch('http://localhost:5000/noteslist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenid}`,
          'Content-Type': 'application/json',
        }
      });

      const dataNotes = await responseNote.json();
      if (!responseNote.ok) {
        if(dataNotes["message"]==="JWT Expired Please login again."){
          alert(dataNotes["message"]);
          navigate('/login', {replace:true});
        }
        else{
          throw new Error('Failed to fetch Notes');
        }
      
      }
      setNotes(dataNotes);
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

  const addnewnote = async (e) => {
    e.preventDefault();
    const postdata = { username, tokenid, notedata };
    try {
      const responseAddNote = await fetch('http://localhost:5000/notes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenid}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postdata)
      });
      const AddNotebody= await responseAddNote.json();
      if (responseAddNote.ok) {
        
        alert("Note Added Successfully");
        setDesc(''); // clear input
        fetchData(); // refresh notes
      } else {
        if(AddNotebody["message"]==="JWT Expired Please login again."){
          alert(AddNotebody["message"]);
          navigate('/login', {replace:true});
        }
        else{
          throw new Error('Error in Adding Notes');
        }
      }
    } catch (error) {
      console.error('Error in posting:', error);
      alert(error.message);
    }
  };

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

  const deleteNote= async( notedata) => {
    
    const isConfirmed = window.confirm("Are you sure you want to delete this note? ");
  if (!isConfirmed) return;
  try{
    const DelNote= {notedata}
    const responseDelNote = await fetch('http://localhost:5000/deletenote', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(DelNote)
    });
    if (responseDelNote.ok) {
      alert("Note Deleted Successfully");
      fetchData();
    } else {
      alert("Error in deleting Note");
    }

  }catch(e){
    alert(e);
  }


  };

  return (
    <div className="container-fluid vh-100 d-flex p-0 image-side">
      {/* NAVBAR */}
      <div className="d-flex flex-column p-3 bg-light" style={{ width: '150px', height: '100vh' }}>
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
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
            <a href="/tasks" className="nav-link text-dark fw-semibold fs-4 ">
              Tasks
            </a>
          </li>
          <li>
            <a href="/notes" className="nav-link text-secondary fs-4  fw-semibold">
              Notes
            </a>
          </li>
        </ul>
        <hr />
        <button className="btn btn-secondary" onClick={()=>{fetchData();alert("Fetched Data");}}>Refresh</button>
        <hr />
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {/* NOTES VIEW */}
      <div className="col-md-7 p-4 d-flex flex-column vh-100" id="Notes">
        <div className="card shadow-sm flex-grow-1 d-flex flex-column">
          <div className="card-body overflow-auto">
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
                    <div className="card-body shadow-lg border border-dark rounded m-3 p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                      <h5 className="card-title">{note.notedata}</h5>
                      <p className="card-text"><strong>Created Time: </strong>{note.createtime.split('.')[0]}</p>
                      </div>
                      <button className="btn btn-danger btn-sm ms-3" onClick={() => deleteNote(note.notedata)}>
                  Delete
                </button>
                      </div>
                    </div>
                ))
              ) : (
                <div className='d-flex justify-content-center align-items-center' style={{ height: '90%' }}><h3 className='text-muted'>No Notes found.</h3></div>
              )
            )}
          </div>
        </div>
      </div>

      {/* New Notes Form */}
      <div className="col-md-4 d-flex align-items-center justify-content-center bg-white p-5 shadow-lg">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="w-100 shadow-lg p-3 mb-5 rounded" style={{ maxWidth: '500px' }}>
          <h2 className="text-center mb-4">Personal Manager</h2>
          <h4 className="text-center mb-4 text-muted">New Note</h4>
          <form onSubmit={addnewnote}>
            <div className="mb-3">
              <label htmlFor="Description" className="form-label">Description</label>
              <input
                type="text"
                className="form-control"
                id="Description"
                value={notedata}
                onChange={(e) => setDesc(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">Add New Note</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
