/**
 * Sir Mean Academy - Core Application Engine
 * Integrating: Firebase Realtime Modules, Canvas Synchronization, Web Media Streams, and Math Parsing.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// --- FIREBASE INFRASTRUCTURE DEPLOYMENT ---
const firebaseConfig = {
  apiKey: "AIzaSyDjuwVW1VuDpM3Hvq7ZGHsJ2gn6Ozw2b8k",
  authDomain: "sirmeanacademy.firebaseapp.com",
  projectId: "sirmeanacademy",
  storageBucket: "sirmeanacademy.firebasestorage.app",
  messagingSenderId: "560214497458",
  appId: "1:560214497458:web:1fcab0ca5ccff6fb6451ab",
  measurementId: "G-BXDTP2N7E1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- GLOBAL MEDIA MANAGERS ---
let mediaStreamInstance = null;
let mediaRecorderInstance = null;
let capturedChunks = [];
let isRecordingSession = false;

const videoView = document.getElementById('localVideo');
const videoMask = document.getElementById('videoPlaceholder');
const recordBtn = document.getElementById('start-record');

/**
 * Toggles interface tracking elements for active/inactive media hardware streams
 * @param {Boolean} isActive 
 */
function updateMediaStreamUIState(isActive) {
    if (isActive) {
        videoMask.classList.add('opacity-0', 'pointer-events-none');
    } else {
        videoMask.classList.remove('opacity-0', 'pointer-events-none');
    }
}

// Camera Input Routine
document.getElementById('start-stream').addEventListener('click', async () => {
    try {
        terminateActiveStreams();
        mediaStreamInstance = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoView.srcObject = mediaStreamInstance;
        updateMediaStreamUIState(true);
    } catch (exception) {
        alert("Hardware Access Denied: Please verify your system permissions for webcams.");
        console.error("Hardware runtime exception logging: ", exception);
    }
});

// Screen Capture Processing
document.getElementById('share-screen').addEventListener('click', async () => {
    try {
        terminateActiveStreams();
        mediaStreamInstance = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        videoView.srcObject = mediaStreamInstance;
        updateMediaStreamUIState(true);

        // Fail-safe handler for native browser toolbar closures
        mediaStreamInstance.getVideoTracks()[0].onended = () => {
            terminateActiveStreams();
        };
    } catch (exception) {
        console.warn("Screen tracking negotiation failed: ", exception);
    }
});

// Stream Hardware Cleanup Routine
document.getElementById('stop-stream').addEventListener('click', () => {
    terminateActiveStreams();
});

function terminateActiveStreams() {
    if (mediaStreamInstance) {
        mediaStreamInstance.getTracks().forEach(track => track.stop());
        mediaStreamInstance = null;
    }
    videoView.srcObject = null;
    updateMediaStreamUIState(false);
    if (isRecordingSession) stopClassroomRecording();
}


// --- SESSION LESSON RECORDING SYSTEM ---
recordBtn.addEventListener('click', () => {
    if (!mediaStreamInstance) {
        alert("Cannot record an empty workspace. Please start your webcam or share a screen first!");
        return;
    }

    if (!isRecordingSession) {
        startClassroomRecording();
    } else {
        stopClassroomRecording();
    }
});

function startClassroomRecording() {
    capturedChunks = [];
    const internalOptions = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    try {
        mediaRecorderInstance = new MediaRecorder(mediaStreamInstance, internalOptions);
    } catch (e) {
        mediaRecorderInstance = new MediaRecorder(mediaStreamInstance);
    }

    mediaRecorderInstance.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            capturedChunks.push(event.data);
        }
    };

    mediaRecorderInstance.onstop = () => {
        const structuralBlob = new Blob(capturedChunks, { type: 'video/webm' });
        const temporaryUrl = URL.createObjectURL(structuralBlob);
        
        // Auto Download execution stack for recorded archive
        const downloadHook = document.createElement('a');
        downloadHook.href = temporaryUrl;
        downloadHook.download = `Lecture_Archive_${Date.now()}.webm`;
        document.body.appendChild(downloadHook);
        downloadHook.click();
        document.body.removeChild(downloadHook);
    };

    mediaRecorderInstance.start(10); // Capture increments of 10ms
    isRecordingSession = true;
    recordBtn.innerHTML = `<i class="fa-solid fa-stop text-red-500 mr-1"></i> Stop Rec`;
    recordBtn.classList.replace('bg-slate-800', 'bg-red-950');
}

function stopClassroomRecording() {
    if (!mediaRecorderInstance || mediaRecorderInstance.state === 'inactive') return;
    mediaRecorderInstance.stop();
    isRecordingSession = false;
    recordBtn.innerHTML = `<i class="fa-solid fa-circle text-red-500 mr-1"></i> Record`;
    recordBtn.classList.replace('bg-red-950', 'bg-slate-800');
}


// --- LIVE ENHANCED CHAT & REALTIME COMMUNICATIONS ---
const logsBox = document.getElementById('chat-box');
const typingConsole = document.getElementById('chat-input');
const dispatchTrigger = document.getElementById('send-btn');

dispatchTrigger.addEventListener('click', executeMessageDispatch);
typingConsole.addEventListener('keydown', (e) => { if (e.key === 'Enter') executeMessageDispatch(); });

