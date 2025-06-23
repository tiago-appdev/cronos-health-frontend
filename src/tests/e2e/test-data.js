export const TEST_USERS = {
  admin: {
    email: "admin@cronoshealth.com",
    password: "password123",
    name: "Administrador",
    type: "admin"
  },
  doctor: {
    email: ".luis.garcia@email.com",
    password: "password123", 
    name: "Dr. Luis García",
    type: "doctor"
  },
  patient: {
    email: "juan.perez@email.com",
    password: "password123",
    name: "Juan Pérez", 
    type: "patient"
  },
  // Additional test users
  doctor2: {
    email: "dra.maria.rodriguez@email.com",
    password: "password123",
    name: "Dra. María Rodríguez",
    type: "doctor"
  },
  patient2: {
    email: "maria.gonzalez@email.com", 
    password: "password123",
    name: "María González",
    type: "patient"
  }
};

// Generate unique test data for each test run to avoid conflicts
function generateUniqueTestData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const uniqueId = `${timestamp}_${random}`;
  
  return {
    newUser: {
      patient: {
        name: "Test Patient User",
        email: `test.patient.${uniqueId}@test.com`,
        password: "testpass123",
        userType: "patient"
      },
      doctor: {
        name: "Test Doctor User", 
        email: `test.doctor.${uniqueId}@test.com`,
        password: "testpass123",
        userType: "doctor"
      }
    },
    survey: {
      appointmentEaseRating: 5,
      punctualityRating: 4,
      medicalStaffRating: 5,
      platformRating: 4,
      wouldRecommend: "yes",
      additionalComments: "Excellent service, very professional!"
    },
    appointment: {
      time: "10:00"
    }
  };
}

// Export a new instance of test data for each import
export const TEST_DATA = generateUniqueTestData();

export const SELECTORS = {
  // Navigation
  nav: {
    logo: '[data-testid="logo"]',
    dashboardLink: 'a[href="/dashboard"]',
    loginButton: 'text=Iniciar Sesión',
    registerButton: 'text=Registrarse',
    logoutButton: 'text=Cerrar Sesión'
  },
  
  // Forms
  form: {
    email: 'input[type="email"]',
    password: 'input[type="password"]',
    name: 'input[id="name"]',
    confirmPassword: 'input[id="confirmPassword"]',
    submitButton: 'button[type="submit"]'
  },
  
  // Dashboard
  dashboard: {
    welcomeMessage: 'text=Bienvenido',
    appointmentsTab: 'text=Mis Turnos',
    scheduleTab: 'text=Agendar Turno',
    medicalHistoryTab: 'text=Historial Médico'
  },
  
  // Appointments
  appointment: {
    doctorSelect: '[data-testid="doctor-select"]',
    dateButton: 'button:has-text("Selecciona una fecha")',
    timeSelect: '[data-testid="time-select"]',
    scheduleButton: 'text=Agendar Cita',
    cancelButton: 'text=Cancelar',
    completeButton: 'text=Marcar Completada'
  },
  // Survey
  survey: {
    ratingRadio: (rating) => `[data-testid="rating-${rating}"]`,
    recommendYes: '[data-testid="recommend-yes"]',
    recommendNo: '[data-testid="recommend-no"]',
    recommendMaybe: '[data-testid="recommend-maybe"]',
    commentsTextarea: 'textarea',
    submitButton: 'text=Enviar',
    nextButton: 'text=Siguiente'
  },
  // Admin
  admin: {
    usersTab: '[role="tab"]:has-text("Gestión de Usuarios")',
    surveysTab: '[role="tab"]:has-text("Encuestas")',
    newUserButton: 'text=Nuevo Usuario',
    userTypeSelect: '[data-testid="user-type-select"]'
  }
};