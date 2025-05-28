"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CalendarIcon,
  User,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Send,
  Search,
  MoreVertical,
  Paperclip,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [selectedChat, setSelectedChat] = useState("1")

  // Mock contacts data
  const contacts = [
    {
      id: "1",
      name: "Dra. María González",
      role: "Cardióloga",
      lastMessage: "¿Cómo se ha sentido con la medicación?",
      time: "10:30",
      unread: 2,
    },
    {
      id: "2",
      name: "Dr. Carlos Rodríguez",
      role: "Dermatólogo",
      lastMessage: "Recuerde aplicar la crema dos veces al día",
      time: "Ayer",
      unread: 0,
    },
    {
      id: "3",
      name: "Recepción Clínica",
      role: "Atención al paciente",
      lastMessage: "Su turno ha sido confirmado",
      time: "Lun",
      unread: 0,
    },
  ]

  // Mock messages data
  const messages = [
    {
      id: "1",
      sender: "doctor",
      text: "Hola Juan, ¿cómo se ha sentido con la medicación que le receté?",
      time: "10:30",
    },
    {
      id: "2",
      sender: "user",
      text: "Hola doctora, me he sentido mejor. La presión arterial ha bajado un poco.",
      time: "10:32",
    },
    {
      id: "3",
      sender: "doctor",
      text: "Excelente noticia. ¿Ha tenido algún efecto secundario?",
      time: "10:33",
    },
    {
      id: "4",
      sender: "user",
      text: "Solo un poco de mareo por las mañanas, pero nada grave.",
      time: "10:35",
    },
    {
      id: "5",
      sender: "doctor",
      text: "Es normal en los primeros días. Si persiste por más de una semana, avíseme y ajustaremos la dosis.",
      time: "10:36",
    },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would normally send the message to the backend
      setMessage("")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-white border-r">
        <div className="flex items-center h-16 px-4 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-teal-600"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="text-xl font-bold text-teal-600">Cronos Health</span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center p-4 border-b">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Juan Pérez</p>
              <p className="text-sm text-gray-500">Paciente</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <CalendarIcon className="mr-3 h-5 w-5" />
              Mis Turnos
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <User className="mr-3 h-5 w-5" />
              Mi Perfil
            </Link>
            <Link
              href="/dashboard/history"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <FileText className="mr-3 h-5 w-5" />
              Historial Médico
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center p-2 rounded-md bg-gray-100 text-teal-600 font-medium"
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Chat
            </Link>
            <Link
              href="/dashboard/notifications"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Bell className="mr-3 h-5 w-5" />
              Notificaciones
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Settings className="mr-3 h-5 w-5" />
              Configuración
            </Link>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600"
              onClick={() => router.push("/login")}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <div className="flex h-screen flex-col">
          <header className="sticky top-0 z-10 bg-white border-b h-16 flex items-center px-4 md:px-6">
            <h1 className="text-xl font-semibold">Chat</h1>
          </header>
          <div className="flex flex-1 overflow-hidden">
            {/* Contacts list */}
            <div className="w-full md:w-80 border-r bg-white overflow-y-auto">
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input placeholder="Buscar conversación" className="pl-8" />
                </div>
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 rounded-lg cursor-pointer ${selectedChat === contact.id ? "bg-teal-50 border-teal-200 border" : "hover:bg-gray-50 border"}`}
                      onClick={() => setSelectedChat(contact.id)}
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarFallback>
                              {contact.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {contact.unread > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                              {contact.unread}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-medium truncate">{contact.name}</h3>
                            <span className="text-xs text-gray-500">{contact.time}</span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">{contact.role}</p>
                          <p className="text-xs truncate">{contact.lastMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {/* Chat header */}
              <div className="bg-white border-b p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Dra. María González</h3>
                    <p className="text-xs text-gray-500">Cardióloga</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === "user" ? "bg-teal-600 text-white" : "bg-white border"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          msg.sender === "user" ? "text-teal-100" : "text-gray-500"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input */}
              <div className="bg-white border-t p-3">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
