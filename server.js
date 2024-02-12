const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5010;
const KoalaApi=process.env.KoalaApi;
app.use(cors());
app.use(bodyParser.json());

const validateApikey = (req,res,next) => {
  const apikey = req.headers.authorization;
  if(!apikey){
    return res.status(401).json({ error: 'Unauthorized - API key required' });
  }
  if(apikey!=="Bearer " + KoalaApi){
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  next();
}

app.use(validateApikey);

// Endpoint for generating articles
app.post('/generate-article', async (req, res) => {
  try {
    const { koalaPrompt, finalGptOption, finalArticleLength, finalNumberOfSections, finalrealTimeData, finalShouldCiteSources, finalMultimediaOption, finalImageStyle, finalMaxImages, finalImageSize, finalMaxVideos,pointOfView, toneOfVoiceProfile } = req.body;
    const requiredFields = [
      'koalaPrompt',
      'finalGptOption',
      'finalArticleLength',
      'finalNumberOfSections',
      'finalrealTimeData',
      'finalShouldCiteSources',
      'finalMultimediaOption',
      'pointOfView',
      'toneOfVoiceProfile'
    ];
    const missingFields = requiredFields.filter(field => !(field in req.body));

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    if (finalMultimediaOption === 'none') {
      if ('finalImageStyle' in req.body || 'finalImageSize' in req.body || 'finalMaxImages' in req.body || 'finalMaxVideos' in req.body) {
        return res.status(400).json({ error: "finalImageStyle, finalImageSize, finalMaxImages, and finalMaxVideos are not required when finalMultimediaOption is 'none'" });
      }
    }

    if (finalMultimediaOption === 'images') {
      const missingFields = [];
      if (!('finalImageStyle' in req.body)) missingFields.push('finalImageStyle');
      if (!('finalImageSize' in req.body)) missingFields.push('finalImageSize');
      if (!('finalMaxImages' in req.body)) missingFields.push('finalMaxImages');
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} missing when finalMultimediaOption is 'images'` });
      }
      if ('finalMaxVideos' in req.body) {
        return res.status(400).json({ error: "finalMaxVideos is not required when finalMultimediaOption is 'images'" });
      }
    }

    if (finalMultimediaOption === 'auto') {
      const missingFields = [];
      if (!('finalImageStyle' in req.body)) missingFields.push('finalImageStyle');
      if (!('finalImageSize' in req.body)) missingFields.push('finalImageSize');
      if (!('finalMaxImages' in req.body)) missingFields.push('finalMaxImages');
      if (!('finalMaxVideos' in req.body)) missingFields.push('finalMaxVideos');
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} missing when finalMultimediaOption is 'auto'` });
      }
    }

    if (finalMultimediaOption === 'auto' && (
      !('finalImageStyle' in req.body) ||
      !('finalMaxImages' in req.body) ||
      !('finalImageSize' in req.body) ||
      !('finalMaxVideos' in req.body)
    )) {
      return res.status(400).json({ error: "finalImageStyle, finalMaxImages, finalImageSize, finalMaxVideos are required when finalMultimediaOption is 'auto'" });
    }
    if (finalArticleLength !== "custom number of sections" && finalNumberOfSections) {
      return res.status(400).json({ error: 'finalNumberOfSections should not be provided unless finalArticleLength is "custom number of sections"' });
    }
    if (finalArticleLength === "custom number of sections") {
      if (!Number.isInteger(finalNumberOfSections)) {
        return res.status(400).json({ error: 'finalNumberOfSections must be an integer' });
      }
    }
    const response = await axios.post(
      'https://koala.sh/api/articles/',
      {
        targetKeyword: koalaPrompt,
        gptVersion: finalGptOption,
        integrationId: process.env.INTEGRATION_ID,
        articleLength: finalArticleLength,
        numberOfSections: finalNumberOfSections,
        realTimeData: finalrealTimeData,
        shouldCiteSources: finalShouldCiteSources,
        multimediaOption: finalMultimediaOption,
        imageStyle: finalImageStyle,
        maxImages: finalMaxImages,
        imageSize: finalImageSize,
        maxVideos: finalMaxVideos,
        pointOfView: pointOfView,
        toneOfVoiceProfile: toneOfVoiceProfile
      },
      {
        headers: {
          Authorization: `Bearer ${KoalaApi}`,
          'Content-Type': 'application/json',
        },
      }

    );

    res.json(response.data);
    // console.log(response.data);
  } catch (error) {
    console.error('Error generating article:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint for fetching article details
// app.get('/article-details/:articleId', async (req, res) => {
//   try {
//     const { articleId } = req.params;
//     const response = await axios.get(`https://koala.sh/api/articles/${articleId}`, {
//       headers: {
//         Authorization: `Bearer 2881a586-fe63-46bb-a078-d6e6d2477128`,
//         'Content-Type': 'application/json',
//       },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching article details:', error.message);
//     res.status(error.response?.status || 500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = app;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