async function executeMessageDispatch() {
    const contextContent = typingConsole.value.trim();
    if (contextContent === '') return;

    try {
        await addDoc(collection(db, "chats"), {
            messageBody: contextContent,
            senderDesignation: "Instructor",
            timestamp: serverTimestamp()
        });
        typingConsole.value = '';
    } catch (databaseFault) {
        console.error("Cloud synchronicity exception: ", databaseFault);
    }
}

// Reactive UI Chat Synchronization Pipeline
const orderedQuery = query(collection(db, "chats"), orderBy("timestamp", "asc"));
onSnapshot(orderedQuery, (datasetSnapshot) => {
    logsBox.innerHTML = '';
    datasetSnapshot.forEach((record) => {
        const payload = record.data();
        const outerElement = document.createElement('div');
        outerElement.className = "flex flex-col space-y-0.5 bg-slate-900/60 border border-slate-800/40 p-3 rounded-xl max-w-[90%]";
        
        outerElement.innerHTML = `
            <span class="text-[10px] font-bold tracking-wider uppercase text-blue-400">${payload.senderDesignation || 'User'}</span>
            <p class="text-slate-200 text-xs leading-relaxed selection:bg-blue-500">${payload.messageBody}</p>
        `;
        logsBox.appendChild(outerElement);
    });
    logsBox.scrollTop = logsBox.scrollHeight;

    // Asynchronous MathJax structural scan pass execution
    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([logsBox]).catch((err) => console.error("MathJax Parsing error: ", err));
    }
});


// --- VECTORIZED DIGITAL WHITEBOARD COMPONENT ---
const boardCanvas = document.getElementById('whiteboard');
const context2D = boardCanvas.getContext('2d');
let strokeActivityActive = false;

// Color and thickness controller assignments
const strokePalette = document.getElementById('brush-color');
const thicknessSlider = document.getElementById('brush-size');

function optimizeCanvasDimensions() {
    boardCanvas.width = boardCanvas.parentElement.offsetWidth;
    boardCanvas.height = 360; // Locked height for professional horizontal aspects
    context2D.fillStyle = "#ffffff";
    context2D.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
}
optimizeCanvasDimensions();
window.addEventListener('resize', optimizeCanvasDimensions);

// Event Handlers for Desktop Input Systems
boardCanvas.addEventListener('mousedown', () => strokeActivityActive = true);
boardCanvas.addEventListener('mouseup', () => { strokeActivityActive = false; context2D.beginPath(); });
boardCanvas.addEventListener('mousemove', completeVectorStroke);

// Event Handlers for Mobile Mobile/Tablet Input Devices
boardCanvas.addEventListener('touchstart', (e) => { strokeActivityActive = true; e.preventDefault(); });
boardCanvas.addEventListener('touchend', () => { strokeActivityActive = false; context2D.beginPath(); });
boardCanvas.addEventListener('touchmove', (e) => {
    if (!strokeActivityActive) return;
    const trackingTouch = e.touches[0];
    const dispatchMouseMock = {
        clientX: trackingTouch.clientX,
        clientY: trackingTouch.clientY
    };
    completeVectorStroke(dispatchMouseMock);
});

function completeVectorStroke(event) {
    if (!strokeActivityActive) return;

    context2D.lineWidth = thicknessSlider.value;
    context2D.lineCap = 'round';
    context2D.lineJoin = 'round';
    context2D.strokeStyle = strokePalette.value;

    const geometryBounds = boardCanvas.getBoundingClientRect();
    const calculatedX = event.clientX - geometryBounds.left;
    const calculatedY = event.clientY - geometryBounds.top;

    context2D.lineTo(calculatedX, calculatedY);
    context2D.stroke();
    context2D.beginPath();
    context2D.moveTo(calculatedX, calculatedY);
}

document.getElementById('clear-board').addEventListener('click', () => {
    context2D.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    context2D.fillStyle = "#ffffff";
    context2D.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
});


// --- FILE ACCELERATION & STORAGE MANAGEMENT ---
const fileUploader = document.getElementById('file-uploader');
const fileListView = document.getElementById('file-list');

fileUploader.addEventListener('change', async (event) => {
    const queuedFile = event.target.files[0];
    if (!queuedFile) return;

    const fileStorageEndpoint = ref(storage, 'academic_vault/' + queuedFile.name);
    try {
        const uploadTaskReceipt = await uploadBytes(fileStorageEndpoint, queuedFile);
        const resolvedPublicAccessUrl = await getDownloadURL(uploadTaskReceipt.ref);
        
        appendResourceToInterface(queuedFile.name, resolvedPublicAccessUrl);
    } catch (processingFault) {
        console.error("Storage vault drop fault: ", processingFault);
        alert("Upload Interrupted: Check your connection and Firebase permissions rules.");
    }
});

function appendResourceToInterface(filename, connectionUrl) {
    const rowWrapper = document.createElement('li');
    rowWrapper.className = "flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition";
    rowWrapper.innerHTML = `
        <span class="truncate pr-4 text-slate-300 max-w-[200px]"><i class="fa-regular fa-file-pdf text-red-400 mr-2"></i>${filename}</span>
        <a href="${connectionUrl}" target="_blank" class="text-[11px] text-blue-400 hover:underline font-semibold flex items-center gap-1 shrink-0">Open <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i></a>
    `;
    fileListView.appendChild(rowWrapper);
}
