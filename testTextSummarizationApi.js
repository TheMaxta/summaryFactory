const readline = require('readline');
const TextSummarizationApi = require('./textSummarizationApi'); // Update the path if necessary
require('dotenv').config();
const huggingApiKey = process.env.HUGGINGFACE_API_TOKEN

async function testTextSummarizationApi() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let sampleInput = '';

    console.log("Enter the text (Type 'END' on a new line to finish):");

    for await (const line of rl) {
        if (line.toLowerCase() === 'end') {
            rl.close();
            break;
        }
        sampleInput += line + '\n';
    }

    const textSummarizationApi = new TextSummarizationApi(huggingApiKey);

    try {
        const summary = await textSummarizationApi.generateSummary("", sampleInput);
        console.log("Summary:", summary);
    } catch (error) {
        console.error("Error during API call:", error);
    }
}

testTextSummarizationApi();
