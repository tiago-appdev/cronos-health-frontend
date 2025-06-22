"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Search,
  MoreVertical,
  Paperclip,
  Plus,
  MessageSquare,
} from "lucide-react";
import { messagesApi } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast-context";
import { Sidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Conversation {
  id: string;
  name: string;
  type: string;
  otherUserType: string;
  lastMessage: string;
  lastMessageTime: string;
  lastSenderName: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  text: string;
  type: string;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  role: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        type: "error",
      });
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messagesApi.getConversationMessages(conversationId);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        type: "error",
      });
    }
  };

  // Load related users
  const loadRelatedUsers = async () => {
    try {
      const data = await messagesApi.getRelatedUsers();
      setAvailableUsers(data);
    } catch (error) {
      console.error("Error loading related users:", error);
    }
  };

  // Search users
  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setAvailableUsers([]);
      return;
    }

    try {
      const data = await messagesApi.searchUsers(term);
      setAvailableUsers(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const messageData = {
        conversationId: selectedConversation,
        text: newMessage.trim(),
        messageType: "text",
      };

      const response = await messagesApi.sendMessage(messageData);
      
      // Add message to local state
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
      
      // Update conversations list
      loadConversations();
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        type: "error",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Start conversation with user
  const startConversation = async (userId: string) => {
    try {
      const response = await messagesApi.createOrGetConversation(userId);
      
      // Reload conversations to include the new one
      await loadConversations();
      
      // Select the new conversation
      setSelectedConversation(response.conversation.id.toString());
      setShowUserSearch(false);
      setUserSearchTerm("");
      
      toast({
        title: "Éxito",
        description: "Conversación iniciada",
        type: "success",
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación",
        type: "error",
      });
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
  };

  // Polling for new messages
  const startPolling = () => {
    pollIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
      loadConversations();
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      await loadRelatedUsers();
      setLoading(false);
    };

    if (user) {
      init();
    }
  }, [user]);

  // Start/stop polling
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [selectedConversation]);

  // Handle user search
  useEffect(() => {
    if (userSearchTerm) {
      searchUsers(userSearchTerm);
    } else {
      loadRelatedUsers();
    }
  }, [userSearchTerm]);

  const selectedConversationData = conversations.find(
    (c) => c.id === selectedConversation
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Use shared sidebar */}
      <Sidebar currentPage="chat" />

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <div className="flex h-screen flex-col">
          <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
            <h1 className="text-xl font-semibold">Chat</h1>
          </header>
          <div className="flex flex-1 overflow-hidden">
            {/* Conversations list */}
            <div className="w-full md:w-80 border-r bg-white overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium">Conversaciones</h2>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUserSearch(!showUserSearch)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {showUserSearch && (
                  <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                    <div className="relative mb-2">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar usuario..."
                        className="pl-8"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => startConversation(user.id)}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar conversación"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Cargando conversaciones...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-lg cursor-pointer ${
                          selectedConversation === conversation.id
                            ? "bg-teal-50 border-teal-200 border"
                            : "hover:bg-gray-50 border"
                        }`}
                        onClick={() => handleConversationSelect(conversation.id)}
                      >
                        <div className="flex items-center">
                          <div className="relative">
                            <Avatar className="h-12 w-12 mr-3">
                              <AvatarFallback>
                                {getInitials(conversation.name)}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium truncate">{conversation.name}</h3>
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessageTime
                                  ? new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.otherUserType === "doctor" ? "Médico" : "Paciente"}
                            </p>
                            <p className="text-xs truncate">
                              {conversation.lastSenderName}: {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay conversaciones</p>
                      <p className="text-xs">Usa el botón + para iniciar una</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedConversation && selectedConversationData ? (
                <>
                  {/* Chat header */}
                  <div className="bg-white border-b p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {getInitials(selectedConversationData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{selectedConversationData.name}</h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversationData.otherUserType === "doctor" ? "Médico" : "Paciente"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isMyMessage = message.senderId.toString() === user?.id.toString();
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isMyMessage
                                ? "bg-green-500 text-white"
                                : "bg-white border shadow-sm"
                            }`}
                          >
                            {message.replyTo && (
                              <div className="text-xs opacity-75 mb-1 p-2 rounded bg-black bg-opacity-10">
                                <p className="font-medium">{message.replyTo.senderName}:</p>
                                <p>{message.replyTo.text}</p>
                              </div>
                            )}
                            <p>{message.text}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p
                                className={`text-xs ${
                                  isMyMessage ? "text-green-100" : "text-gray-500"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {message.isEdited && (
                                <span
                                  className={`text-xs ${
                                    isMyMessage ? "text-green-200" : "text-gray-400"
                                  }`}
                                >
                                  editado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message input */}
                  <div className="bg-white border-t p-3">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-5 w-5" />
                      </Button>
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                        disabled={sendingMessage}
                      />
                      <Button 
                        size="icon" 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim() || sendingMessage}
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-1">Selecciona una conversación</h3>
                    <p className="text-gray-500">Elige una conversación para empezar a chatear</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}