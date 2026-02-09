const fs = require('fs');
const path = require('path');

const USERS = [
    { id: 'u1', name: 'Aarav Patel', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav' },
    { id: 'u2', name: 'Diya Sharma', role: 'Manager', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diya' },
    { id: 'u3', name: 'Kabir Singh', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir' },
    { id: 'u4', name: 'Aditi Rao', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditi' },
    { id: 'u5', name: 'Rohan Gupta', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan' },
    { id: 'u6', name: 'Sneha Verma', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
    { id: 'u7', name: 'Vikram Malhotra', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' },
    { id: 'u8', name: 'Priya Iyer', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { id: 'u9', name: 'Rahul Mehta', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
    { id: 'u10', name: 'Ananya Das', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
    { id: 'u11', name: 'Ishaan Chopra', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan' },
    { id: 'u12', name: 'Kavita Reddy', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita' },
    { id: 'u13', name: 'Arjun Nair', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
    { id: 'u14', name: 'Meera Joshi', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera' },
    { id: 'u15', name: 'Siddharth Jain', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siddharth' },
    { id: 'u16', name: 'Nisha Kapoor', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha' },
    { id: 'u17', name: 'Varun Khanna', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Varun' },
    { id: 'u18', name: 'Zara Khan', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara' },
    { id: 'u19', name: 'Dev Mishra', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev' },
    { id: 'u20', name: 'Riya Saxena', role: 'Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya' },
];

const TASKS = [
    {
        id: 't1',
        title: 'Design Home Page',
        description: 'Create the initial design for the home page.',
        category: 'Feature',
        priority: 'High',
        assigneeId: 'u2',
        createdBy: 'u1',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't2',
        title: 'Fix Login Bug',
        description: 'Users report an error when logging in.',
        category: 'Bug',
        priority: 'Urgent',
        assigneeId: 'u3',
        createdBy: 'u1',
        status: 'Pending',
        dueDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't3',
        title: 'Database Optimization',
        description: 'Optimize queries for the user dashboard.',
        category: 'Ops',
        priority: 'Medium',
        assigneeId: 'u4',
        createdBy: 'u2',
        status: 'Completed',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't4',
        title: 'Parent Task',
        description: 'This must be completed first.',
        category: 'Feature',
        priority: 'High',
        assigneeId: 'u2',
        createdBy: 'u1',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't5',
        title: 'Dependent Task',
        description: 'Can only start after Parent Task is done.',
        category: 'Feature',
        priority: 'High',
        assigneeId: 'u3',
        createdBy: 'u1',
        status: 'Pending',
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        dependencyId: 't4',
        comments: [],
        logs: []
    }
];

const db = {
    users: USERS,
    tasks: TASKS,
    notifications: []
};

fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));
console.log('Database seeded!');
