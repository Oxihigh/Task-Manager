import { addDays, subDays } from 'date-fns';

export const USERS = [
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

export const INITIAL_TASKS = [
    {
        id: 't1',
        title: 'Design Home Page',
        description: 'Create the initial design for the home page including hero section and features.',
        category: 'Feature',
        priority: 'High',
        assigneeId: 'u2',
        createdBy: 'u1',
        status: 'In Progress',
        dueDate: addDays(new Date(), 2).toISOString(),
        createdAt: subDays(new Date(), 1).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't2',
        title: 'Fix Login Bug',
        description: 'Users report an error when logging in with special characters.',
        category: 'Bug',
        priority: 'Urgent',
        assigneeId: 'u3',
        createdBy: 'u1',
        status: 'Pending',
        dueDate: new Date().toISOString(),
        createdAt: subDays(new Date(), 2).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't3',
        title: 'Database Optimization',
        description: 'Optimize queries for the user dashboard to improve load time.',
        category: 'Ops',
        priority: 'Medium',
        assigneeId: 'u4',
        createdBy: 'u2',
        status: 'Completed',
        dueDate: subDays(new Date(), 5).toISOString(),
        createdAt: subDays(new Date(), 10).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't4',
        title: 'Update Documentation',
        description: 'Update the API documentation to reflect the latest changes.',
        category: 'Ops',
        priority: 'Low',
        assigneeId: 'u2',
        createdBy: 'u1',
        status: 'Pending',
        dueDate: addDays(new Date(), 5).toISOString(),
        createdAt: subDays(new Date(), 1).toISOString(),
        comments: [],
        logs: []
    },
    {
        id: 't5',
        title: 'Client Meeting Preparation',
        description: 'Prepare slides for the upcoming client meeting.',
        category: 'Urgent',
        priority: 'High',
        assigneeId: 'u1',
        createdBy: 'u1',
        status: 'In Progress',
        dueDate: addDays(new Date(), 1).toISOString(),
        createdAt: subDays(new Date(), 0).toISOString(),
        comments: [],
        logs: []
    }
];

export const CATEGORIES = ['Bug', 'Feature', 'Ops', 'Personal', 'Urgent', 'Low Priority'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const STATUSES = ['Pending', 'In Progress', 'Blocked', 'Completed'];
