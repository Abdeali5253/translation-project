document.getElementById('uploadBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput')
  const progressText = document.getElementById('progressText')
  const progressBar = document.getElementById('progressBar')
  const downloadLink = document.getElementById('downloadLink')

  if (!fileInput.files.length) {
    alert('Please select a file!')
    return
  }

  const file = fileInput.files[0]
  const formData = new FormData()
  formData.append('file', file)

  // Show progress UI
  document.getElementById('progressContainer').style.display = 'block'
  progressText.textContent = 'Uploading file...'
  progressBar.value = 10

  try {
    // Upload file to backend
    const response = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) throw new Error('File processing failed')

    progressText.textContent = 'Translation in progress...'
    progressBar.value = 50

    // Wait for the translated file
    const blob = await response.blob()
    const fileURL = window.URL.createObjectURL(blob)

    // Show download link
    downloadLink.href = fileURL
    downloadLink.style.display = 'block'
    downloadLink.textContent = 'Download Translated File'
    downloadLink.setAttribute('download', 'translated.xlsx')

    progressText.textContent = 'Translation Complete!'
    progressBar.value = 100
  } catch (error) {
    console.error('Error:', error)
    progressText.textContent = 'Error processing file'
  }
})
