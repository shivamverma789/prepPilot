const fs = require("fs")
const { PDFParse } = require("pdf-parse")
const mammoth = require("mammoth")

exports.extractText = async (filePath, mimetype) => {

  try{

    // PDF
    if(mimetype === "application/pdf"){

      const buffer = fs.readFileSync(filePath)

      const parser = new PDFParse({ data: buffer })

      const result = await parser.getText()

      return result.text
    }

    // DOCX
    if(mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){

      const result = await mammoth.extractRawText({ path: filePath })

      return result.value
    }

    throw new Error("Unsupported file type")

  }catch(err){
    console.error("TEXT EXTRACTION ERROR:", err)
    throw err
  }

}