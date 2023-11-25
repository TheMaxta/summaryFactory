const readline = require('readline');
const YouTubeService = require('./youtube.service.js');
const OpenAiApi = require('./openAiApi'); // Import OpenAiApi class
const BartApi = require('./bartApi'); // Import BartApi class
require('dotenv').config();

const openaiApiKey = process.env.OPENAI_API_KEY;
const huggingApiKey = process.env.HUGGINGFACE_API_TOKEN

import('node-fetch').then(module => {
    const fetch = module.default;
    const youtubeService = new YouTubeService(fetch);

    // Factory for API endpoints
    function getApiEndpoint(apiName) {
        switch (apiName) {
            case 'openai':
                return new OpenAiApi(openaiApiKey);
            case 'huggingface-bart':
                return new BartApi(huggingApiKey);
            // Add other cases for additional APIs
            default:
                throw new Error('Unknown API endpoint');
        }
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    async function handleUserInput() {
        try {
            const videoId = await askQuestion('Enter YouTube video ID: ');
            const captionType = await askQuestion('Enter caption type (SRT/TXT): ');

            console.log('Available models: openai, huggingface-bart');
            const apiName = await askQuestion('Enter API endpoint name: ');
            const prompt = await askQuestion('Enter prompt for the summary: ');

            const captions = await youtubeService.fetchCaptions(videoId, captionType);
            console.log(captions);
            
            const apiEndpoint = getApiEndpoint(apiName);
            
            // Process and send the transcript to the API
            const summary = await apiEndpoint.generateSummary(prompt, captions);
            console.log(summary);

        } catch (error) {
            console.error(error.message);
        } finally {
            rl.close();
        }
    }

    function askQuestion(query) {
        return new Promise(resolve => rl.question(query, resolve));
    }

    handleUserInput();

}).catch(err => {
    console.error("Failed to load 'node-fetch' module", err);
});
