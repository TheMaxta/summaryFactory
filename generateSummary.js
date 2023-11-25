const OpenAiApi = require('./openAiApi');  // importing the OpenAiApi class from the external module
require("dotenv").config();

function decodeHTMLEntities(text) {
    return text.replace(/&#39;/g, "'");
}

function processText(text) {
    if (typeof text !== 'string') {
        console.error('Expected string but received:', typeof text, text);
    }
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
        line = decodeHTMLEntities(line);
        return line.trim().replace(/\s+/g, ' ');
    });
    return processedLines.join('\n');
}

function truncateContent(content, maxSize) {
    if (content.length > maxSize) {
        console.warn(`Content exceeded ${maxSize} characters and was truncated.`);
        return content.substring(0, maxSize);
    } else {
        return content;
    }
}

class GenerateSummary {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    
    async generate(content) {
        try {  
            //content = processText(content);
            content = truncateContent(content, 40000); // Ensure the content size
            const openApi = new OpenAiApi(this.apiKey);
            content = processText(content);
            const summary = await openApi.summarize(content);
            return summary;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}
module.exports = GenerateSummary;