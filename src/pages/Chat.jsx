import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { taskApi } from '../api';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Send, Hash, UserCircle, MessageSquare } from 'lucide-react';

export default function Chat() {
    const { currentUser, users } = useUser();
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        if (!currentUser) return;
        loadConversations();
    }, [currentUser]);

    // Load Conversations list from API
    const loadConversations = async () => {
        try {
            const convos = await taskApi.getConversations();
            setConversations(convos);
        } catch (err) {
            console.error(err);
        }
    };

    // Load Messages when a conversation is selected
    useEffect(() => {
        if (!activeConvo) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            try {
                const msgs = await taskApi.getMessages(activeConvo.id);
                setMessages(msgs);
                scrollToBottom();
            } catch (err) {
                console.error(err);
            }
        };

        loadMessages();

        // Subscribe to real-time new messages in THIS conversation
        const subscription = supabase
            .channel(`messages:conversation_id=eq.${activeConvo.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${activeConvo.id}`
                },
                async (payload) => {
                    // When a new message arrives, we fetch the sender profile data
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar')
                        .eq('id', payload.new.sender_id)
                        .single();

                    const enhancedMsg = { ...payload.new, profiles: profile };

                    setMessages(prev => [...prev, enhancedMsg]);
                    scrollToBottom();
                    loadConversations(); // Update timestamps on left panel
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [activeConvo]);

    // Setup a new chat with someone
    const startConvoWith = async (userId) => {
        try {
            const convoId = await taskApi.getOrCreateDirectConversation(userId);
            // Refresh conversation list so it appears
            await loadConversations();

            // Set it as active
            setActiveConvo({ id: convoId });
        } catch (err) {
            console.error("Failed to start chat", err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvo) return;

        try {
            const text = newMessage;
            setNewMessage(''); // clear input early for UX
            await taskApi.sendMessage(activeConvo.id, text);
            // The real-time subscription will automatically pull it in!
        } catch (err) {
            console.error(err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">

            {/* LEFT PANE: Conversations list & Users */}
            <Card className="w-80 flex flex-col h-full shrink-0">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Chat</CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-6">

                    {/* Active Conversations */}
                    <div>
                        <h3 className="px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent chats</h3>
                        <div className="space-y-1">
                            {conversations.length === 0 && (
                                <p className="text-sm text-slate-500 px-4 italic">No recent chats</p>
                            )}
                            {conversations.map(convo => {
                                const participant = convo.participants[0] || { full_name: 'Unknown User' };
                                const isActive = activeConvo?.id === convo.id;
                                return (
                                    <button
                                        key={convo.id}
                                        onClick={() => setActiveConvo(convo)}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500' : 'hover:bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                            {participant?.avatar ? (
                                                <img src={participant.avatar} alt={participant.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle className="w-full h-full text-slate-400" />
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-medium truncate">{participant.full_name}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Team Directory to start new chats */}
                    <div>
                        <h3 className="px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Team Directory</h3>
                        <div className="space-y-1">
                            {users.filter(u => u.id !== currentUser?.id).map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => startConvoWith(u.id)}
                                    className="w-full text-left px-4 py-2 flex items-center gap-3 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                        {u.avatar && <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <p className="text-sm truncate">{u.name}</p>
                                    <MessageSquare className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-blue-500" />
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </Card>

            {/* RIGHT PANE: Messages */}
            <Card className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
                {activeConvo ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                            {/* Derive name from conversations array */}
                            {(() => {
                                const c = conversations.find(c => c.id === activeConvo.id);
                                const other = c?.participants[0];
                                return (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                                            {other?.avatar ? <img src={other.avatar} alt="avatar" /> : <UserCircle className="w-6 h-6 text-slate-400" />}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-slate-800">{other?.full_name || 'Chat'}</h2>
                                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                                Team Member
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, i) => {
                                const isMe = msg.sender_id === currentUser.id;
                                const showAvatar = i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id;

                                return (
                                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className="w-8 h-8 shrink-0 flex items-end">
                                            {showAvatar && !isMe && msg.profiles?.avatar && (
                                                <img src={msg.profiles.avatar} alt="" className="w-8 h-8 rounded-full" />
                                            )}
                                        </div>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                            <div className={`px-4 py-2 rounded-2xl ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 mt-1 px-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Type a new message..."
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={!newMessage.trim()}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Hash className="w-16 h-16 mb-4 opacity-20" />
                        <h2 className="text-xl font-medium text-slate-500">Your Conversations</h2>
                        <p className="text-sm mt-2">Select a team member to start chatting.</p>
                    </div>
                )}
            </Card>

        </div>
    );
}
