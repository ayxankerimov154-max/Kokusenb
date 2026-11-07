import React, { useState, useEffect } from 'react';
import {
  FolderUp,
  Mail,
  Send,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  RefreshCw,
  LogOut,
  Sparkles,
  FileText,
  Clock,
  Shield,
  Search,
  HardDrive,
  Flame,
  Cloud,
  FileSpreadsheet,
  FilePlus,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth
} from '../services/googleAuth';
import {
  listDriveFiles,
  uploadStrategyToDrive,
  createDriveFolder,
  deleteDriveFile,
  DriveFileItem
} from '../services/driveService';
import {
  sendStrategyDigestEmail,
  listRecentGmailMessages,
  getGmailProfile,
  GmailMessageSummary,
  GmailProfile
} from '../services/gmailService';
import {
  createStrategyGuideDoc,
  listUserGoogleDocs,
  GoogleDocItem
} from '../services/docsService';
import {
  syncStrategyToFirestore,
  subscribeToCloudStrategies,
  deleteCloudStrategy,
  testFirestoreConnection,
  syncUserProfile
} from '../services/firebase';
import { BotMemory } from '../types/simulator';

interface GoogleWorkspacePanelProps {
  memories: BotMemory[];
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({ memories }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'docs' | 'drive' | 'gmail' | 'firebase'>('docs');

  // Status banners
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Docs state
  const [googleDocsList, setGoogleDocsList] = useState<Array<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }>>([]);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [lastCreatedDoc, setLastCreatedDoc] = useState<GoogleDocItem | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveSearch, setDriveSearch] = useState('');

  // Gmail state
  const [gmailProfile, setGmailProfile] = useState<GmailProfile | null>(null);
  const [recentMessages, setRecentMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('[TechnovisAze] Autonomous Gaming Strategy Brief');
  const [selectedGamesForEmail, setSelectedGamesForEmail] = useState<string[]>([
    'PUBG Mobile',
    'Roblox',
    'Minecraft'
  ]);

  // Firebase Firestore state
  const [cloudStrategies, setCloudStrategies] = useState<any[]>([]);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean | null>(null);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState(false);

  // Confirmation Modal state for destructive/mutating actions
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    testFirestoreConnection().then(connected => setIsFirestoreConnected(connected));

    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        if (currentUser.email && !recipientEmail) {
          setRecipientEmail(currentUser.email);
        }
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch data depending on active tab
  useEffect(() => {
    if (token) {
      if (activeSubTab === 'docs') fetchDocsData();
      else if (activeSubTab === 'drive') fetchDriveFiles();
      else if (activeSubTab === 'gmail') fetchGmailData();
    }
  }, [token, activeSubTab]);

  // Subscribe to cloud Firestore strategies if user is authenticated
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToCloudStrategies(
        items => setCloudStrategies(items),
        err => console.warn('Firestore subscription error:', err)
      );
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        if (result.user.email) {
          setRecipientEmail(result.user.email);
        }
        await syncUserProfile(30);
        showStatus('Successfully authenticated with Google Workspace & Firebase!', 'success');
      }
    } catch (err: any) {
      showStatus(err?.message || 'Sign in failed', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
    setRecentMessages([]);
    setGmailProfile(null);
    setGoogleDocsList([]);
    showStatus('Signed out from Google Workspace', 'info');
  };

  const showStatus = (msg: string, type: 'success' | 'error' | 'info') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  // ---------------- GOOGLE DOCS OPERATIONS ----------------
  const fetchDocsData = async () => {
    if (!token) return;
    setIsLoadingDocs(true);
    try {
      const docs = await listUserGoogleDocs(token);
      setGoogleDocsList(docs);
    } catch (err: any) {
      showStatus(`Google Docs error: ${err.message}`, 'error');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleCreateStrategyDoc = async () => {
    if (!token) return;
    setIsCreatingDoc(true);
    try {
      const docTitle = `TechnovisAze Gaming Intelligence Dossier (${new Date().toLocaleDateString()})`;
      const created = await createStrategyGuideDoc(token, docTitle, memories);
      setLastCreatedDoc(created);
      showStatus(`Google Doc successfully generated: "${created.title}"!`, 'success');
      fetchDocsData();
    } catch (err: any) {
      showStatus(`Failed to create Google Doc: ${err.message}`, 'error');
    } finally {
      setIsCreatingDoc(false);
    }
  };

  // ---------------- DRIVE OPERATIONS ----------------
  const fetchDriveFiles = async () => {
    if (!token) return;
    setIsLoadingDrive(true);
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      showStatus(`Drive error: ${err.message}`, 'error');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!token) return;
    try {
      const fileName = `TechnovisAze-BotMemory-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      const content = JSON.stringify(memories, null, 2);
      const uploaded = await uploadStrategyToDrive(token, fileName, content);
      showStatus(`Backup created in Google Drive: "${uploaded.name}"`, 'success');
      fetchDriveFiles();
    } catch (err: any) {
      showStatus(`Upload failed: ${err.message}`, 'error');
    }
  };

  const handleCreateFolder = async () => {
    if (!token) return;
    try {
      const folder = await createDriveFolder(token, 'TechnovisAze Game Strategies');
      showStatus(`Created folder "${folder.name}" in Google Drive`, 'success');
      fetchDriveFiles();
    } catch (err: any) {
      showStatus(`Folder creation failed: ${err.message}`, 'error');
    }
  };

  const requestDeleteFile = (file: DriveFileItem) => {
    setConfirmTitle(`Delete "${file.name}" from Google Drive?`);
    setConfirmDescription(
      'This will remove the file from your Google Drive account. This action cannot be undone without checking Drive trash.'
    );
    setConfirmAction(() => async () => {
      if (!token) return;
      try {
        await deleteDriveFile(token, file.id);
        showStatus(`Deleted "${file.name}" from Google Drive`, 'success');
        fetchDriveFiles();
      } catch (err: any) {
        showStatus(`Deletion failed: ${err.message}`, 'error');
      }
    });
    setConfirmModalOpen(true);
  };

  // ---------------- GMAIL OPERATIONS ----------------
  const fetchGmailData = async () => {
    if (!token) return;
    setIsLoadingGmail(true);
    try {
      const [profile, messages] = await Promise.all([
        getGmailProfile(token).catch(() => null),
        listRecentGmailMessages(token, 8).catch(() => [])
      ]);
      setGmailProfile(profile);
      setRecentMessages(messages);
    } catch (err: any) {
      showStatus(`Gmail error: ${err.message}`, 'error');
    } finally {
      setIsLoadingGmail(false);
    }
  };

  const requestSendEmail = () => {
    if (!recipientEmail) {
      showStatus('Please specify a recipient email address', 'error');
      return;
    }

    setConfirmTitle(`Send Strategy Brief via Gmail to ${recipientEmail}?`);
    setConfirmDescription(
      `This will use your authenticated Gmail account to send an automated briefing containing synthesized strategies for: ${selectedGamesForEmail.join(', ')}.`
    );
    setConfirmAction(() => async () => {
      if (!token) return;
      try {
        const relevantMemories = memories.filter(m => selectedGamesForEmail.includes(m.gameName));
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b;">
            <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0;">TechnovisAze Learning Bot</h2>
              <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Autonomous Game Strategy Intelligence Digest</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; background: #fafafa;">
              <p>Hello Gamer / Teammate,</p>
              <p>Here is your automated gaming intelligence digest synthesized by <strong>TechnovisAze Learning Bot</strong>:</p>
              ${relevantMemories
                .map(
                  m => `
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 14px;">
                  <h3 style="margin: 0 0 6px 0; color: #4338ca;">${m.gameName} <span style="font-size: 12px; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px;">${m.gameVersion || 'Latest Meta'}</span></h3>
                  <div style="font-weight: bold; font-size: 13px; color: #0284c7; margin-bottom: 6px;">${m.strategyCategory}</div>
                  <p style="font-size: 13px; line-height: 1.5; color: #334155;">${m.insightContent}</p>
                  <ul style="font-size: 12px; color: #1e293b; padding-left: 20px;">
                    ${m.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
                  </ul>
                  <div style="font-size: 11px; color: #64748b; margin-top: 8px;">Confidence: ${Math.round(m.confidenceScore * 100)}% · Timestamp: ${new Date(m.timestampLearned || m.timestamp).toLocaleString()}</div>
                </div>
              `
                )
                .join('')}
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
                Generated by TechnovisAze Learning Bot running in the background. Zero frame drop guarantee.
              </p>
            </div>
          </div>
        `;

        await sendStrategyDigestEmail(token, recipientEmail, emailSubject, htmlBody);
        showStatus(`Strategy brief successfully sent to ${recipientEmail}!`, 'success');
        fetchGmailData();
      } catch (err: any) {
        showStatus(`Failed to send email: ${err.message}`, 'error');
      }
    });
    setConfirmModalOpen(true);
  };

  // ---------------- FIRESTORE OPERATIONS ----------------
  const handleSyncToFirestore = async () => {
    if (!user) {
      showStatus('Please sign in with Google to sync with Firebase Firestore', 'error');
      return;
    }
    setIsSyncingFirestore(true);
    try {
      let count = 0;
      for (const memory of memories) {
        await syncStrategyToFirestore(memory);
        count++;
      }
      showStatus(`Synchronized ${count} strategies to Firebase Firestore (europe-west2)!`, 'success');
    } catch (err: any) {
      showStatus(`Firestore sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  const requestDeleteCloudStrategy = (item: any) => {
    setConfirmTitle(`Delete cloud strategy for ${item.gameName}?`);
    setConfirmDescription(
      'This will remove this record permanently from your Firebase Firestore cloud database.'
    );
    setConfirmAction(() => async () => {
      try {
        await deleteCloudStrategy(item.id);
        showStatus(`Deleted cloud strategy from Firestore`, 'success');
      } catch (err: any) {
        showStatus(`Failed to delete from Firestore: ${err.message}`, 'error');
      }
    });
    setConfirmModalOpen(true);
  };

  const filteredDriveFiles = driveFiles.filter(f =>
    f.name.toLowerCase().includes(driveSearch.toLowerCase())
  );

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[780px]">
      
      {/* Top Header & Auth State */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-amber-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">Google Workspace & Firebase Hub</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Docs · Drive · Gmail · Firestore
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate Google Docs guides, backup to Drive, dispatch Gmail digests, & sync to Firestore
            </p>
          </div>
        </div>

        {/* User Auth Info / Official Sign in button */}
        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 pl-3 rounded-2xl">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-slate-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px]">
                  {user.displayName || user.email}
                </span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-2.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`px-4 py-2.5 text-xs flex items-center justify-between border-b ${
            statusType === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : statusType === 'error'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusType === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : statusType === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* 4-way Subtab Switcher: Docs vs Drive vs Gmail vs Firebase */}
      <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-800 bg-slate-900/40 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setActiveSubTab('docs')}
            className={`pb-2.5 px-3 font-semibold text-xs flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'docs'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Google Docs Studio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('drive')}
            className={`pb-2.5 px-3 font-semibold text-xs flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'drive'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive Files ({driveFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('gmail')}
            className={`pb-2.5 px-3 font-semibold text-xs flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'gmail'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Gmail Strategy Dispatcher</span>
          </button>

          <button
            onClick={() => setActiveSubTab('firebase')}
            className={`pb-2.5 px-3 font-semibold text-xs flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeSubTab === 'firebase'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Firebase Firestore ({cloudStrategies.length})</span>
          </button>

        </div>

        {token && (
          <button
            onClick={() => {
              if (activeSubTab === 'docs') fetchDocsData();
              else if (activeSubTab === 'drive') fetchDriveFiles();
              else if (activeSubTab === 'gmail') fetchGmailData();
            }}
            title="Refresh Data"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs || isLoadingDrive || isLoadingGmail ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {!token ? (
          <div className="p-8 text-center rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Google Workspace Access Required</h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                Connect your Google account to create Google Docs strategy dossiers, backup to Google Drive,
                dispatch tactical briefings via Gmail, and sync with Firebase Firestore.
              </p>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/50 transition-all"
            >
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in to Google Workspace & Firebase'}</span>
            </button>
          </div>
        ) : (
          <>
            {/* SUB-VIEW 1: GOOGLE DOCS STUDIO */}
            {activeSubTab === 'docs' && (
              <div className="space-y-5">
                
                {/* Hero Action Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-semibold uppercase">
                      <FileText className="w-4 h-4" />
                      <span>Google Docs API v1 Integration</span>
                    </div>
                    <h4 className="text-lg font-bold text-white">
                      Generate Google Docs Tactical Dossier
                    </h4>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                      Compiles all synthesized strategies for PUBG Mobile, Roblox, and Minecraft into a clean,
                      formatted Google Doc in your Google Drive with tactical headings, takeaways, and timestamps.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateStrategyDoc}
                    disabled={isCreatingDoc}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-950/50 transition-all shrink-0 disabled:opacity-50"
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>{isCreatingDoc ? 'Creating Doc...' : 'Create Google Doc Dossier'}</span>
                  </button>
                </div>

                {/* Last Created Doc Link Callout */}
                {lastCreatedDoc && (
                  <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-200">
                        Document created: <strong>{lastCreatedDoc.title}</strong>
                      </span>
                    </div>
                    {lastCreatedDoc.webViewLink && (
                      <a
                        href={lastCreatedDoc.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <span>Open in Google Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Google Docs List */}
                <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Your Google Docs in Drive
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {googleDocsList.length} documents found
                    </span>
                  </div>

                  {isLoadingDocs ? (
                    <div className="text-center py-10 text-xs text-slate-500 animate-pulse">
                      Loading Google Docs...
                    </div>
                  ) : googleDocsList.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No Google Docs found. Click "Create Google Doc Dossier" above to generate your first strategy guide!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 font-mono text-xs">
                      {googleDocsList.map(docItem => (
                        <div
                          key={docItem.id}
                          className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-900/60 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-blue-400 text-base">📄</span>
                            <div className="truncate">
                              <span className="font-medium text-slate-200 block truncate text-xs font-sans">
                                {docItem.name}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {docItem.modifiedTime ? new Date(docItem.modifiedTime).toLocaleDateString() : 'Recent'} · Google Doc
                              </span>
                            </div>
                          </div>

                          <a
                            href={docItem.webViewLink || `https://docs.google.com/document/d/${docItem.id}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 px-3 rounded-lg text-blue-300 hover:text-white bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/50 transition-colors flex items-center gap-1.5 text-[11px]"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUB-VIEW 2: GOOGLE DRIVE STUDIO */}
            {activeSubTab === 'drive' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={handleBackupToDrive}
                    className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 text-left transition-all group flex items-start gap-3"
                  >
                    <FolderUp className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold text-xs block text-amber-300">
                        Backup Strategies to Drive
                      </span>
                      <span className="text-[11px] text-amber-200/70">
                        Uploads all {memories.length} Room DB entities as a JSON report
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleCreateFolder}
                    className="p-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-left transition-all group flex items-start gap-3"
                  >
                    <FolderPlus className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold text-xs block text-indigo-300">
                        Create Strategy Folder
                      </span>
                      <span className="text-[11px] text-indigo-200/70">
                        Creates "TechnovisAze Game Strategies" in root Drive
                      </span>
                    </div>
                  </button>

                  <div className="relative flex items-center sm:col-span-2 lg:col-span-1">
                    <Search className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search Drive files..."
                      value={driveSearch}
                      onChange={e => setDriveSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-amber-400" />
                      Google Drive Files
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {filteredDriveFiles.length} files found
                    </span>
                  </div>

                  {isLoadingDrive ? (
                    <div className="text-center py-10 text-xs text-slate-500 animate-pulse">
                      Querying Google Drive files...
                    </div>
                  ) : filteredDriveFiles.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">
                      No files matching "{driveSearch}".
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60 font-mono text-xs">
                      {filteredDriveFiles.map(file => {
                        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                        return (
                          <div
                            key={file.id}
                            className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-900/60 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-amber-400 text-base">
                                {isFolder ? '📁' : '📄'}
                              </span>
                              <div className="truncate">
                                <span className="font-medium text-slate-200 block truncate text-xs font-sans">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Recent'} · {file.mimeType.split('.').pop()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                                  title="Open in Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => requestDeleteFile(file)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                title="Delete from Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: GMAIL STRATEGY DISPATCHER */}
            {activeSubTab === 'gmail' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-indigo-400" />
                      Dispatch Strategy Brief via Gmail
                    </h4>
                    {gmailProfile && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Inbox: {gmailProfile.messagesTotal} messages
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Recipient Email Address:
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="teammate@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Subject Line:
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Select Games to Include in Brief:
                      </label>
                      <div className="flex items-center gap-2">
                        {['PUBG Mobile', 'Roblox', 'Minecraft'].map(game => {
                          const isSelected = selectedGamesForEmail.includes(game);
                          return (
                            <button
                              key={game}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedGamesForEmail(selectedGamesForEmail.filter(g => g !== game));
                                } else {
                                  setSelectedGamesForEmail([...selectedGamesForEmail, game]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400'
                              }`}
                            >
                              {game}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={requestSendEmail}
                        disabled={selectedGamesForEmail.length === 0}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950/40 disabled:opacity-50"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send Strategy Digest via Gmail</span>
                      </button>
                      <p className="text-[10px] text-slate-500 text-center mt-1.5">
                        *An explicit confirmation dialog will prompt you before dispatching.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      Recent Gmail Messages
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {recentMessages.length} retrieved
                    </span>
                  </div>

                  {isLoadingGmail ? (
                    <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
                      Fetching Gmail messages...
                    </div>
                  ) : recentMessages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No recent messages retrieved from Gmail inbox.
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs">
                      {recentMessages.map(msg => (
                        <div
                          key={msg.id}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                            <span className="truncate max-w-[140px] text-indigo-300 font-sans font-semibold">
                              {msg.from}
                            </span>
                            <span>{msg.date ? new Date(msg.date).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="font-semibold text-slate-200 text-xs truncate">
                            {msg.subject || 'No Subject'}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {msg.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: FIREBASE FIRESTORE CLOUD SYNC */}
            {activeSubTab === 'firebase' && (
              <div className="space-y-5">
                <div className="p-5 rounded-3xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-rose-500" />
                      <h4 className="font-bold text-sm text-white">Firebase Cloud Firestore</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        europe-west2
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Persist autonomous strategies to Cloud Firestore for cross-device multi-client synchronization
                      alongside local Room DB storage.
                    </p>
                  </div>

                  <button
                    onClick={handleSyncToFirestore}
                    disabled={isSyncingFirestore}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-rose-950/40 transition-all shrink-0 disabled:opacity-50"
                  >
                    <Cloud className="w-4 h-4" />
                    <span>{isSyncingFirestore ? 'Syncing...' : 'Sync Room DB to Firestore'}</span>
                  </button>
                </div>

                {/* Cloud Strategies List */}
                <div className="p-4 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <Database className="w-4 h-4 text-rose-400" />
                      Synchronized Cloud Strategies (collection: bot_strategies)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {cloudStrategies.length} documents live in Firestore
                    </span>
                  </div>

                  {cloudStrategies.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500 space-y-2">
                      <p>No strategies synchronized to Firestore cloud yet.</p>
                      <button
                        onClick={handleSyncToFirestore}
                        className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-rose-300 font-medium text-xs inline-flex items-center gap-1.5"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Sync Current {memories.length} Strategies</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {cloudStrategies.map(strat => (
                        <div
                          key={strat.id}
                          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-indigo-300 text-xs">{strat.gameName}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                                {strat.gameVersion}
                              </span>
                            </div>
                            <button
                              onClick={() => requestDeleteCloudStrategy(strat)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Delete from Firestore"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="font-semibold text-cyan-300 text-[11px]">
                            {strat.strategyCategory}
                          </div>

                          <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">
                            {strat.insightContent}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                            <span>Confidence: {Math.round((strat.confidenceScore || 0.95) * 100)}%</span>
                            <span>Firestore docId: {strat.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}

      </div>

      {/* Mandatory Destructive Action Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-bold text-sm text-white">{confirmTitle}</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {confirmDescription}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setConfirmModalOpen(false);
                  if (confirmAction) {
                    await confirmAction();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Confirm & Proceed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
