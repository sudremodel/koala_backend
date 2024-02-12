const request = require('supertest');
const express = require('express');
const app = require('../server'); // assuming your Express app is in a file named app.js

describe('POST /generate-article', () => {
  it('should respond with status 200 and article data if all required fields are provided', async () => {
    const requestBody = {
        "koalaPrompt": "Optimizing Service Schedules: The AI Revolution in Appointment Management",
        "finalGptOption": "gpt-3.5",
        "finalArticleLength": "shorter",
        "finalNumberOfSections": 1,
        "finalrealTimeData": false,
        "finalShouldCiteSources": true,
        "finalMultimediaOption": "auto",
        "finalImageStyle": "illustration",
        "finalMaxImages": 2,
        "finalImageSize": "1024x1024",
        "finalMaxVideos": 2,
        "pointOfView": "third_person",
        "toneOfVoiceProfile": "Friendly"
      };

    const response = await request(app)
      .post('/generate-article')
      .send(requestBody);

    expect(response.status).toBe(200);
  });

  it('should respond with status 400 if any required field is missing', async () => {
    const requestBody = {
      // Missing required fields intentionally
    };

    const response = await request(app)
      .post('/generate-article')
      .send(requestBody);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
