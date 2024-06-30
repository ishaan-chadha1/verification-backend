const express = require("express")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const cors = require("cors")

const app = express()
app.use(cors())
const uploadDir = "uploads"

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

app.post("/upload", upload.single("file"), (req, res) => {
  console.log("HIT")
  const uploader = req.body.uploader ?? "Miyagi Labs"
  const file = req.file
  console.log("🚀 ~ app.post ~ req.file:", req.file)

  if (!file) {
    return res.status(400).send("No file uploaded.")
  }

  const filePath = path.join(uploadDir, file.originalname)
  const uploaderInfo = { uploader, filePath }

  fs.writeFileSync(`${filePath}.json`, JSON.stringify(uploaderInfo, null, 2))

  res.status(200).send("File uploaded successfully.")
})

app.post("/verify", upload.single("file"), (req, res) => {
  const file = req.file
  console.log("🚀 ~ app.post ~ req.file:", req.file)

  if (!file) {
    return res.status(400).send("No file uploaded.")
  }

  const filePath = path.join(uploadDir, file.originalname)

  if (fs.existsSync(`${filePath}.json`)) {
    const jsonContent = fs.readFileSync(`${filePath}.json`, "utf-8")
    const uploaderInfo = JSON.parse(jsonContent)

    const verificationMessage = `File uploaded is verified. Uploaded by ${uploaderInfo.uploader}.`

    return res.status(200).send(verificationMessage)
  } else {
    return res.status(200).send("File not verified.")
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
