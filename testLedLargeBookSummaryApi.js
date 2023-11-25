const readline = require('readline');
const LedLargeBookSummaryApi = require('./ledLargeBookSummaryApi'); // Update the path if necessary
require('dotenv').config();
const huggingApiKey = process.env.HUGGINGFACE_API_TOKEN

async function testLedLargeBookSummaryApi() {
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

    const ledLargeBookSummaryApi = new LedLargeBookSummaryApi(huggingApiKey);

    try {
        const summary = await ledLargeBookSummaryApi.generateSummary(sampleInput);
        console.log("Summary:", summary);
    } catch (error) {
        console.error("Error during API call:", error);
    }
}

testLedLargeBookSummaryApi();