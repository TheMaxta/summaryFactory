const readline = require('readline');
const YouTubeService = require('./youtube.service.js');
const OpenAiApi = require('./openAiApi'); // Import OpenAiApi class
const BartApi = require('./bartApi'); // Import BartApi class
const PegasusApi = require('./pegasusApi'); // Import PegasusApi class
const TextSummarizationApi = require('./textSummarizationApi');
const LedLargeBookSummaryApi = require('./ledLargeBookSummaryApi');


require('dotenv').config();
const { processText, truncateContent } = require('./textpreprocessing.service');

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
            case 'huggingface-pegasus': 
                return new PegasusApi(huggingApiKey);    
            case 'huggingface-textsummarization': 
                return new TextSummarizationApi(huggingApiKey);
            case 'huggingface-ledlargebooksummarization': 
                return new LedLargeBookSummaryApi(huggingApiKey);

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

            console.log('Available models: openai, huggingface-bart, huggingface-pegasus, huggingface-textsummarization');
            const apiName = await askQuestion('Enter API endpoint name: ');
            const prompt = await askQuestion('Enter prompt for the summary: ');

            const captions = await youtubeService.fetchCaptions(videoId, captionType);
            const processedCaptions = processText(captions);
            const truncatedCaptions = truncateContent(processedCaptions, 1000); // Adjust the maxSize as needed (bart breaks with large inputs)
    
            console.log(truncatedCaptions);
            
            const apiEndpoint = getApiEndpoint(apiName);
            
            // Process and send the transcript to the API
            const summary = await apiEndpoint.generateSummary(prompt, truncatedCaptions);
            console.log("Summary: "+ summary);

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
