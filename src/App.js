import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [taskNameEdit, setTaskNameEdit] = useState('');
  const [taskDescEdit, setTaskDescEdit] = useState('');
  const [taskStatusEdit, setTaskStatusEdit] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [allData, setAllData] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [edit, setEdit] = useState("");

  useEffect(() => {
    const token = getDataFromCookie('token');
    if (token) {
      setToken(token);
      setShowLoginForm(false);
    }
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);


  const blankData = () => {
 setTaskName("");
 setTaskDesc("");
 setTaskStatus("");
 setTaskNameEdit("");
 setTaskDescEdit("");
 setTaskStatusEdit("");
  };


  const handleSignup = async () => {
  try {
    const response = await axios.post('http://localhost:3001/signup', { email, password });
    setToken(response.data.token);
    setDataInCookie("token", response.data.token);
    setMessage(response.data.message);
    setShowLoginForm(false);
    setAllData([]);
    await blankData();
    await handleShowData(response.data.token);
  } catch (error) {
    console.log(error.response)
    setMessage(error.response.data.message);
  }
};

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      setToken(response.data.token); 
      setDataInCookie("token", response.data.token);
      setMessage(response.data.message);
      setShowLoginForm(false);
      blankData();
      await handleShowData(response.data.token); 
    } catch (error) {
      setMessage('Invalid email or password');
    }
  };


  const handleLogout = () => {
    setToken("");
    deleteCookie("token");
    setShowLoginForm(true);
    setMessage("Logout Successfully.");
  };

  const handleShowData = async (token) => {
    try {
      const response = await axios.get('http://localhost:3001/showdata', {
        params: { email },
        headers: { Authorization: `${token}` } // Include token in headers
      });

      setAllData(response.data.data);
    } catch (error) {
      setMessage('Error fetching data');
    }
  };


  const handleCreateTask = () => {
    const formData = {
      task_name: taskName,
      task_desc: taskDesc,
      task_status: taskStatus,
      task_email: email
    };

    axios.post('http://localhost:3001/create-task', formData, {
      headers: { Authorization: `${token}` } // Include token in headers
    })
      .then(response => {
        setMessage(response.data.message);
        handleShowData(token);
      })
      .catch(error => {
        setMessage('Error creating task');
      });
  };

  const handleEdit = (id, type) => {
    setEdit(id);
    if (type==="save") {
      axios.put('http://localhost:3001/edit', {
        id,
        name: taskNameEdit,
        desc: taskDescEdit,
        status: taskStatusEdit,
        email
      }, {
        headers: { Authorization: `${token}` } 
      })
      .then(response => {
        setMessage(response.data.message);
        handleShowData(token);
        setEdit("");
      })
      .catch(error => {
        setMessage('Error editing data');
      });
    }
  };

  const handleDelete = (id) => {
    axios.delete('http://localhost:3001/delete', {
      params: { id },
      headers: { Authorization: `${token}` } // Include token in headers
    })
    .then(response => {
      setMessage(response.data.message);
      handleShowData(token);
    })
    .catch(error => {
      setMessage('Error deleting data');
    });
  };

  // Set data in a cookie
  const setDataInCookie = (key, value) => {
    Cookies.set(key, value, { expires: 7 });
  };

  // Get data from a cookie
  const getDataFromCookie = (key) => {
    const data = Cookies.get(key);
    return data;
  };

  const deleteCookie = (key) => {
    Cookies.remove(key);
  };

  return (
    <div>
       <div className="container">
        {showMessage && (
          <p className="message-popup">{message}</p>
        )}
         {showLoginForm && (
            <div>
              <h1>Login/Signup</h1>
              <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={handleSignup}>Signup</button>
              <button onClick={handleLogin}>Login</button>
            </div>
          )}
          {!showLoginForm && (<div>
            <button onClick={handleLogout}>Logout</button>
            <table border="1">
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {console.log(allData)}
                {allData && allData.map((dataItem, index) => (
                  <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {dataItem.task_name}
                        {edit === dataItem.id && <input type="text" placeholder="Task Name" onChange={e => setTaskNameEdit(e.target.value)} />}
                      </td>
                      <td>
                        {dataItem.task_desc}
                        {edit === dataItem.id && <input type="text" placeholder="Task Desc" onChange={e => setTaskDescEdit(e.target.value)} />}
                      </td>
                      <td>
                        {dataItem.task_status}
                        {edit === dataItem.id && <input type="text" placeholder="Task Status" onChange={e => setTaskStatusEdit(e.target.value)} />}
                      </td>
                      <td>{ edit !== dataItem.id && <button onClick={() => handleEdit(dataItem.id, "edit")}>Edit Task</button>}
                          { edit === dataItem.id && <button onClick={() => handleEdit(dataItem.id, "save")}>Save Task</button>}
                          <button onClick={() => handleDelete(dataItem.id)}>Delete Task</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Create Task</h2>
            <input type="text" placeholder="Task Name" value={taskName} onChange={e => setTaskName(e.target.value)} />
            <input type="text" placeholder="Task Description" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
            <input type="text" placeholder="Task Status" value={taskStatus} onChange={e => setTaskStatus(e.target.value)} />
            <button onClick={handleCreateTask}>Create Task</button>
          
            </div>)}
      </div>
    </div>
  );
}

export default App;
