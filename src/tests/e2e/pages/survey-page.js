import { BasePage } from './base-page.js';
import { SELECTORS } from '../test-data.js';

export class SurveyPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async gotoSurvey() {
    await this.goto('/survey');
    await this.waitForElement('text=Encuesta de Satisfacción');
  }  async fillSurvey(surveyData) {
    // Wait for form to be ready
    await this.waitForElement('text=Encuesta de Satisfacción');
    
    // Step 1: First set of ratings - select ratings in order they appear
    const ratingGroups = await this.page.locator('[role="radiogroup"]').all();
    
    // First rating (appointment ease) - target the button, not the hidden input
    if (ratingGroups.length > 0) {
      await ratingGroups[0].locator(`button[value="${surveyData.appointmentEaseRating}"]`).click();
    }
    
    // Second rating (punctuality)
    if (ratingGroups.length > 1) {
      await ratingGroups[1].locator(`button[value="${surveyData.punctualityRating}"]`).click();
    }
    
    // Third rating (medical staff)
    if (ratingGroups.length > 2) {
      await ratingGroups[2].locator(`button[value="${surveyData.medicalStaffRating}"]`).click();
    }
    
    await this.page.waitForTimeout(500); // Wait before clicking next
    await this.clickAndWait(SELECTORS.survey.nextButton);

    // Step 2: Platform rating and recommendation
    // Wait for step 2 to load
    await this.page.waitForTimeout(500);
    
    // Platform rating (should be the first radio group on step 2)
    const step2RatingGroups = await this.page.locator('[role="radiogroup"]').all();
    if (step2RatingGroups.length > 0) {
      await step2RatingGroups[0].locator(`button[value="${surveyData.platformRating}"]`).click();
    }
    
    // Set recommendation
    if (surveyData.wouldRecommend === 'yes') {
      await this.page.click('[data-testid="recommend-yes"]');
    } else if (surveyData.wouldRecommend === 'no') {
      await this.page.click('[data-testid="recommend-no"]');
    } else {
      await this.page.click('[data-testid="recommend-maybe"]');
    }

    // Add comments if provided
    if (surveyData.additionalComments) {
      await this.page.fill(SELECTORS.survey.commentsTextarea, surveyData.additionalComments);
    }

    // Submit survey
    await this.page.waitForTimeout(500); // Wait before submitting
    await this.clickAndWait(SELECTORS.survey.submitButton);
  }

  async setRating(ratingType, value) {
    // Convert rating type to match test ID format
    const ratingId = ratingType.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const ratingSelector = `[data-testid*="${ratingId}-rating-${value}"]`;
    await this.page.waitForSelector(ratingSelector, { timeout: 5000 });
    await this.page.click(ratingSelector);
  }

  async expectSurveySubmitted() {
    await this.waitForElement('[data-testid="toast-success"]');
  }

  async goToMySurveys() {    await this.page.locator('button').filter({ hasText: 'Mis Encuestas' }).click();
    await this.page.waitForTimeout(1000); // Wait for navigation
  }

  async expectSurveyInHistory() {
    await this.waitForElement('[data-testid="survey-card"]');
  }
}