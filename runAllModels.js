const fs = require('fs');
const path = require('path');
const readline = require('readline');
const YouTubeService = require('./youtube.service.js');
const OpenAiApi = require('./openAiApi'); // Import OpenAiApi class
const BartApi = require('./bartApi'); // Import BartApi class
const PegasusApi = require('./pegasusApi'); // Import PegasusApi class
const TextSummarizationApi = require('./textSummarizationApi'); // Import TextSummarizationApi class
const LedLargeBookSummaryApi = require('./ledLargeBookSummaryApi'); // Import LedLargeBookSummaryApi class
require('dotenv').config();
const { processText, truncateContent } = require('./textpreprocessing.service');

const openaiApiKey = process.env.OPENAI_API_KEY;
const huggingApiKey = process.env.HUGGINGFACE_API_TOKEN;

import('node-fetch').then((module) => {
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

            const captions = await youtubeService.fetchCaptions(videoId, captionType);
            const processedCaptions = processText(captions);
            const truncatedCaptions = truncateContent(processedCaptions, 1500);

            const apiNames = [
                'openai',
                'huggingface-bart',
                'huggingface-pegasus',
                'huggingface-textsummarization',
                'huggingface-ledlargebooksummarization'
            ];

            const csvRow = [videoId, `"${processedCaptions.replace(/"/g, '""')}"`];

            for (const apiName of apiNames) {
                const apiEndpoint = getApiEndpoint(apiName);

                try {
                    const summary = await apiEndpoint.generateSummary("", truncatedCaptions);
                    csvRow.push(`"${summary.replace(/"/g, '""')}"`);
                    console.log(`Summary for ${apiName} successfully written to csv.`)
                } catch (error) {
                    console.error(`Error during summary generation with ${apiName}:`, error.message);
                    csvRow.push(`"${apiName} Error: ${error.message.replace(/"/g, '""')}"`);
                }
            }

            const csvFilePath = path.resolve(__dirname, 'summaries.csv');
            fs.appendFileSync(csvFilePath, csvRow.join(',') + '\n', 'utf8');
            console.log(`Summaries have been written to ${csvFilePath}`);
            
        } catch (error) {
            console.error(error.message);
        } finally {
            rl.close();
        }
    }

    function askQuestion(query) {
        return new Promise((resolve) => rl.question(query, resolve));
    }

    handleUserInput();
}).catch((err) => {
    console.error("Failed to load 'node-fetch' module", err);
});

// Function getLastIndex is not used in this script, but can be included for future enhancements.
function getLastIndex(csvFilePath) {
    if (!fs.existsSync(csvFilePath)) return 0;
    const data = fs.readFileSync(csvFilePath, 'utf8');
    const lines = data.trim().split('\n');
    return lines.length; // Assumes no header; if there's a header, subtract 1
}
