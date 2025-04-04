const uploadBtn = document.getElementById('uploadBtn')
const fileInput = document.getElementById('fileInput')
const progressText = document.getElementById('progressText')
const progressBar = document.getElementById('progressBar')
const downloadLink = document.getElementById('downloadLink')
const liveProgress = document.getElementById('liveProgress')

let progressInterval

const pollProgress = async () => {
  try {
    const res = await fetch('http://localhost:3000/progress')
    const data = await res.json()
    if (liveProgress) {
      liveProgress.textContent = `${data.message} (${data.value}%)`
    }
    if (progressBar) {
      progressBar.value = data.value
    }
  } catch (err) {
    console.error('Failed to poll progress:', err)
  }
}

uploadBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    alert('Please select a file!')
    return
  }

  // Reset UI before starting new upload
  document.getElementById('progressContainer').style.display = 'block'
  progressText.textContent = 'Uploading...'
  progressBar.value = 0
  liveProgress.textContent = ''
  downloadLink.style.display = 'none'
  downloadLink.href = ''
  downloadLink.textContent = ''

  // Disable upload button and show busy text
  uploadBtn.disabled = true
  uploadBtn.textContent = 'Translating...'

  const file = fileInput.files[0]
  const formData = new FormData()
  formData.append('file', file)

  if (progressInterval) clearInterval(progressInterval)
  progressInterval = setInterval(pollProgress, 1000)

  try {
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('File processing failed')

    const blob = await response.blob()
    const fileURL = window.URL.createObjectURL(blob)

    downloadLink.href = fileURL
    downloadLink.style.display = 'block'
    downloadLink.textContent = 'Download Translated File'
    downloadLink.setAttribute('download', 'translated.xlsx')

    clearInterval(progressInterval)
    await pollProgress() // Final update
  } catch (error) {
    console.error('Error:', error)
    progressText.textContent = 'Error processing file'
    liveProgress.textContent = 'Something went wrong.'
    clearInterval(progressInterval)
  } finally {
    uploadBtn.disabled = false
    uploadBtn.textContent = 'Upload & Translate'
  }
})
