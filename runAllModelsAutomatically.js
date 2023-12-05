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
            default:
                throw new Error('Unknown API endpoint');
        }
    }

    function addColumnLabels(csvFilePath) {
        const columnLabels = 'video_id,transcript,gpt3.5,gpt3.5_word_count,gpt3.5_length,bart,bart_word_count,bart_length,pegasus,pegasus_word_count,pegasus_length,falcon,falcon_word_count,falcon_length\n';
        if (!fs.existsSync(csvFilePath) || fs.readFileSync(csvFilePath, 'utf8').trim() === '') {
            fs.writeFileSync(csvFilePath, columnLabels, 'utf8');
        }
    }

    function compareWords(transcript, summary) {
        const transcriptWords = new Set(transcript.split(/\s+/));
        const summaryWords = summary.split(/\s+/);
        let count = 0;

        summaryWords.forEach(word => {
            if (!transcriptWords.has(word)) {
                count++;
            }
        });

        return count;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function processVideo(videoId, youtubeService, apiNames, csvFilePath) {
        const captions = await youtubeService.fetchCaptions(videoId, 'TXT');
        const processedCaptions = processText(captions);
        const truncatedCaptions = truncateContent(processedCaptions, 1500);
        const csvRow = [videoId, `"${processedCaptions.replace(/"/g, '""')}"`];

        for (const apiName of apiNames) {
            const apiEndpoint = getApiEndpoint(apiName);
            try {

                // Add a delay for OpenAI API
                if (apiName === 'openai') {
                    console.log(`Waiting for 45 seconds before calling OpenAI API for video ID ${videoId}`);
                    await sleep(45000); // Wait for 45 seconds
                }                

                const summary = await apiEndpoint.generateSummary("", truncatedCaptions);
                const wordCount = compareWords(processedCaptions, summary);
                const summaryLength = summary.split(/\s+/).length;
                csvRow.push(`"${summary.replace(/"/g, '""')}"`, wordCount, summaryLength);
                console.log(`Summary for ${apiName} with ${wordCount} words not in transcript and length ${summaryLength}.`);
            } catch (error) {
                console.error(`Error during summary generation with ${apiName}:`, error.message);
                csvRow.push(`"${apiName} Error: ${error.message.replace(/"/g, '""')}"`, 0, 0);
            }
        }

        fs.appendFileSync(csvFilePath, csvRow.join(',') + '\n', 'utf8');
        console.log(`Summaries for video ID ${videoId} have been written to ${csvFilePath}`);
    }

    async function handleUserInput() {
        try {
            const videoIds = fs.readFileSync('video_ids.txt', 'utf8').split('\n').filter(Boolean);
            const csvFilePath = path.resolve(__dirname, 'summaries.csv');
            addColumnLabels(csvFilePath);

            const apiNames = [
                'openai',
                'huggingface-bart',
                'huggingface-pegasus',
                'huggingface-textsummarization',
                'huggingface-ledlargebooksummarization'
            ];

            for (const videoId of videoIds) {
                await processVideo(videoId, youtubeService, apiNames, csvFilePath);
            }
        } catch (error) {
            console.error(error.message);
        } finally {
            console.log("Processing complete.");
        }
    }

    handleUserInput();
}).catch((err) => {
    console.error("Failed to load 'node-fetch' module", err);
});
