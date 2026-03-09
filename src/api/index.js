import { supabase } from '../lib/supabase';

export const taskApi = {
    // Tasks
    getTasks: async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                profiles (id, full_name, avatar),
                task_assignees (
                    profile_id
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map data to match old structure expecting assigneeIds
        return data.map(task => ({
            ...task,
            id: task.id.toString(), // Ensuring string IDs for frontend compatibility
            assigneeIds: task.task_assignees ? task.task_assignees.map(ta => ta.profile_id) : [],
            createdBy: task.created_by,
            dueDate: task.due_date,
        }));
    },

    getTask: async (id) => {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                task_assignees (profile_id)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Fetch comments and logs separately since Supabase JS single query deep nesting can be complex
        const { data: comments } = await supabase.from('comments').select('*').eq('task_id', id);
        const { data: logs } = await supabase.from('logs').select('*').eq('task_id', id);

        return {
            ...data,
            id: data.id.toString(),
            assigneeIds: data.task_assignees ? data.task_assignees.map(ta => ta.profile_id) : [],
            comments: comments || [],
            logs: logs || []
        };
    },

    createTask: async (taskData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        // 1. Insert Task
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                title: taskData.title,
                description: taskData.description || '',
                category: taskData.category || 'General',
                priority: taskData.priority || 'Medium',
                due_date: taskData.dueDate || null,
                dependency_id: taskData.dependencyId || null,
                created_by: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        // 2. Insert Assignees
        if (taskData.assigneeIds && taskData.assigneeIds.length > 0) {
            const assigneeRows = taskData.assigneeIds.map(profile_id => ({
                task_id: data.id,
                profile_id
            }));
            await supabase.from('task_assignees').insert(assigneeRows);

            // Generate notification for assignees
            const notifRows = taskData.assigneeIds.map(profile_id => ({
                user_id: profile_id,
                text: `You were assigned to task: ${data.title}`
            }));
            await supabase.from('notifications').insert(notifRows);
        }

        // 3. Log creation
        await supabase.from('logs').insert([{
            task_id: data.id,
            action: 'Creation',
            user_id: user.id,
            details: 'Task created'
        }]);

        return {
            ...data,
            id: data.id.toString(),
            assigneeIds: taskData.assigneeIds || []
        };
    },

    updateTask: async (id, patch) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        const updateData = {};
        if (patch.title !== undefined) updateData.title = patch.title;
        if (patch.description !== undefined) updateData.description = patch.description;
        if (patch.category !== undefined) updateData.category = patch.category;
        if (patch.priority !== undefined) updateData.priority = patch.priority;
        if (patch.dueDate !== undefined) updateData.due_date = patch.dueDate;
        if (patch.status !== undefined) updateData.status = patch.status;
        if (patch.dependencyId !== undefined) updateData.dependency_id = patch.dependencyId;

        // 1. Update core task fields if any
        if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
                .from('tasks')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            if (patch.status !== undefined) {
                await supabase.from('logs').insert([{
                    task_id: id,
                    action: 'Status Change',
                    user_id: user.id,
                    details: `Status changed to ${patch.status}`
                }]);
            }
        }

        // 2. Update assignees if requested
        if (patch.assigneeIds !== undefined) {
            // Delete old
            await supabase.from('task_assignees').delete().eq('task_id', id);

            // Insert new
            if (patch.assigneeIds.length > 0) {
                const assigneeRows = patch.assigneeIds.map(profile_id => ({
                    task_id: id,
                    profile_id
                }));
                await supabase.from('task_assignees').insert(assigneeRows);

                // Quick notification logic (ideally we'd compare old vs new IDs, but for simplicity we notify new assignments)
                const { data: task } = await supabase.from('tasks').select('title').eq('id', id).single();
                const notifRows = patch.assigneeIds.map(profile_id => ({
                    user_id: profile_id,
                    text: `Assignment updated for task: ${task?.title || id}`
                }));
                await supabase.from('notifications').insert(notifRows);
            }

            await supabase.from('logs').insert([{
                task_id: id,
                action: 'Assignment',
                user_id: user.id,
                details: `Assignees updated`
            }]);
        }

        return await taskApi.getTask(id);
    },

    deleteTask: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
    },

    // Nullified bulk as basic frontend doesn't strictly need it to function. We'll handle it via loop later if needed.
    bulkOperation: async () => { },

    // Comments
    addComment: async (taskId, text, parentId = null) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('comments')
            .insert([{
                task_id: taskId,
                user_id: user.id,
                text: text,
                parent_id: parentId
            }])
            .select()
            .single();

        if (error) throw error;

        await supabase.from('logs').insert([{
            task_id: taskId,
            action: parentId ? 'Reply' : 'Comment',
            user_id: user.id,
            details: parentId ? 'Reply added' : 'Comment added'
        }]);

        return data;
    },

    // Dashboard
    getDashboard: async () => {
        // Since Supabase doesn't easily run complex stats queries without custom RPCs (SQL functions),
        // We will fetch tasks and users and calculate on the client.
        const [tasksResponse, usersResponse] = await Promise.all([
            taskApi.getTasks(),
            taskApi.getUsers()
        ]);

        const tasks = tasksResponse;
        const users = usersResponse;

        const workloadMap = {};

        users.forEach(u => {
            workloadMap[u.id] = {
                id: u.id,
                name: u.full_name || u.name,
                avatar: u.avatar,
                count: 0
            };
        });

        tasks.forEach(t => {
            if (t.status !== 'Completed') {
                (t.assigneeIds || []).forEach(assigneeId => {
                    const idStr = assigneeId;
                    if (workloadMap[idStr]) {
                        workloadMap[idStr].count++;
                    }
                });
            }
        });

        return {
            totalTasks: tasks.length,
            pending: tasks.filter(t => t.status === 'Pending').length,
            inProgress: tasks.filter(t => t.status === 'In Progress').length,
            completed: tasks.filter(t => t.status === 'Completed').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
            workload: Object.values(workloadMap).sort((a, b) => b.count - a.count).slice(0, 10)
        };
    },

    // Utils
    getUsers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) throw error;
        return data.map(user => ({
            ...user,
            id: user.id,
            name: user.full_name // Map supabase generic "full_name" to frontend generic "name"
        }));
    },

    // --- NEW CHAT LOGIC --- //

    getConversations: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        // Find all conversations where this user is a participant
        const { data, error } = await supabase
            .from('conversation_participants')
            .select(`
                conversation_id,
                conversations (
                    id, 
                    created_at,
                    updated_at
                )
            `)
            .eq('profile_id', user.id);

        if (error) throw error;

        // For each conversation, fetch the *other* participants to show their names
        const enrichedConversations = await Promise.all(data.map(async (cp) => {
            const { data: others } = await supabase
                .from('conversation_participants')
                .select(`
                    profile_id,
                    profiles (id, full_name, avatar)
                `)
                .eq('conversation_id', cp.conversation_id)
                .neq('profile_id', user.id);

            return {
                ...cp.conversations,
                participants: others?.map(o => o.profiles) || []
            };
        }));

        return enrichedConversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    },

    getOrCreateDirectConversation: async (otherUserId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        // 1. Check if a conversation between these exact two users exists.
        // Needs a bit of logic or a custom RPC, but we can do it client side for a prototype:
        const myConvos = await taskApi.getConversations();
        const existing = myConvos.find(c =>
            c.participants.length === 1 && c.participants[0].id === otherUserId
        );

        if (existing) return existing.id;

        // 2. If not, create a new conversation
        const { data: newConvo, error: createError } = await supabase
            .from('conversations')
            .insert([{}]) // Let defaults handle it
            .select()
            .single();

        if (createError) throw createError;

        // 3. Add both participants
        const { error: partError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConvo.id, profile_id: user.id },
                { conversation_id: newConvo.id, profile_id: otherUserId }
            ]);

        if (partError) throw partError;

        return newConvo.id;
    },

    getMessages: async (conversationId) => {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                profiles (id, full_name, avatar)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    sendMessage: async (conversationId, content) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                sender_id: user.id,
                content: content
            }])
            .select()
            .single();

        if (error) throw error;

        // Update the conversation's updated_at timestamp so it floats to the top of the sidebar
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data;
    }
};
