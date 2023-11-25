const readline = require('readline');
const MistralApi = require('./mistralApi'); // Import MistralApi class
require('dotenv').config();
const huggingApiKey = process.env.HUGGINGFACE_API_TOKEN

async function testMistralApi() {
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

    const mistralApi = new MistralApi(huggingApiKey);

    try {
        // Assuming the Mistral model generates text based on the prompt
        const generatedText = await mistralApi.generateText(sampleInput);
        console.log("Generated Text:", generatedText);
    } catch (error) {
        console.error("Error during API call:", error);
    }
}

testMistralApi();
