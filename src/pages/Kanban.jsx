import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { StatusBadge } from '../components/tasks/StatusBadge';
import { useState } from 'react';

const COLUMNS = {
    'Pending': 'bg-slate-50/50',
    'In Progress': 'bg-blue-50/30',
    'Blocked': 'bg-red-50/30',
    'Completed': 'bg-green-50/30'
};

export default function Kanban() {
    const { tasks, updateTaskStatus } = useTasks();
    const [error, setError] = useState('');

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { draggableId, destination, source } = result;
        if (destination.droppableId === source.droppableId) return;

        try {
            setError('');
            await updateTaskStatus(draggableId, destination.droppableId);
        } catch (err) {
            setError(err.message);
            // Optional: Trigger a re-render or toast to revert visual state if react-beautiful-dnd hasn't already
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] overflow-x-auto">
            {error && (
                <div className="mb-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded-md text-sm fixed top-20 right-8 z-50 shadow-lg animate-in slide-in-from-top-2">
                    Error: {error}
                </div>
            )}
            <div className="flex gap-6 h-full min-w-[1000px]">
                <DragDropContext onDragEnd={onDragEnd}>
                    {Object.entries(COLUMNS).map(([columnId, bgClass]) => (
                        <div key={columnId} className={`flex-1 flex flex-col rounded-xl border border-slate-200 ${bgClass} p-4 min-w-[280px]`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700">{columnId}</h3>
                                <span className="bg-white text-slate-500 text-xs px-2 py-1 rounded-full border border-slate-200">
                                    {tasks.filter(t => t.status === columnId).length}
                                </span>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="flex-1 space-y-3 overflow-y-auto"
                                    >
                                        {tasks
                                            .filter(t => t.status === columnId)
                                            .map((task, index) => (
                                                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <TaskCard task={task} onClick={() => { }} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </DragDropContext>
            </div>
        </div>
    );
}
