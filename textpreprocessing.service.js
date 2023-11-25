

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

module.exports = {
    processText,
    truncateContent
};
