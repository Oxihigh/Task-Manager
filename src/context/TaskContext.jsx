import { createContext, useContext, useReducer, useEffect } from 'react';
import { taskApi } from '../api';
import { useUser } from './UserContext';

const TaskContext = createContext();

const taskReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TASKS':
            return { ...state, tasks: action.payload, loading: false };
        case 'ADD_TASK':
            return { ...state, tasks: [...state.tasks, action.payload] };
        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.id ? action.payload : task
                ),
            };
        case 'DELETE_TASK':
            return {
                ...state,
                tasks: state.tasks.filter(task => task.id !== action.payload),
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_SEARCH':
            return { ...state, searchQuery: action.payload };
        case 'TOGGLE_CREATE_MODAL':
            return { ...state, isCreateModalOpen: action.payload };
        default:
            return state;
    }
};

export function TaskProvider({ children }) {
    const { currentUser } = useUser();
    const [state, dispatch] = useReducer(taskReducer, {
        tasks: [],
        loading: true,
        error: null,
        searchQuery: '',
        isCreateModalOpen: false
    });

    // Fetch tasks on mount
    useEffect(() => {
        if (currentUser) refreshTasks();
    }, [currentUser]);

    const refreshTasks = async () => {
        try {
            const tasks = await taskApi.getTasks();
            dispatch({ type: 'SET_TASKS', payload: tasks });
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const addTask = async (taskData) => {
        try {
            const newTask = {
                ...taskData,
                createdAt: new Date().toISOString(),
                createdBy: currentUser.id,
                assigneeIds: taskData.assigneeIds || [],
                comments: [],
                logs: []
            };
            const created = await taskApi.createTask(newTask);
            dispatch({ type: 'ADD_TASK', payload: created });
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to create task');
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const updated = await taskApi.updateTask(taskId, { status: newStatus });
            dispatch({ type: 'UPDATE_TASK', payload: updated });
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to update status');
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            const updated = await taskApi.updateTask(taskId, updates);
            dispatch({ type: 'UPDATE_TASK', payload: updated });
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to update task');
        }
    }

    const addComment = async (taskId, text, parentId = null) => {
        try {
            const newComment = await taskApi.addComment(taskId, text, parentId);
            const task = state.tasks.find(t => t.id === taskId);
            if (task) {
                // For full consistency, let's fetch the task again to get new logs too
                const freshTask = await taskApi.getTask(taskId);
                dispatch({ type: 'UPDATE_TASK', payload: freshTask });
            }
        } catch (err) {
            console.error('Comment failed', err);
        }
    };

    const setSearchQuery = (query) => dispatch({ type: 'SET_SEARCH', payload: query });
    const setCreateModalOpen = (isOpen) => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: isOpen });

    // Filter tasks for Interns - they only see their assigned tasks
    const filteredTasks = currentUser?.role === 'Intern'
        ? state.tasks.filter(t => (t.assigneeIds || [t.assigneeId]).includes(currentUser.id))
        : state.tasks;

    return (
        <TaskContext.Provider value={{
            tasks: filteredTasks,
            allTasks: state.tasks, // Keep full list for admin operations
            loading: state.loading,
            error: state.error,
            searchQuery: state.searchQuery,
            isCreateModalOpen: state.isCreateModalOpen,
            refreshTasks,
            addTask,
            updateTaskStatus,
            updateTask,
            addComment,
            setSearchQuery,
            setCreateModalOpen
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
