const toggleButton = document.getElementById('micButton');
const audioPlayer = document.getElementById('audioPlayer');

let recorder;
let audioChunks = [];
let isRecording = false;

async function toggleRecording() {
    if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPlayer.src = audioUrl;

            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.wav');

            fetch('/upload', { method: 'POST', body: formData })
                .then(response => response.text())
                .then(result => console.log(result))
                .catch(error => console.error('Error uploading audio:', error));

            audioChunks = [];
            toggleButton.textContent = 'Start Recording';
            isRecording = false;
        };

        recorder.start();
        toggleButton.textContent = 'Stop Recording';
        isRecording = true;
    } else {
        recorder.stop();
        toggleButton.textContent = 'Start Recording';
        isRecording = false;
    }
}

toggleButton.addEventListener('click', toggleRecording);
