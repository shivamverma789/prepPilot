const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

/**
 * Extract text from a Buffer (no disk I/O — safe for ephemeral filesystems).
 * @param {Buffer} buffer
 * @param {string} mimetype
 */
exports.extractText = async (buffer, mimetype) => {
  try {
    if (mimetype === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    }

    if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (err) {
    console.error("TEXT EXTRACTION ERROR:", err);
    throw err;
  }
};
