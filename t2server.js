// This is a simplified full-stack structure for a Project Management Tool

// --- Backend (Node.js + Express + MongoDB) ---

// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/projectmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Project = require('./models/Project');
const Task = require('./models/Task');

app.post('/projects', async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.send(project);
});

app.get('/projects', async (req, res) => {
  const projects = await Project.find().populate('tasks');
  res.send(projects);
});

app.post('/tasks', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.send(task);
});

app.listen(5000, () => console.log('Server running on port 5000'));

// --- Mongoose Models ---

// File: models/Project.js
const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  deadline: Date,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});
module.exports = mongoose.model('Project', ProjectSchema);

// File: models/Task.js
const TaskSchema = new mongoose.Schema({
  title: String,
  assignedTo: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  deadline: Date
});
module.exports = mongoose.model('Task', TaskSchema);


// --- Frontend (React) ---

// File: App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });

  const fetchProjects = async () => {
    const res = await axios.get('http://localhost:5000/projects');
    setProjects(res.data);
  };

  const createProject = async () => {
    await axios.post('http://localhost:5000/projects', form);
    fetchProjects();
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Project Manager</h1>

      <div className="my-4">
        <input className="border p-2" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 ml-2" placeholder="Description" onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="date" className="border p-2 ml-2" onChange={e => setForm({ ...form, deadline: e.target.value })} />
        <button onClick={createProject} className="ml-2 bg-blue-500 text-white px-4 py-2">Create</button>
      </div>

      <ul>
        {projects.map(p => (
          <li key={p._id} className="border p-4 mb-2">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p>{p.description}</p>
            <p><strong>Deadline:</strong> {new Date(p.deadline).toLocaleDateString()}</p>
            <p><strong>Tasks:</strong> {p.tasks.length}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
