import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class SurveyPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoSurvey() {
    await this.goto('/survey');
    await this.waitForElement('text=Encuesta de Satisfacción');
  }

  async fillSurvey(surveyData) {
    // Step 1: First set of ratings
    await this.setRating('appointment-ease', surveyData.appointmentEaseRating);
    await this.setRating('punctuality', surveyData.punctualityRating);
    await this.setRating('medical-staff', surveyData.medicalStaffRating);
    
    await this.clickAndWait(SELECTORS.survey.nextButton);

    // Step 2: Platform rating and recommendation
    await this.setRating('platform', surveyData.platformRating);
    
    // Set recommendation
    if (surveyData.wouldRecommend === 'yes') {
      await this.page.click(SELECTORS.survey.recommendYes);
    } else if (surveyData.wouldRecommend === 'no') {
      await this.page.click(SELECTORS.survey.recommendNo);
    } else {
      await this.page.click(SELECTORS.survey.recommendMaybe);
    }

    // Add comments if provided
    if (surveyData.additionalComments) {
      await this.page.fill(SELECTORS.survey.commentsTextarea, surveyData.additionalComments);
    }

    // Submit survey
    await this.clickAndWait(SELECTORS.survey.submitButton);
  }

  async setRating(ratingType, value) {
    // Find the rating group and select the value
    const ratingSelector = `input[name*="${ratingType}"][value="${value}"]`;
    await this.page.click(ratingSelector);
  }

  async expectSurveySubmitted() {
    await this.waitForElement('text=¡Gracias por su opinión!');
  }

  async goToMySurveys() {
    await this.page.click('text=Mis Encuestas');
    await this.waitForElement('text=Historial de encuestas');
  }

  async expectSurveyInHistory() {
    await this.waitForElement('[data-testid="survey-card"]');
  }
}