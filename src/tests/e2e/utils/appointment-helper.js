import { DashboardPage } from '../pages/dashboard-page.js';
import { AppointmentBookingPage } from '../pages/appointment-booking-page.js';
import { getTomorrowDate } from '../fixtures/test-data.js';

export class AppointmentHelper {
  constructor(page) {
    this.page = page;
    this.dashboardPage = new DashboardPage(page);
    this.appointmentBookingPage = new AppointmentBookingPage(page);
  }

  async bookAppointment(appointmentData = {}) {
    const defaultData = {
      doctor: 'Dr. Sarah Smith',
      day: getTomorrowDate().getDate().toString(),
      time: '10:00',
      ...appointmentData
    };

    await this.dashboardPage.switchToScheduleTab();
    await this.appointmentBookingPage.bookAppointment(defaultData);
    await this.appointmentBookingPage.expectSuccess();
    
    return defaultData;
  }

  async cancelFirstAppointment() {
    await this.dashboardPage.appointmentsTab.click();
    await this.dashboardPage.cancelFirstAppointment();
    
    // Wait for success message
    await this.page.waitForSelector('text="Cita cancelada exitosamente"');
  }

  async getAppointmentCount() {
    await this.dashboardPage.appointmentsTab.click();
    return await this.dashboardPage.getAppointmentCount();
  }
}