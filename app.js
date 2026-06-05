import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";

// Import Firebase SDK modules safely using mapped browser targets
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";

// ─── Firebase Configuration ──────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBen1RjWtmaOE2Ec3LbQvldBvCVaTzYJWk",
  authDomain: "sirmeanacademy-14b84.firebaseapp.com",
  projectId: "sirmeanacademy-14b84",
  storageBucket: "sirmeanacademy-14b84.firebasestorage.app",
  messagingSenderId: "3897951834",
  appId: "1:3897951834:web:154b0d93abdf8ffc32ba63"
};

// Initialize Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ─── Lucide-style inline SVG icons ───────────────────────────────────────────
const Icon = ({ d, size = 20, stroke = "currentColor", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const icons = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11",
  live: ["M23 7l-7 5 7 5V7z", "M1 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"],
  whiteboard: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  math: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  courses: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  chat: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  record: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v8 M8 12h8",
  students: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  plus: "M12 5v14 M5 12h14",
  send: "M22 2L11 13 M22 2L15 22 9 13 2 9l20-7z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  pdf: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8",
  video: "M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.888L15 14v-4z M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z",
  camera: ["M23 7l-7 5 7 5V7z", "M1 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"],
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8",
  screen: "M13 3H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9l-6-6z M13 3v6h6",
  pen: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  eraser: "M20 20H7L3 16l9-9 8 8-1.5 1.5 M6 7l8 8"
};

const renderLatex = (text) => {
  if (!text) return "";
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      const eq = part.slice(1, -1);
      return <span key={i} style={{ fontFamily: "'Times New Roman', serif", fontStyle: "italic", color: "#a78bfa", fontSize: "1.05em" }}>{eq}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function EduLivePro() {
  // ─── Authentication & User States ─────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // ─── Real Database States ──────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);

  // ─── Live Class Room & WebRTC Signaling States ────────────────────────────
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLive, setIsLive] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  // Media Controls
  const [isRecording, setIsRecording] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  // Form Inputs
  const [chatInput, setChatInput] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState("Mathematics");
  const [mathInput, setMathInput] = useState("$f(x) = \\frac{d}{dx}[x^2 + 3x + 5]$");
  const [mathPreview, setMathPreview] = useState("$f'(x) = 2x + 3$");

  // UI elements
  const [wbTool, setWbTool] = useState("pen");
  const [wbColor, setWbColor] = useState("#a78bfa");
  const [notification, setNotification] = useState(null);

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const chatEndRef = useRef(null);
  const recordTimer = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ─── 1. Handle Auth Status Changes & Query URL Parameter ───────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get("room");
        if (roomParam) {
          setRoomId(roomParam);
          setIsHost(false);
          setActiveTab("live");
          showNotif("Joining class as guest room parameter detected!", "info");
        }
      } else {
        setCurrentUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // ─── 2. Real-time Listeners (Syncing Database Collections) ─────────────────
  useEffect(() => {
    if (!currentUser) return;

    const coursesQuery = collection(db, "courses");
    const unsubCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesList = [];
      snapshot.forEach((doc) => coursesList.push({ id: doc.id, ...doc.data() }));
      setCourses(coursesList);
    });

    const chatQuery = query(collection(db, "global_chat"), orderBy("createdAt", "asc"));
    const unsubChat = onSnapshot(chatQuery, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setChatMessages(msgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    });

    const filesQuery = query(collection(db, "files"), orderBy("uploadedAt", "desc"));
    const unsubFiles = onSnapshot(filesQuery, (snapshot) => {
      const filesList = [];
      snapshot.forEach((doc) => filesList.push({ id: doc.id, ...doc.data() }));
      setUploadedFiles(filesList);
    });

    const presenceQuery = collection(db, "presence");
    const unsubPresence = onSnapshot(presenceQuery, (snapshot) => {
      setActiveStudentsCount(snapshot.size);
    });

    return () => {
      unsubCourses();
      unsubChat();
      unsubFiles();
      unsubPresence();
    };
  }, [currentUser]);

  // ─── 3. WebRTC Stream Setup ───────────────────────────────
  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: camOn, audio: micOn });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error acquiring audio/video hardware streams:", err);
    }
  };

  const stopLocalVideo = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const handleCreateClass = async () => {
    const generatedId = "room_" + Math.random().toString(36).substring(2, 9);
    setRoomId(generatedId);
    setIsHost(true);
    setIsLive(true);

    const baseDeployUrl = window.location.origin + window.location.pathname;
    const directLink = `${baseDeployUrl}?room=${generatedId}`;
    setShareableLink(directLink);

    await setDoc(doc(db, "classes", generatedId), {
      hostId: currentUser.uid,
      hostEmail: currentUser.email,
      status: "active",
      createdAt: serverTimestamp()
    });

    await startLocalVideo();
    showNotif("Live session created! Copy link to invite guests.");
  };

  const handleJoinClass = async () => {
    if (!roomId.trim()) return alert("Please specify a Room ID first!");
    const roomRef = doc(db, "classes", roomId.trim());
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      setIsHost(false);
      setIsLive(true);
      await startLocalVideo();
      showNotif("Successfully joined the live stream room!");
    } else {
      alert("Class room ID not found inside active database records.");
    }
  };

  const handleEndClass = async () => {
    stopLocalVideo();
    setIsLive(false);
    if (isHost && roomId) {
      await setDoc(doc(db, "classes", roomId), { status: "ended" }, { merge: true });
    }
    setRoomId("");
    setShareableLink("");
    showNotif("Class stream disconnected.");
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return alert("Please fill standard input fields.");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        showNotif("Welcome to Sir Mean School!");
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        showNotif("Logged in successfully!");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    try {
      await addDoc(collection(db, "courses"), {
        title: newCourseTitle.trim(),
        category: newCourseCategory,
        instructor: currentUser.email,
        createdAt: serverTimestamp()
      });
      setNewCourseTitle("");
      showNotif(`Added new class row for ${newCourseCategory}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    try {
      await addDoc(collection(db, "global_chat"), {
        user: currentUser.email,
        uid: currentUser.uid,
        msg: chatInput.trim(),
        avatar: currentUser.email.substring(0, 2).toUpperCase(),
        createdAt: serverTimestamp()
      });
      setChatInput("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab !== "whiteboard") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0f0a1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [activeTab]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    if (wbTool === "eraser") {
      ctx.clearRect(pos.x - 15, pos.y - 15, 30, 30);
    } else {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = wbColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  if (!currentUser) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#07040f", color: "#e2d9f3", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ background: "#0d0720", padding: 40, borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)", width: "100%", maxWidth: 400 }}>
          <h2 style={{ textAlign: "center", marginBottom: 6, color: "#a78bfa" }}>Sir Mean School</h2>
          <p style={{ fontSize: 13, color: "#7a6a9a", marginBottom: 20, textAlign: "center" }}>Unified Learning & Live Streaming Platform</p>
          <form onSubmit={handleAuthAction}>
            <input type="email" placeholder="Email Address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#fff", boxSizing: "border-box" }} />
            <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#fff", boxSizing: "border-box" }} />
            <button type="submit" style={{ width: "100%", padding: 12, borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a78bfa)", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}>
              {isRegistering ? "Create Institutional Account" : "Secure Log In"}
            </button>
          </form>
          <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: "transparent", border: "none", color: "#a78bfa", marginTop: 15, cursor: "pointer", fontSize: 13, width: "100%" }}>
            {isRegistering ? "Already have an account? Login" : "Need an account? Register here"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#07040f", color: "#e2d9f3", fontFamily: "sans-serif", overflow: "hidden" }}>
      <style>{`
        .nav-item:hover { background: rgba(124,58,237,0.15); }
        .nav-item.active { background: rgba(124,58,237,0.25); border-left: 3px solid #7c3aed; }
        .btn { cursor: pointer; transition: opacity 0.2s; } .btn:hover { opacity: 0.9; }
      `}</style>

      {notification && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: "#064e3b", border: "1px solid #34d399", padding: "12px 20px", borderRadius: 10 }}>
          {notification.msg}
        </div>
      )}

      <aside style={{ width: 220, background: "#0d0720", borderRight: "1px solid rgba(124,58,237,0.15)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(124,58,237,0.1)" }}>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#a78bfa" }}>Sir Mean School</div>
          <div style={{ fontSize: 10, color: "#6b5a8a", marginTop: 2 }}>GLOBAL ACADEMY</div>
        </div>
        
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: icons.home },
            { id: "live", label: "Live Room", icon: icons.live },
            { id: "whiteboard", label: "Whiteboard", icon: icons.whiteboard },
            { id: "math", label: "Math Matrix", icon: icons.math },
            { id: "courses", label: "Courses Portal", icon: icons.courses },
            { id: "files", label: "Stored Archives", icon: icons.upload }
          ].map(item => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 20px", background: "transparent", border: "none", color: "#e2d9f3", textAlign: "left" }}>
              <Icon d={item.icon} size={16} /> {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(124,58,237,0.1)" }}>
          <div style={{ fontSize: 12, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.email}</div>
          <button onClick={() => signOut(auth)} style={{ padding: "6px 12px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, width: "100%", cursor: "pointer", fontSize: 11 }}>Log Out</button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ color: "#a78bfa", marginBottom: 15 }}>Workspace Engine</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 30 }}>
              <div style={{ background: "#0d0720", padding: 20, borderRadius: 12, border: "1px solid rgba(124,58,237,0.15)" }}>
                <div style={{ fontSize: 12, color: "#7a6a9a" }}>Active System Courses</div>
                <div style={{ fontSize: 32, fontWeight: "bold" }}>{courses.length}</div>
              </div>
              <div style={{ background: "#0d0720", padding: 20, borderRadius: 12, border: "1px solid rgba(124,58,237,0.15)" }}>
                <div style={{ fontSize: 12, color: "#7a6a9a" }}>Network Presence</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#34d399" }}>{activeStudentsCount} Online</div>
              </div>
              <div style={{ background: "#0d0720", padding: 20, borderRadius: 12, border: "1px solid rgba(124,58,237,0.15)" }}>
                <div style={{ fontSize: 12, color: "#7a6a9a" }}>Total Archived Notes</div>
                <div style={{ fontSize: 32, fontWeight: "bold" }}>{uploadedFiles.length}</div>
              </div>
            </div>

            <div style={{ background: "#0d0720", padding: 20, borderRadius: 12, border: "1px solid rgba(124,58,237,0.15)" }}>
              <h3>Quick Broadcast Actions</h3>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={() => { setActiveTab("live"); handleCreateClass(); }} style={{ padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", cursor:"pointer" }}>Host New Live Class Link</button>
                <button onClick={() => setActiveTab("whiteboard")} style={{ padding: "10px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor:"pointer" }}>Open Live Sketchboard</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "live" && (
          <div>
            <h2 style={{ marginBottom: 15 }}>Real-time Video Lecture Stream</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
              <div>
                <div style={{ background: "#0d0720", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)", overflow: "hidden", position: "relative" }}>
                  <div style={{ display: "flex", background: "#000", minHeight: 360 }}>
                    <div style={{ flex: 1, position: "relative", borderRight: "1px solid #111" }}>
                      <video ref={localVideoRef} autoPlay playsInline muted={true} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.6)", padding: "4px 8px", fontSize: 11 }}>You ({isHost ? "Host" : "Guest"})</div>
                    </div>
                  </div>

                  <div style={{ padding: 16, background: "#0a0514", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {!isLive ? (
                      <div style={{ display: "flex", gap: 10, width: "100%" }}>
                        <button onClick={handleCreateClass} style={{ padding: "10px 16px", background: "#7c3aed", border: "none", color: "#fff", borderRadius: 6, cursor:"pointer" }}>Initialize Class as Host</button>
                        <div style={{ display: "flex", gap: 5, flex: 1 }}>
                          <input type="text" placeholder="Paste structural Room ID target..." value={roomId} onChange={e => setRoomId(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, background: "#1b113a", border: "1px solid #3b1d6e", color: "#fff" }} />
                          <button onClick={handleJoinClass} style={{ padding: "10px 16px", background: "#059669", border: "none", color: "#fff", borderRadius: 6, cursor:"pointer" }}>Connect Guest</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <div style={{ fontSize: 12 }}>Active Class Session: <strong style={{ color: "#a78bfa" }}>{roomId}</strong></div>
                        {shareableLink && (
                          <div style={{ fontSize: 12, color: "#34d399", background: "rgba(5,150,105,0.1)", padding: "6px 12px", borderRadius: 6 }}>
                            Invite Link: {shareableLink}
                          </div>
                        )}
                        <button onClick={handleEndClass} style={{ padding: "8px 16px", background: "#dc2626", border: "none", color: "#fff", borderRadius: 6, cursor:"pointer" }}>Disconnect Call</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: "#0d0720", borderRadius: 12, border: "1px solid rgba(124,58,237,0.2)", display: "flex", flexDirection: "column", height: 420 }}>
                <div style={{ padding: 12, borderBottom: "1px solid #222", fontSize: 13, fontWeight: "bold" }}>School Live Stream Chat</div>
                <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {chatMessages.map(m => (
                    <div key={m.id} style={{ fontSize: 12 }}>
                      <span style={{ color: "#a78bfa", fontWeight: "bold" }}>{m.user ? m.user.split("@")[0] : "User"}: </span>
                      <span style={{ color: "#e2d9f3" }}>{renderLatex(m.msg)}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div style={{ padding: 8, borderTop: "1px solid #222", display: "flex", gap: 6 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Type broadcast text..." style={{ flex: 1, background: "#1b113a", border: "none", padding: 8, color: "#fff", borderRadius: 4 }} />
                  <button onClick={sendChat} style={{ padding: "8px 12px", background: "#7c3aed", border: "none", color: "#fff", borderRadius: 4, cursor:"pointer" }}>Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "whiteboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h3>Interactive Graphical Sketchboard Canvas</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setWbTool("pen")} style={{ background: wbTool === "pen" ? "#7c3aed" : "#222", padding: "6px 12px", color: "#fff", border: "none", borderRadius: 4, cursor:"pointer" }}>Pen</button>
                <button onClick={() => setWbTool("eraser")} style={{ background: wbTool === "eraser" ? "#7c3aed" : "#222", padding: "6px 12px", color: "#fff", border: "none", borderRadius: 4, cursor:"pointer" }}>Eraser</button>
                <button onClick={() => { const ctx = canvasRef.current.getContext("2d"); ctx.fillStyle = "#0f0a1e"; ctx.fillRect(0,0,1100,600); }} style={{ background: "#dc2626", padding: "6px 12px", color: "#fff", border: "none", borderRadius: 4, cursor:"pointer" }}>Reset Layout</button>
              </div>
            </div>
            <canvas ref={canvasRef} width={900} height={450} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => isDrawing.current = false} onMouseLeave={() => isDrawing.current = false} style={{ width: "100%", background: "#0f0a1e", border: "1px solid #3b1d6e", borderRadius: 8 }} />
          </div>
        )}

        {activeTab === "math" && (
          <div>
            <h3>LaTeX Mathematical Formulation Engine</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 15 }}>
              <div style={{ background: "#0d0720", padding: 16, borderRadius: 8 }}>
                <label style={{ fontSize: 12, color: "#a78bfa" }}>Input Raw Notation Structure String:</label>
                <textarea value={mathInput} onChange={e => setMathInput(e.target.value)} rows={4} style={{ width: "100%", background: "#1b113a", border: "1px solid #3b1d6e", padding: 10, color: "#fff", marginTop: 8, borderRadius: 6 }} />
              </div>
              <div style={{ background: "#0d0720", padding: 16, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "#a78bfa" }}>Live Output Rendering Interpretation Window:</div>
                <div style={{ padding: 15, background: "rgba(0,0,0,0.2)", borderRadius: 6, marginTop: 8, minHeight: 100 }}>
                  {renderLatex(mathInput)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <h3>Course Portal Management Hub</h3>
            <p style={{ fontSize: 13, color: "#7a6a9a", marginBottom: 15 }}>Add and organize multi-disciplinary courses for Sir Mean School.</p>
            <form onSubmit={handleCreateCourse} style={{ display: "flex", gap: 10, background: "#0d0720", padding: 16, borderRadius: 8, marginBottom: 20 }}>
              <input type="text" placeholder="Course Title (e.g., Intro to Statistics Level 200)" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} style={{ flex: 1, padding: 10, background: "#1b113a", border: "1px solid #3b1d6e", color: "#fff", borderRadius: 6 }} />
              <select value={newCourseCategory} onChange={e => setNewCourseCategory(e.target.value)} style={{ padding: 10, background: "#1b113a", border: "1px solid #3b1d6e", color: "#fff", borderRadius: 6 }}>
                <option value="Mathematics">Mathematics</option>
                <option value="Statistics">Statistics</option>
                <option value="Science">Science</option>
                <option value="Data Science">Data Science</option>
              </select>
              <button type="submit" style={{ padding: "10px 20px", background: "#7c3aed", border: "none", color: "#fff", borderRadius: 6, fontWeight: "bold", cursor:"pointer" }}>Add Course Row</button>
            </form>

            <div style={{ display: "grid", gap: 10 }}>
              {courses.map(c => (
                <div key={c.id} style={{ background: "#0d0720", padding: 16, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(124,58,237,0.1)" }}>
                  <div>
                    <h4 style={{ margin: 0, color: "#e2d9f3" }}>{c.title}</h4>
                    <span style={{ fontSize: 11, color: "#a78bfa", background: "rgba(124,58,237,0.1)", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>{c.category}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#7a6a9a" }}>Instructor: {c.instructor ? c.instructor.split("@")[0] : "Admin"}</div>
                </div>
              ))}
              {courses.length === 0 && <p style={{ fontSize: 13, color: "#7a6a9a", textAlign: "center" }}>No courses populated yet. Create the first subject above!</p>}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div>
            <h3>Academic Storage Archives</h3>
            <button onClick={async () => {
              const name = prompt("Enter simulated resource assignment label name:");
              if(!name) return;
              await addDoc(collection(db, "files"), {
                name: name + ".pdf",
                size: "1.8 MB",
                uploadedBy: currentUser.email,
                uploadedAt: serverTimestamp()
              });
              showNotif("Document added successfully to database tracking system.");
            }} style={{ padding: "10px 16px", background: "#7c3aed", border: "none", color: "#fff", borderRadius: 6, marginBottom: 15, cursor:"pointer" }}>
              Link New Study File Asset
            </button>
            <div style={{ background: "#0d0720", borderRadius: 8, overflow: "hidden" }}>
              {uploadedFiles.map(f => (
                <div key={f.id} style={{ padding: 14, borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>📄 {f.name} ({f.size})</span>
                  <span style={{ color: "#7a6a9a" }}>By: {f.uploadedBy}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Global initialization for the React app using the mapping endpoint
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<EduLivePro />);
