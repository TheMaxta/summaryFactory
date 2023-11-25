const readline = require('readline');
const PegasusApi = require('./pegasusApi'); // Make sure the path is correct
require('dotenv').config();
const huggingApiKey = process.env.HUGGINGFACE_API_TOKEN

async function testPegasusApi() {
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

    const pegasusApi = new PegasusApi(huggingApiKey);

    try {
        const summary = await pegasusApi.generateSummary(" ", sampleInput);
        console.log("Summary:", summary);
    } catch (error) {
        console.error("Error during API call:", error);
    }
}

testPegasusApi();
