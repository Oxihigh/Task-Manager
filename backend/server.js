const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const bodyParser = require('body-parser');

server.use(middlewares);
server.use(bodyParser.json());

// Helper to validate status transitions - NOW ALLOWS ALL TRANSITIONS
const isValidTransition = (oldStatus, newStatus) => {
    // All status transitions are now allowed for full flexibility
    const validStatuses = ['Pending', 'In Progress', 'Blocked', 'Completed'];
    return validStatuses.includes(oldStatus) && validStatuses.includes(newStatus);
};

// Fake Auth Middleware
server.use((req, res, next) => {
    if (req.path === '/login') return next();

    // Allow read-only access without rigid auth for demo simplicity, 
    // but enforcing writes usually requires a user.
    // user-id header is required for mutations
    if (req.method !== 'GET' && !req.headers['user-id']) {
        return res.status(401).json({ error: 'Unauthorized: Missing User-Id header' });
    }
    next();
});

// Login Endpoint
server.post('/login', (req, res) => {
    const { userId } = req.body;
    const db = router.db;
    const user = db.get('users').find({ id: userId }).value();
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Dashboard Endpoint
server.get('/dashboard', (req, res) => {
    const db = router.db;
    const tasks = db.get('tasks').value();
    const users = db.get('users').value();

    const stats = {
        totalTasks: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
        workload: users.map(u => ({
            name: u.name,
            count: tasks.filter(t => (t.assigneeIds || []).includes(u.id) && t.status !== 'Completed').length,
            avatar: u.avatar
        })).sort((a, b) => b.count - a.count).slice(0, 10)
    };
    res.json(stats);
});

// Task Update Middleware (Rules)
server.patch('/tasks/:id', (req, res, next) => {
    const db = router.db;
    // FIX: Loose equality for ID to handle string/number mismatch
    const task = db.get('tasks').find(t => t.id == req.params.id).value();
    const updates = req.body;
    const actorId = req.headers['user-id'];
    const actor = db.get('users').find({ id: actorId }).value();

    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Normalize legacy assigneeId to assigneeIds
    if (task.assigneeId && !task.assigneeIds) {
        task.assigneeIds = [task.assigneeId];
    }

    // 1. Status Transition Rule
    if (updates.status && updates.status !== task.status) {
        // ... (Status validity check remains same, assuming isValidTransition is globally avail or moved)
        if (!isValidTransition(task.status, updates.status)) {
            return res.status(400).json({ error: `Invalid transition from ${task.status} to ${updates.status}` });
        }

        // 2. Dependency Rule
        if (task.dependencyId && updates.status === 'In Progress') {
            const parent = db.get('tasks').find(t => t.id == task.dependencyId).value();
            if (parent && parent.status !== 'Completed') {
                return res.status(400).json({ error: 'Dependency not completed' });
            }
        }

        // 3. Assignment Rule (Assignees can change status, Admin can too)
        const isAssignee = (task.assigneeIds || []).includes(actorId);
        if (actor.role !== 'Admin' && !isAssignee) {
            return res.status(403).json({ error: 'Only assignees or admin can update status' });
        }

        // Log Status Change
        task.logs.push({
            action: 'Status Change',
            userId: actorId,
            timestamp: new Date().toISOString(),
            details: `Status changed to ${updates.status}`
        });

    }

    // 4. Reassignment Logs & Permissions
    if (updates.assigneeIds) {
        // Permission Check: Only Admin or Creator (Reporter) can reassign
        if (actor.role !== 'Admin' && task.createdBy !== actorId) {
            return res.status(403).json({ error: 'Only creator or admin can change assignees' });
        }

        const oldIds = task.assigneeIds || [];
        const newIds = updates.assigneeIds;

        // Log changes
        if (JSON.stringify(oldIds.sort()) !== JSON.stringify(newIds.sort())) {
            task.logs.push({
                action: 'Assignment',
                userId: actorId,
                timestamp: new Date().toISOString(),
                details: `Assignees updated`
            });

            // Notify new assignees
            newIds.filter(id => !oldIds.includes(id)).forEach(newId => {
                db.get('notifications').push({
                    id: Date.now().toString() + Math.random(),
                    userId: newId,
                    text: `You were assigned to task: ${task.title}`,
                    read: false,
                    timestamp: new Date().toISOString()
                }).write();
            });
        }
    }

    // Handle scalar assigneeId for backward compatibility if client sends it (though we should move to ids)
    if (updates.assigneeId) {
        delete updates.assigneeId; // Prevent saving legacy field if client sends it mixed
    }

    req.body.logs = task.logs; // Ensure logs are saved
    next();
});

// Bulk Operations
server.post('/bulk', (req, res) => {
    const { taskIds, action, payload } = req.body; // action: { type, payload }
    const db = router.db;
    const results = { successes: [], failures: [] };
    const actorId = req.headers['user-id'];
    const actor = db.get('users').find({ id: actorId }).value();

    taskIds.forEach(id => {
        const task = db.get('tasks').find({ id }).value();
        if (!task) {
            results.failures.push({ id, reason: 'Not found' });
            return;
        }

        let updated = false;

        if (action.type === 'status') {
            if (isValidTransition(task.status, payload)) {
                // Check dependency
                if (task.dependencyId && payload === 'In Progress') {
                    const parent = db.get('tasks').find({ id: task.dependencyId }).value();
                    if (parent && parent.status !== 'Completed') {
                        results.failures.push({ id, reason: 'Dependency not completed' });
                        return;
                    }
                }
                task.status = payload;
                task.logs.push({
                    action: 'Bulk Status',
                    userId: actorId,
                    timestamp: new Date().toISOString(),
                    details: `Bulk status change to ${payload}`
                });
                updated = true;
            } else {
                results.failures.push({ id, reason: 'Invalid transition' });
            }
        } else if (action.type === 'reassign') {
            // Check logging user perms
            // For bulk, simplifying to allow if admin or creator
            if (actor.role === 'Admin' || task.createdBy === actorId) {
                task.assigneeId = payload;
                task.logs.push({
                    action: 'Bulk Assign',
                    userId: actorId,
                    timestamp: new Date().toISOString(),
                    details: `Bulk assigned`
                });
                updated = true;
            } else {
                results.failures.push({ id, reason: 'Permission denied' });
            }
        }

        if (updated) {
            db.get('tasks').find({ id }).assign(task).write();
            results.successes.push(id);
        }
    });

    res.json(results);
});


// Comments (Custom endpoint to append comment)
server.post('/tasks/:id/comments', (req, res) => {
    const db = router.db;
    // FIX: Loose equality for ID
    const task = db.get('tasks').find(t => t.id == req.params.id).value();
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const { text, parentId } = req.body;
    const actorId = req.headers['user-id'];

    const newComment = {
        id: Date.now().toString(),
        userId: actorId,
        text,
        timestamp: new Date().toISOString()
    };

    // Add parentId if this is a reply
    if (parentId) {
        newComment.parentId = parentId;
    }

    task.comments.push(newComment);
    task.logs.push({
        action: parentId ? 'Reply' : 'Comment',
        userId: actorId,
        timestamp: new Date().toISOString(),
        details: parentId ? 'Reply added' : 'Comment added'
    });

    db.get('tasks').find({ id: task.id }).assign(task).write();
    res.json(newComment);
});

server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running on port 3000');
});
