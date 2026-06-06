/**
 * Sir Mean School — Integrated Production Application Controller Matrix
 * Framework Core: Pure Vanillajs Enterprise Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 🗄️ STATE ENGINE & IN-MEMORY MODEL SCHEMA DATABASE
    // ==========================================
    const db = {
        users: [
            { id: "u-default-host", name: "Sir Mean Host", email: "host@sirmean.com", role: "host", avatar: "SM" }
        ],
        classes: [
            {
                id: "room-abc-123-xyz",
                title: "Advanced Statistical Probability and Estimation Models",
                subject: "Statistics",
                dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
                desc: "Exploring variance properties, unbiased estimators, central limit theorems, and mathematical expectations bounds.",
                hostId: "u-default-host",
                hostName: "Sir Mean Host",
                linkToken: "room-abc-123-xyz"
            }
        ],
        session: {
            currentUser: null,
            activeRoomChannel: null,
            liveTimerRef: null,
            liveElapsedSeconds: 0,
            isRecording: false
        }
    };

    // ==========================================
    // 🎛️ DOM HOOK ELEMENT DECLARATIONS CACHE
    // ==========================================
    const UI = {
        // High-level structural views
        viewAuth: document.getElementById('view-auth'),
        viewApp: document.getElementById('view-app'),
        
        // Authentication Node elements
        authTabLogin: document.getElementById('auth-tab-login'),
        authTabRegister: document.getElementById('auth-tab-register'),
        registerFields: document.getElementById('register-fields'),
        roleSelectorContainer: document.getElementById('role-selector-container'),
        authSubmitBtn: document.getElementById('auth-submit-btn'),
        authName: document.getElementById('auth-name'),
        authEmail: document.getElementById('auth-email'),
        authPassword: document.getElementById('auth-password'),
        appSignout: document.getElementById('app-signout'),
        
        // Sidebar profile identifiers
        userAvatar: document.getElementById('user-avatar'),
        userDisplayName: document.getElementById('user-display-name'),
        userDisplayRole: document.getElementById('user-display-role'),
        
        // Navigation system triggers
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabPanels: document.querySelectorAll('.tab-panel'),
        
        // Dashboard metric widgets
        statClassesCount: document.getElementById('stat-classes-count'),
        statUsersCount: document.getElementById('stat-users-count'),
        dashboardScheduleFeed: document.getElementById('dashboard-schedule-feed'),
        
        // Scheduler panels
        schedulerGridSystem: document.getElementById('scheduler-grid-system'),
        schedulerHostOpenModalBtn: document.getElementById('scheduler-host-open-modal-btn'),
        schedulerStudentNoticeBadge: document.getElementById('scheduler-student-notice-badge'),
        schedulerCreateModal: document.getElementById('scheduler-create-modal'),
        schedulerModalCloseBtn: document.getElementById('scheduler-modal-close-btn'),
        formSchedulerSubmitBtn: document.getElementById('form-scheduler-submit-btn'),
        
        // Scheduling data form controls
        formClassTitle: document.getElementById('form-class-title'),
        formClassSubject: document.getElementById('form-class-subject'),
        formClassDatetime: document.getElementById('form-class-datetime'),
        formClassDesc: document.getElementById('form-class-desc'),
        
        // Live stream workspace assets
        liveClassroomHeaderTitle: document.getElementById('live-classroom-header-title'),
        liveClassroomHeaderSubject: document.getElementById('live-classroom-header-subject'),
        liveDirectJoinCodeInput: document.getElementById('live-direct-join-code-input'),
        liveDirectAttachBtn: document.getElementById('live-direct-attach-btn'),
        liveFeedCameraPlaceholder: document.getElementById('live-feed-camera-placeholder'),
        liveVideoSimulatedMatrix: document.getElementById('live-video-simulated-matrix'),
        liveSimBadgeIdentity: document.getElementById('live-sim-badge-identity'),
        liveSimTimerClock: document.getElementById('live-sim-timer-clock'),
        liveRosterCountVal: document.getElementById('live-roster-count-val'),
        liveRosterFeedStack: document.getElementById('live-roster-feed-stack'),
        ctrlMicToggle: document.getElementById('ctrl-mic-toggle'),
        ctrlCamToggle: document.getElementById('ctrl-cam-toggle'),
        ctrlScreenToggle: document.getElementById('ctrl-screen-toggle'),
        ctrlRecordToggle: document.getElementById('ctrl-record-toggle'),
        ctrlDisconnectRoom: document.getElementById('ctrl-disconnect-room'),
        
        // Whiteboard parameters
        whiteboardCanvas: document.getElementById('whiteboard-canvas'),
        wbClearBtn: document.getElementById('wb-clear-btn'),
        wbColorPaletteStack: document.getElementById('wb-color-palette-stack'),
        
        // Math compiler view objects
        latexStringInputBuffer: document.getElementById('latex-string-input-buffer'),
        latexRenderedViewport: document.getElementById('latex-rendered-viewport')
    };

    let authMode = "login"; // "login" | "register"
    let currentActiveRoleSelection = "student";

    // ==========================================
    // 📟 CORE UTILITY ACTIONS & DECORATORS
    // ==========================================
    function createToast(message, type = "success") {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `p-4 rounded-xl text-xs font-semibold text-white shadow-xl transition-all duration-300 transform translate-y-2 pointer-events-auto flex items-center gap-3 max-w-sm border backdrop-blur-md`;
        
        if (type === "success") {
            toast.className += " bg-emerald-950/90 border-emerald-500/40 text-emerald-300";
            toast.innerHTML = `<i class="fa-solid fa-circle-check text-base"></i> <span>${message}</span>`;
        } else if (type === "error") {
            toast.className += " bg-red-950/90 border-red-500/40 text-red-300";
            toast.innerHTML = `<i class="fa-solid fa-circle-exclamation text-base"></i> <span>${message}</span>`;
        } else {
            toast.className += " bg-blue-950/90 border-blue-500/40 text-blue-300";
            toast.innerHTML = `<i class="fa-solid fa-circle-info text-base"></i> <span>${message}</span>`;
        }

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2'), 10);

        setTimeout(() => {
            toast.classList.add('opacity-0', '-translate-y-2');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    function generateSecureRoomToken() {
        const sequence = "abcdefghijklmnopqrstuvwxyz0123456789";
        const block = (length) => Array.from({ length }, () => sequence[Math.floor(Math.random() * sequence.length)]).join('');
        return `room-${block(3)}-${block(4)}-${block(3)}`;
    }

    // ==========================================
    // 🔐 AUTHENTICATION CONTROLLER FLOW INTERACTION
    // ==========================================
    function setAuthMode(mode) {
        authMode = mode;
        if (mode === "login") {
            UI.authTabLogin.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-white bg-purple-600/40";
            UI.authTabRegister.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-[#7a6a9a]";
            UI.registerFields.classList.add('hidden');
            UI.roleSelectorContainer.classList.add('hidden');
            UI.authSubmitBtn.innerText = "Sign In →";
        } else {
            UI.authTabRegister.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-white bg-purple-600/40";
            UI.authTabLogin.className = "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-[#7a6a9a]";
            UI.registerFields.classList.remove('hidden');
            UI.roleSelectorContainer.classList.remove('hidden');
            UI.authSubmitBtn.innerText = "Complete Registration Engine →";
        }
    }

    UI.authTabLogin.addEventListener('click', () => setAuthMode("login"));
    UI.authTabRegister.addEventListener('click', () => setAuthMode("register"));

    document.querySelectorAll('#role-selector-container button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetButton = e.currentTarget;
            currentActiveRoleSelection = targetButton.getAttribute('data-role');
            
            document.querySelectorAll('#role-selector-container button').forEach(b => {
                b.className = "py-2.5 rounded-xl border border-purple-900/20 text-[#7a6a9a] bg-purple-950/10 text-xs font-bold flex items-center justify-center gap-2";
            });
            
            targetButton.className = "py-2.5 rounded-xl border border-purple-500 text-white bg-purple-600/30 text-xs font-bold flex items-center justify-center gap-2";
        });
    });

    UI.authSubmitBtn.addEventListener('click', () => {
        const email = UI.authEmail.value.trim();
        const password = UI.authPassword.value.trim();
        const name = UI.authName.value.trim();

        if (!email || !password) {
            createToast("Please complete email and password inputs.", "error");
            return;
        }

        if (authMode === "register") {
            if (!name) {
                createToast("Full user profiling name parameter missing.", "error");
                return;
            }
            const structuredUser = {
                id: `u-${Date.now()}`,
                name: name,
                email: email,
                role: currentActiveRoleSelection,
                avatar: name.slice(0, 2).toUpperCase()
            };
            db.users.push(structuredUser);
            db.session.currentUser = structuredUser;
            createToast(`Account processing approved as: ${structuredUser.role}`);
        } else {
            const matchingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (matchingUser) {
                db.session.currentUser = matchingUser;
                createToast(`Authorization match routing verified. Welcome back.`);
            } else {
                const autoGeneratedUser = {
                    id: `u-${Date.now()}`,
                    name: email.split('@')[0],
                    email: email,
                    role: "student",
                    avatar: email.slice(0, 2).toUpperCase()
                };
                db.users.push(autoGeneratedUser);
                db.session.currentUser = autoGeneratedUser;
                createToast("Runtime dynamic credentials initialized as Student.", "info");
            }
        }

        initializeApplicationDashboardWorkspace();
    });

    UI.appSignout.addEventListener('click', () => {
        disconnectActiveChannelPipeline();
        db.session.currentUser = null;
        UI.viewApp.classList.add('hidden');
        UI.viewAuth.classList.remove('hidden');
        createToast("Core secure lifecycle connection flushed completely.", "info");
    });

    // ==========================================
    // 🗺️ VIEWPORT ROUTER INTERACTION NAV ARCHITECTURE
    // ==========================================
    function navigateToTab(targetTabId) {
        UI.tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === targetTabId) {
                btn.className = "tab-btn w-full px-5 py-3 flex items-center gap-3 text-sm transition-all text-[#a78bfa] font-semibold bg-purple-600/10 border-l-4 border-[#7c3aed]";
            } else {
                btn.className = "tab-btn w-full px-5 py-3 flex items-center gap-3 text-sm transition-all text-[#7a6a9a] hover:bg-purple-950/10 border-l-4 border-transparent";
            }
        });

        UI.tabPanels.forEach(panel => {
            if (panel.id === `panel-${targetTabId}`) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        });

        if (targetTabId === "whiteboard") {
            initializeCanvasWorkspaceRules();
        }
    }

    UI.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateToTab(btn.getAttribute('data-tab')));
    });

    // Handle interactive inline jump buttons seamlessly
    document.addEventListener('click', (e) => {
        const jumpTarget = e.target.closest('[data-jump-tab]');
        if (jumpTarget) {
            navigateToTab(jumpTarget.getAttribute('data-jump-tab'));
        }
        
        if (e.target.hasAttribute('data-trigger-scheduler')) {
            navigateToTab("scheduler");
        }
    });

    // ==========================================
    // 🧱 WORKSPACE PRESENTATION AND POPULATION REFINERY
    // ==========================================
    function initializeApplicationDashboardWorkspace() {
        const user = db.session.currentUser;
        if (!user) return;

        UI.userDisplayName.innerHTML = `${user.name} ${user.role === 'host' ? '👨‍🏫' : '👨‍🎓'}`;
        UI.userDisplayRole.innerText = `${user.role} Context Workspace`;
        UI.userAvatar.innerText = user.avatar;

        if (user.role === "host") {
            UI.schedulerHostOpenModalBtn.classList.remove('hidden');
            UI.schedulerStudentNoticeBadge.classList.add('hidden');
        } else {
            UI.schedulerHostOpenModalBtn.classList.add('hidden');
            UI.schedulerStudentNoticeBadge.classList.remove('hidden');
        }

        UI.viewAuth.classList.add('hidden');
        UI.viewApp.classList.remove('hidden');

        refreshStructuralDatabaseFeeds();
        navigateToTab("dashboard");
    }

    function refreshStructuralDatabaseFeeds() {
        UI.statClassesCount.innerText = `${db.classes.length} Nodes`;
        UI.statUsersCount.innerText = `${db.users.length} Enrolled`;

        // Render Dashboard Upcoming Modules Preview
        UI.dashboardScheduleFeed.innerHTML = "";
        if (db.classes.length === 0) {
            UI.dashboardScheduleFeed.innerHTML = `<div class="text-xs text-[#6b5a8a] py-4 italic">No classroom operational slots locked inside ledger arrays...</div>`;
        } else {
            db.classes.slice(0, 3).forEach(c => {
                const row = document.createElement('div');
                row.className = "bg-[#0d0720] border border-purple-900/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";
                row.innerHTML = `
                    <div>
                        <h4 class="text-xs font-bold text-white">${c.title}</h4>
                        <p class="text-[11px] text-[#7a6a9a] mt-0.5">${c.subject} — Planned at ${new Date(c.dateTime).toLocaleString()}</p>
                    </div>
                    <button data-attach-room="${c.linkToken}" class="px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/30 border border-purple-900/30 text-[11px] font-bold text-purple-300 whitespace-nowrap transition-all">
                        Initialize Matrix Channel
                    </button>
                `;
                UI.dashboardScheduleFeed.appendChild(row);
            });
        }

        // Render Comprehensive Scheduler Cards Roster
        UI.schedulerGridSystem.innerHTML = "";
        if (db.classes.length === 0) {
            UI.schedulerGridSystem.innerHTML = `<div class="col-span-full text-center text-xs text-[#6b5a8a] py-8 italic">No lessons have been scheduled yet.</div>`;
        } else {
            db.classes.forEach(c => {
                const card = document.createElement('div');
                card.className = "bg-[#0d0720] border border-purple-900/15 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/30 transition-all";
                
                // Virtual access routing url construction token matching 2026 patterns
                const mockDeploymentUrl = `${window.location.origin}/join/${c.linkToken}`;

                card.innerHTML = `
                    <div class="space-y-2">
                        <div class="flex justify-between items-start gap-2">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-950/60 text-[#a78bfa] border border-purple-900/40">${c.subject}</span>
                            <span class="text-[10px] font-mono text-[#6b5a8a]">${c.linkToken}</span>
                        </div>
                        <h3 class="text-sm font-bold text-white leading-snug">${c.title}</h3>
                        <p class="text-xs text-[#7a6a9a] line-clamp-2 leading-relaxed">${c.desc}</p>
                        <div class="pt-1 flex items-center gap-2 text-[11px] text-purple-300/80 font-medium">
                            <i class="fa-regular fa-clock"></i> <span>${new Date(c.dateTime).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div class="pt-3 border-t border-purple-900/10 space-y-2">
                        <div class="flex gap-2 bg-[#07040f] p-2 rounded-lg border border-purple-900/20 items-center justify-between">
                            <span class="text-[10px] font-mono truncate text-purple-400 select-all max-w-[70%]">${mockDeploymentUrl}</span>
                            <button data-copy-payload="${mockDeploymentUrl}" class="text-xs text-[#7a6a9a] hover:text-white transition-all px-1"><i class="fa-regular fa-copy"></i></button>
                        </div>
                        <button data-attach-room="${c.linkToken}" class="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-right-to-bracket"></i> Launch Virtual Pipeline
                        </button>
                    </div>
                `;
                UI.schedulerGridSystem.appendChild(card);
            });
        }
    }

    // Modal Display Trigger Bindings
    UI.schedulerHostOpenModalBtn.addEventListener('click', () => UI.schedulerCreateModal.classList.replace('hidden', 'flex'));
    UI.schedulerModalCloseBtn.addEventListener('click', () => UI.schedulerCreateModal.classList.replace('flex', 'hidden'));

    UI.formSchedulerSubmitBtn.addEventListener('click', () => {
        const title = UI.formClassTitle.value.trim();
        const subject = UI.formClassSubject.value;
        const datetime = UI.formClassDatetime.value;
        const desc = UI.formClassDesc.value.trim();

        if (!title || !datetime) {
            createToast("Topic Title and Datetime values cannot be blank.", "error");
            return;
        }

        const scheduledNode = {
            id: `room-${Date.now()}`,
            title: title,
            subject: subject,
            dateTime: datetime,
            desc: desc || "No supplemental syllabus parameters mapped.",
            hostId: db.session.currentUser.id,
            hostName: db.session.currentUser.name,
            linkToken: generateSecureRoomToken()
        };

        db.classes.unshift(scheduledNode);
        
        // Reset Inputs
        UI.formClassTitle.value = "";
        UI.formClassDesc.value = "";
        
        UI.schedulerCreateModal.classList.replace('flex', 'hidden');
        createToast("Classroom tracking block securely saved.");
        refreshStructuralDatabaseFeeds();
    });

    // Dynamic Context Capture for Injected Payload Buttons
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('[data-copy-payload]');
        if (copyBtn) {
            const copyValue = copyBtn.getAttribute('data-copy-payload');
            navigator.clipboard.writeText(copyValue)
                .then(() => createToast("Token URL string copied to system clipboard."))
                .catch(() => createToast("Clipboard operation rejected.", "error"));
        }

        const launchRoomBtn = e.target.closest('[data-attach-room]');
        if (launchRoomBtn) {
            const targetedToken = launchRoomBtn.getAttribute('data-attach-room');
            attachStreamChannelPipeline(targetedToken);
        }
    });

    // ==========================================
    // 🎥 LIVE MULTICAST STREAMROOM SIMULATOR ENGINE
    // ==========================================
    function attachStreamChannelPipeline(token) {
        const targetedSession = db.classes.find(c => c.linkToken === token);
        
        if (!targetedSession) {
            createToast("Invalid matrix reference index room link token.", "error");
            return;
        }

        disconnectActiveChannelPipeline();

        db.session.activeRoomChannel = targetedSession;
        UI.liveClassroomHeaderTitle.innerText = targetedSession.title;
        UI.liveClassroomHeaderSubject.innerText = `${targetedSession.subject} — Hosted by ${targetedSession.hostName}`;

        // Initialize display frame state shifts
        UI.liveFeedCameraPlaceholder.classList.add('hidden');
        UI.liveVideoSimulatedMatrix.classList.replace('hidden', 'flex');
        UI.liveSimBadgeIdentity.innerText = `${db.session.currentUser.name} (${db.session.currentUser.role.toUpperCase()})`;

        // Start Clock Cycles Counter
        db.session.liveElapsedSeconds = 0;
        UI.liveSimTimerClock.innerText = "00:00:00";
        db.session.liveTimerRef = setInterval(() => {
            db.session.liveElapsedSeconds++;
            const hours = Math.floor(db.session.liveElapsedSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((db.session.liveElapsedSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = (db.session.liveElapsedSeconds % 60).toString().padStart(2, '0');
            UI.liveSimTimerClock.innerText = `${hours}:${minutes}:${seconds}`;
        }, 1000);

        // Render Simulated Peripheral Array Stack Members
        renderSimulatedRosterStack();
        navigateToTab("live");
        createToast(`Tunnel attached to stream pipeline: ${token}`);
    }

    function disconnectActiveChannelPipeline() {
        if (db.session.liveTimerRef) {
            clearInterval(db.session.liveTimerRef);
            db.session.liveTimerRef = null;
        }
        
        if (db.session.isRecording) {
            toggleSimulatedRecordingPipeline();
        }

        db.session.activeRoomChannel = null;
        UI.liveClassroomHeaderTitle.innerText = "No Active Class Channel Joined";
        UI.liveClassroomHeaderSubject.innerText = "Initialize or attach validation room keys from the scheduler workspace.";
        
        UI.liveVideoSimulatedMatrix.classList.replace('flex', 'hidden');
        UI.liveFeedCameraPlaceholder.classList.remove('hidden');
        UI.liveRosterFeedStack.innerHTML = "";
        UI.liveRosterCountVal.innerText = "0";
    }

    function renderSimulatedRosterStack() {
        if (!db.session.activeRoomChannel) return;
        UI.liveRosterFeedStack.innerHTML = "";

        const dynamicRosterArray = [
            { name: db.session.currentUser.name, role: db.session.currentUser.role, avatar: db.session.currentUser.avatar }
        ];

        if (db.session.currentUser.role !== "host") {
            dynamicRosterArray.push({ name: "Sir Mean Host", role: "host", avatar: "SM" });
        }
        
        // Add supplementary dummy matrix students for operational realism
        dynamicRosterArray.push({ name: "Aliyu Kano Analyst", role: "student", avatar: "AK" });
        dynamicRosterArray.push({ name: "Fatima Stat Lab", role: "student", avatar: "FS" });

        UI.liveRosterCountVal.innerText = dynamicRosterArray.length;

        dynamicRosterArray.forEach(u => {
            const userRow = document.createElement('div');
            userRow.className = "flex items-center justify-between p-2.5 bg-[#07040f]/40 border border-purple-900/10 rounded-xl";
            userRow.innerHTML = `
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/30 flex items-center justify-center font-bold text-[10px] text-purple-300">${u.avatar}</div>
                    <span class="text-xs font-semibold text-white truncate">${u.name}</span>
                </div>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded ${u.role === 'host' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' : 'bg-purple-950/40 text-[#a78bfa]'} uppercase tracking-wide">${u.role}</span>
            `;
            UI.liveRosterFeedStack.appendChild(userRow);
        });
    }

    UI.liveDirectAttachBtn.addEventListener('click', () => {
        const inputToken = UI.liveDirectJoinCodeInput.value.trim();
        if (!inputToken) {
            createToast("Input channel validation key can not be empty.", "error");
            return;
        }
        attachStreamChannelPipeline(inputToken);
        UI.liveDirectJoinCodeInput.value = "";
    });

    UI.ctrlDisconnectRoom.addEventListener('click', () => {
        if (!db.session.activeRoomChannel) return;
        disconnectActiveChannelPipeline();
        createToast("Pipeline disconnected cleanly.");
    });

    function toggleSimulatedRecordingPipeline() {
        if (!db.session.activeRoomChannel) {
            createToast("No active tracking channel verified to apply recording commands.", "error");
            return;
        }

        db.session.isRecording = !db.session.isRecording;
        if (db.session.isRecording) {
            UI.ctrlRecordToggle.className = "px-4 h-10 rounded-xl bg-red-600 border border-red-500 text-white text-xs font-bold flex items-center gap-2 animate-pulse transition-all";
            UI.ctrlRecordToggle.innerHTML = `<i class="fa-solid fa-stop"></i> Cease Recording Node`;
            createToast("Local system video stream buffer execution capturing activated.", "info");
        } else {
            UI.ctrlRecordToggle.className = "px-4 h-10 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-bold flex items-center gap-2 hover:bg-red-950/50 transition-all";
            UI.ctrlRecordToggle.innerHTML = `<i class="fa-solid fa-circle"></i> Init Record Node`;
            createToast("Capture stream compiled, finalized, and saved to simulated logs ledger cluster.");
        }
    }
    UI.ctrlRecordToggle.addEventListener('click', toggleSimulatedRecordingPipeline);

    // Simple visual interaction alerts for passive UI peripheral toggles
    [UI.ctrlMicToggle, UI.ctrlCamToggle, UI.ctrlScreenToggle].forEach(btn => {
        btn.addEventListener('click', () => {
            if (!db.session.activeRoomChannel) return;
            btn.classList.toggle('bg-purple-600/20');
            btn.classList.toggle('bg-purple-600');
            btn.classList.toggle('text-white');
            createToast("Peripheral micro-state execution array changed.");
        });
    });

    // ==========================================
    // 🎨 WHITEBOARD DRAWING ENGINE MODULE
    // ==========================================
    let canvasContext = null;
    let drawingStateActive = false;
    let selectedBoardTool = "pen"; // "pen" | "eraser"
    let selectedBoardColor = "#a78bfa";

    function initializeCanvasWorkspaceRules() {
        const canvas = UI.whiteboardCanvas;
        const container = canvas.parentElement;
        
        // Match canvas logical dimension ratios structurally to bounding boxes
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        canvasContext = canvas.getContext('2d');
        resetWhiteboardCanvasGridStructure();

        // Attach absolute event capture nodes
        canvas.addEventListener('mousedown', startDrawingProcess);
        canvas.addEventListener('mousemove', computeDrawingCoordinatesStroke);
        canvas.addEventListener('mouseup', stopDrawingProcess);
        canvas.addEventListener('mouseleave', stopDrawingProcess);

        canvas.addEventListener('touchstart', (e) => { startDrawingProcess(e.touches[0]); }, { passive: true });
        canvas.addEventListener('touchmove', (e) => { computeDrawingCoordinatesStroke(e.touches[0]); }, { passive: true });
        canvas.addEventListener('touchend', stopDrawingProcess);
    }

    function resetWhiteboardCanvasGridStructure() {
        if (!canvasContext) return;
        const canvas = UI.whiteboardCanvas;
        
        canvasContext.fillStyle = "#0f0a1e";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw analytical engineering guidance grid intersection coordinates
        canvasContext.strokeStyle = "rgba(124, 58, 237, 0.05)";
        canvasContext.lineWidth = 1;
        
        const coordinateStep = 40;
        for (let x = 0; x < canvas.width; x += coordinateStep) {
            canvasContext.beginPath(); canvasContext.moveTo(x, 0); canvasContext.lineTo(x, canvas.height); canvasContext.stroke();
        }
        for (let y = 0; y < canvas.height; y += coordinateStep) {
            canvasContext.beginPath(); canvasContext.moveTo(0, y); canvasContext.lineTo(canvas.width, y); canvasContext.stroke();
        }
    }

    function startDrawingProcess(e) {
        drawingStateActive = true;
        if (!canvasContext) return;
        const bounds = UI.whiteboardCanvas.getBoundingClientRect();
        canvasContext.beginPath();
        canvasContext.moveTo(e.clientX - bounds.left, e.clientY - bounds.top);
    }

    function computeDrawingCoordinatesStroke(e) {
        if (!drawingStateActive || !canvasContext) return;
        const bounds = UI.whiteboardCanvas.getBoundingClientRect();
        const computedX = e.clientX - bounds.left;
        const computedY = e.clientY - bounds.top;

        if (selectedBoardTool === "eraser") {
            canvasContext.fillStyle = "#0f0a1e";
            canvasContext.fillRect(computedX - 15, computedY - 15, 30, 30);
        } else {
            canvasContext.lineTo(computedX, computedY);
            canvasContext.strokeStyle = selectedBoardColor;
            canvasContext.lineWidth = 2.5;
            canvasContext.lineCap = "round";
            canvasContext.lineJoin = "round";
            canvasContext.stroke();
        }
    }

    function stopDrawingProcess() { drawingStateActive = false; }

    UI.wbClearBtn.addEventListener('click', () => {
        resetWhiteboardCanvasGridStructure();
        createToast("Workspace canvas memory metrics completely cleared.");
    });

    // Populate Dynamic Color Tooling Dock UI Matrix
    const swatchColors = ["#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#ffffff"];
    UI.wbColorPaletteStack.innerHTML = "";
    swatchColors.forEach((color, i) => {
        const colorBtn = document.createElement('button');
        colorBtn.className = `w-6 h-6 rounded-md transition-all border ${i === 0 ? 'border-white scale-110' : 'border-transparent'}`;
        colorBtn.style.backgroundColor = color;
        colorBtn.setAttribute('data-color-hex', color);
        
        colorBtn.addEventListener('click', (e) => {
            selectedBoardTool = "pen";
            selectedBoardColor = color;
            document.querySelectorAll('#wb-color-palette-stack button').forEach(b => b.className = "w-6 h-6 rounded-md transition-all border border-transparent");
            document.querySelectorAll('[data-tool]').forEach(b => b.className = "wb-tool-btn w-8 h-8 rounded-lg bg-transparent text-[#7a6a9a] flex items-center justify-center text-xs");
            
            document.querySelector('[data-tool="pen"]').className = "wb-tool-btn w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shadow";
            e.currentTarget.className = "w-6 h-6 rounded-md transition-all border border-white scale-110";
        });
        UI.wbColorPaletteStack.appendChild(colorBtn);
    });

    document.querySelectorAll('[data-tool]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedBoardTool = btn.getAttribute('data-tool');
            document.querySelectorAll('[data-tool]').forEach(b => b.className = "wb-tool-btn w-8 h-8 rounded-lg bg-transparent text-[#7a6a9a] flex items-center justify-center text-xs");
            e.currentTarget.className = "wb-tool-btn w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs shadow";
        });
    });

    // ==========================================
    // 🧬 LATEX MATHEMATICAL DISCIPLINE COMPILER
    // ==========================================
    const equationMacros = {
        mean: "\\bar{X} = \\frac{1}{n} \\sum_{i=1}^{n} X_i",
        variance: "\\sigma^2 = \\frac{\\sum (X_i - \\mu)^2}{N}",
        quadratic: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
        normal: "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}"
    };

    function processInlineTextLatexParsing(rawText) {
        if (!rawText) {
            UI.latexRenderedViewport.innerHTML = `<span class="text-xs text-[#6b5a8a] italic">Waiting for string sequence inputs...</span>`;
            return;
        }

        // Clean text escape layout rules natively
        let structuredResult = rawText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Simple Regex matcher translation replacement for preview virtualization strings
        const inlineFormulaRegex = /\$([^$]+)\$/g;
        structuredResult = structuredResult.replace(inlineFormulaRegex, (match, formula) => {
            return `<span class="font-serif italic text-[#a78bfa] text-lg bg-purple-950/30 px-2 py-0.5 rounded border border-purple-900/20 mx-0.5">${formula}</span>`;
        });

        UI.latexRenderedViewport.innerHTML = `<div class="text-left w-full whitespace-pre-wrap leading-relaxed text-sm">${structuredResult}</div>`;
    }

    UI.latexStringInputBuffer.addEventListener('input', (e) => {
        processInlineTextLatexParsing(e.target.value);
    });

    document.querySelectorAll('[data-macro]').forEach(btn => {
        btn.addEventListener('click', () => {
            const macroToken = btn.getAttribute('data-macro');
            const formulaString = equationMacros[macroToken];
            
            const currentCursorPosition = UI.latexStringInputBuffer.selectionStart;
            const contextBuffer = UI.latexStringInputBuffer.value;
            
            UI.latexStringInputBuffer.value = contextBuffer.slice(0, currentCursorPosition) + ` $${formulaString}$ ` + contextBuffer.slice(UI.latexStringInputBuffer.selectionEnd);
            UI.latexStringInputBuffer.focus();
            
            processInlineTextLatexParsing(UI.latexStringInputBuffer.value);
        });
    });

    // Set Default Sample Initialization Macro Content Frame Strings
    UI.latexStringInputBuffer.value = "Let the probability density function for a normal model parameter match standard values:\n$f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$\n\nWhere the sample mean tracking sequence is extracted directly via formula:\n$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$";
    processInlineTextLatexParsing(UI.whiteboardCanvas ? UI.latexStringInputBuffer.value : "");
});
