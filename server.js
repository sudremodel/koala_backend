const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(bodyParser.json());


app.post('/proxy-koala-api', async (req, res) => {
  try {
    const koalaApiUrl = 'https://koala.sh/api/articles/';
    const response = await axios.post(
      koalaApiUrl,
      req.body,
      {
        headers: {
          Authorization: 'Bearer 2881a586-fe63-46bb-a078-d6e6d2477128',
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data)

    console.log(response.data);
  } catch (error) {
    console.error('Error proxying Koala.ai request:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Internal Server Error' });
  }
});
app.get('/get-koala-article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    await new Promise(resolve => setTimeout(resolve, 5000));
    const response = await axios.get(`https://koala.sh/api/articles/${articleId}`, {
      headers: {
        Authorization: `Bearer 2881a586-fe63-46bb-a078-d6e6d2477128`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Koala.ai article details:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
