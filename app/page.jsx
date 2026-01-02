"use client";

import { useState, useEffect } from "react";
import { days } from "../data/days";
import supabase, { isSupabaseConfigured } from "../lib/supabaseClient";

// default SVG avatar (simple person icon)
const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='none' stroke='%236B3E26' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'>
  <circle cx='12' cy='8' r='3' fill='%23EDEDED' />
  <path d='M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6' fill='%23EDEDED' />
</svg>
`)}`;

// Streak Intro Screen
function StreakIntro({ streak, onContinue, longest }) {
  // show longest will be passed in later
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div style={{
      position:"fixed",
      top:0,
      left:0,
      width:"100%",
      height:"100%",
      backgroundColor:"#FBF7F2",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      zIndex:9999,
      transition:"opacity 0.5s ease",
      opacity: animate ? 1 : 0
    }}>
      <div style={{
        transform: animate ? "scale(1)" : "scale(0.5)",
        opacity: animate ? 1 : 0,
        transition:"all 1s ease",
        textAlign:"center"
      }}>
        <h1 style={{ fontSize:48, color:"#6B3E26", marginBottom:20 }}>🔥 Your Current Streak 🔥</h1>
        <p style={{ fontSize:36, color:"#8A6A52", marginBottom:8 }}>{streak} {streak === 1 ? "day" : "days"}</p>
        <p style={{ fontSize:14, color:"#8A6A52", marginBottom:40 }}>Longest: <strong style={{color:"#6B3E26"}}>{longest ?? "—"}</strong></p>
        <button 
          onClick={onContinue} 
          style={{
            padding:"12px 24px",
            fontSize:20,
            borderRadius:10,
            border:"none",
            backgroundColor:"#6B3E26",
            color:"#FBF7F2",
            cursor:"pointer",
            transition:"transform 0.2s ease",
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [currentDay, setCurrentDay] = useState(1);
  const [dayOpacity, setDayOpacity] = useState(1); 
  const [jumpDay, setJumpDay] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [journal, setJournal] = useState("");
  const [otNote, setOtNote] = useState("");
  const [ntNote, setNtNote] = useState("");
  const [completedDays, setCompletedDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [badgeSpinning, setBadgeSpinning] = useState(false);
  const [longestStreak, setLongestStreak] = useState(0);
  const [colorScheme, setColorScheme] = useState("warm");
  // Profile / Auth states
  const [currentUser, setCurrentUser] = useState(null); // stores email
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDesc, setProfileDesc] = useState("");
  const [favVerse, setFavVerse] = useState("");
  const [profileAvatar, setProfileAvatar] = useState(DEFAULT_AVATAR);
  const [darkMode, setDarkMode] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [modalFollowerCount, setModalFollowerCount] = useState(0);
  const [modalFollowingCount, setModalFollowingCount] = useState(0);
  const [modalCountsLoading, setModalCountsLoading] = useState(false);
  // Consent / policies
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [tosChecked, setTosChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [agreedAll, setAgreedAll] = useState(false);
  const checkboxStyle = { width:18, height:18, accentColor:'#000', border:'2px solid #000', verticalAlign:'middle', marginRight:8 };
  const [consentTosAt, setConsentTosAt] = useState(null);
  const [consentPrivacyAt, setConsentPrivacyAt] = useState(null);
  const [showPolicyViewer, setShowPolicyViewer] = useState(false);
  const [policyToView, setPolicyToView] = useState('privacy'); // 'privacy' | 'tos'

  const PRIVACY_POLICY_TEXT = `Privacy Policy
Bible in a Year
Effective Date: [01/01/2027}
1. Introduction
Bible in a Year (“we,” “our,” or “the App”) respects your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our mobile application.
This app is free and will never request payment or financial information.

2. Information We Collect
a. Information You Provide
When you create an account, we may collect:
Email address (used for authentication)


Username and display name


Profile photo (optional)


Reading progress and streaks


Profile visibility preference (public or private)


b. Automatically Collected Information
We may collect limited technical information such as:
Device type


App usage data (for stability and performance)


Authentication identifiers


We do not collect precise location data.

3. Public vs Private Profiles
During account setup, you choose whether your profile is public or private.
Public Profiles
If you choose a public profile, other users may see:
Username


Display name


Profile photo


Reading streaks or achievements (if enabled)

Private Profiles
If your profile is private:
Your profile is not visible to other users


Your reading activity is kept private


You may change this setting at any time.

4. Following Other Users
If you enable social features:
You may follow or unfollow other users


Other users may see that you follow them (if profiles are public)


You may block users at any time


We do not provide messaging features at this time.

5. How We Use Your Information
We use your information to:
Provide and maintain app functionality


Track Bible reading progress and streaks


Enable optional social features


Improve app performance and reliability


Ensure app security


We do not sell your data.

6. Data Storage & Security
We use secure third-party services (such as Supabase) to store and protect user data.
Reasonable safeguards are in place to protect your information, but no system is 100% secure.

7. Data Sharing
We do not sell or rent your personal data.
Your data is only shared:
When you choose to make profile information public


With service providers necessary to operate the app


If required by law



8. Account Deletion
You may delete your account at any time.
When you delete your account:
Your profile is permanently removed


Your reading data and social connections are deleted


Your data cannot be recovered



9. Children’s Privacy
Bible in a Year is intended for users 13 years of age or older.
We do not knowingly collect personal data from children under 13.
 If you believe a child has provided personal information, please contact us.

10. Changes to This Policy
We may update this Privacy Policy from time to time.
 Changes will be posted in the app or on our website.
`;

  const TOS_TEXT = `📜 Terms of Service
Bible in a Year
Effective Date: [Insert date]

1. Acceptance of Terms
By using Bible in a Year, you agree to these Terms of Service.
 If you do not agree, please do not use the app.

2. Free App Notice
Bible in a Year is:
Free


No subscriptions


No payments


No purchases


We will never ask for payment or financial information.

3. User Accounts
To use certain features, you must create an account.
You agree to:
Provide accurate information


Keep your account secure


Be responsible for activity under your account



4. Acceptable Use
You agree not to:
Harass, threaten, or abuse other users


Impersonate another person


Attempt to access accounts you do not own


Use the app for unlawful purposes


We reserve the right to suspend or terminate accounts that violate these rules.

5. User Content
You are responsible for any content you choose to share publicly.
We do not claim ownership over your profile content, but you grant us permission to display it as part of the app.

6. Community Conduct
Bible in a Year is intended to be a respectful and encouraging environment.
We may remove content or restrict accounts that:
Promote hate or harassment


Disrupt the community


Violate these Terms



7. Religious Disclaimer
Bible in a Year provides religious and devotional content for spiritual encouragement only.
The app:
Is not professional counseling


Is not medical or mental health advice


Should not replace professional guidance



8. Termination
You may stop using the app at any time.
We may suspend or terminate access if:
These Terms are violated


Required by law


Necessary to protect users or the platform



9. Limitation of Liability
Bible in a Year is provided “as is.”
We are not liable for:
Data loss


App interruptions


Personal interpretations of religious content



10. Changes to Terms
We may update these Terms from time to time. Continued use of the app means acceptance of any updates.

`;
  // Search & follows
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [followingMap, setFollowingMap] = useState({}); // followee_id -> true

  const day = days.find(d => d.day === currentDay);
  if (!day) return null;

  // ---------------- Load localStorage data ----------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem("introSeen")) setShowIntro(true);

    // If Supabase is configured, check for existing session and load profile
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const user = data?.session?.user;
          if (user) {
            setCurrentUser(user.id);
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (profile) {
              setProfileDesc(profile.description || "");
              setFavVerse(profile.fav_verse || "");
              setProfileAvatar(profile.avatar_url || DEFAULT_AVATAR);
              setLongestStreak(profile.longest_streak || 0);
              setCompletedDays(profile.completed_days || 0);
              setStreak(profile.streak || 0);
            }
          }
        } catch (err) { console.warn('supabase session load failed', err); }
      })();
    }

    const savedBookmark = localStorage.getItem("bookmarkedDay");
    if (savedBookmark) setCurrentDay(parseInt(savedBookmark));

    const savedStreak = JSON.parse(localStorage.getItem("streak")) || { count: 0, lastDate: null };
    const today = new Date().toISOString().slice(0,10);
    if (savedStreak.lastDate) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      if (savedStreak.lastDate === yesterday) savedStreak.count += 1;
      else if (savedStreak.lastDate !== today) savedStreak.count = 1;
    } else savedStreak.count = 1;
    savedStreak.lastDate = today;
    localStorage.setItem("streak", JSON.stringify(savedStreak));
    setStreak(savedStreak.count);

    // Load/update longest streak
    const savedLongest = parseInt(localStorage.getItem("longestStreak")) || 0;
    if (savedStreak.count > savedLongest) {
      localStorage.setItem("longestStreak", savedStreak.count);
      setLongestStreak(savedStreak.count);
    } else {
      setLongestStreak(savedLongest);
    }

    const savedDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
    const savedVolume = parseFloat(localStorage.getItem("musicVolume")) || 0.5;
    setDarkMode(savedDarkMode);
    setMusicVolume(savedVolume);

    const savedScheme = localStorage.getItem("colorScheme") || "warm";
    setColorScheme(savedScheme);

    // Load current user profile if any
    const savedCurrent = localStorage.getItem("currentUser") || null;
    if (savedCurrent) {
      setCurrentUser(savedCurrent);
      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const u = users[savedCurrent];
      if (u) {
        setProfileDesc(u.description || "");
        setFavVerse(u.favVerse || "");
        setProfileAvatar(u.avatar || DEFAULT_AVATAR);
      }
    }

    const audio = document.getElementById("backgroundMusic");
    if (audio) audio.volume = savedVolume;

  }, []);

  // Check consent on first load (localStorage) or per-user (Supabase)
  useEffect(() => {
    const checkConsent = async () => {
      if (isSupabaseConfigured && supabase && currentUser) {
        try {
          const { data } = await supabase.from('profiles').select('tos_accepted_at, privacy_accepted_at').eq('id', currentUser).maybeSingle();
          const tos = data?.tos_accepted_at || null;
          const priv = data?.privacy_accepted_at || null;
          setConsentTosAt(tos); setConsentPrivacyAt(priv);
          if (!tos || !priv) setShowConsentModal(true);
          return;
        } catch (err) { console.warn('consent fetch failed', err); }
      }
      // localStorage fallback
      const consent = JSON.parse(localStorage.getItem('consent') || '{}');
      const tos = consent.tos || false; const priv = consent.privacy || false;
      if (!tos || !priv) setShowConsentModal(true);
    };
    checkConsent();
  }, [currentUser]);

  // keep the single-agree checkbox synced with the two individual checks
  useEffect(() => {
    setAgreedAll(tosChecked && privacyChecked);
  }, [tosChecked, privacyChecked]);

  const setScheme = (s) => {
    setColorScheme(s);
    if (typeof window !== "undefined") localStorage.setItem("colorScheme", s);
  };

  // When currentUser changes, load who they follow (if Supabase enabled)
  useEffect(() => {
    if (!currentUser) { setFollowingMap({}); return; }
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { data } = await supabase.from('follows').select('followee_id').eq('follower_id', currentUser);
          if (data) {
            const map = {};
            data.forEach(r => { map[r.followee_id] = true; });
            setFollowingMap(map);
          }
        } catch (err) { console.warn('fetch following failed', err); }
      })();
    } else {
      const all = JSON.parse(localStorage.getItem('follows') || '{}');
      const list = all[currentUser] || [];
      const map = {};
      list.forEach(id => map[id] = true);
      setFollowingMap(map);
    }
  }, [currentUser]);

  const searchProfiles = async (q) => {
    setSearchQuery(q);
    setSearchError("");
    if (!q || q.trim().length < 1) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('profiles')
          .select('id, username, avatar_url, description')
          .ilike('username', `%${q}%`)
          .limit(20);
        if (error) throw error;
        setSearchResults(data || []);
      } else {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const results = Object.keys(users).filter(k => k.toLowerCase().includes(q.toLowerCase())).slice(0,20).map(k=>({ id:k, username:k, avatar_url: users[k].avatar, description: users[k].description }));
        setSearchResults(results);
      }
    } catch (err) {
      console.error(err);
      setSearchError(err.message || 'Search failed');
    } finally { setIsSearching(false); }
  };

  const followUser = async (followeeId) => {
    if (!currentUser) { setShowAuthModal(true); return; }
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('follows').insert({ follower_id: currentUser, followee_id: followeeId });
      } else {
        const all = JSON.parse(localStorage.getItem('follows') || '{}');
        all[currentUser] = all[currentUser] || [];
        if (!all[currentUser].includes(followeeId)) all[currentUser].push(followeeId);
        localStorage.setItem('follows', JSON.stringify(all));
      }
      setFollowingMap(prev => ({ ...prev, [followeeId]: true }));
    } catch (err) { console.error('follow failed', err); }
  };

  const unfollowUser = async (followeeId) => {
    if (!currentUser) { setShowAuthModal(true); return; }
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('follows').delete().match({ follower_id: currentUser, followee_id: followeeId });
      } else {
        const all = JSON.parse(localStorage.getItem('follows') || '{}');
        all[currentUser] = (all[currentUser] || []).filter(id => id !== followeeId);
        localStorage.setItem('follows', JSON.stringify(all));
      }
      setFollowingMap(prev => { const copy = { ...prev }; delete copy[followeeId]; return copy; });
    } catch (err) { console.error('unfollow failed', err); }
  };

  // ---------------- Load journal and completed days ----------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load journal for current day
      const savedJournal = localStorage.getItem(`journal-day-${currentDay}`) || "";
      setJournal(savedJournal);

      // Load OT/NT notes for current day
      const savedOt = localStorage.getItem(`otNote-day-${currentDay}`) || "";
      const savedNt = localStorage.getItem(`ntNote-day-${currentDay}`) || "";
      setOtNote(savedOt);
      setNtNote(savedNt);

      // Update completed days
      const completed = days.filter(d => localStorage.getItem(`journal-day-${d.day}`)).length;
      setCompletedDays(completed);

      // Save current day bookmark
      localStorage.setItem("bookmarkedDay", currentDay);
    }
  }, [currentDay]);

  // ---------------- Page transition ----------------
  const changeDay = (newDay) => {
    setDayOpacity(0);
    setTimeout(() => {
      setCurrentDay(newDay);
      setDayOpacity(1);
    }, 250);
  };

  const nextDay = () => { if (currentDay < 365) changeDay(currentDay + 1); };
  const prevDay = () => { if (currentDay > 1) changeDay(currentDay - 1); };
  const jumpToDay = () => {
    const num = parseInt(jumpDay);
    if (!isNaN(num) && num >=1 && num <=365) changeDay(num);
    setJumpDay("");
  };
  const handleDateChange = (value) => {
    setSelectedDate(value);
    if (!value) return;
    const pickedDate = new Date(value);
    const startOfYear = new Date(pickedDate.getFullYear(),0,1);
    const diffTime = pickedDate - startOfYear;
    const diffDays = Math.floor(diffTime / (1000*60*60*24)) +1;
    if (diffDays>=1 && diffDays<=365) changeDay(diffDays);
  };

  // ---------------- Journal ----------------
  const handleJournalChange = (e) => {
    const value = e.target.value;
    setJournal(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(`journal-day-${currentDay}`, value);
      const completed = days.filter(d => localStorage.getItem(`journal-day-${d.day}`)).length;
      setCompletedDays(completed);
    }
  };

  const handleOtNoteChange = (e) => {
    const value = e.target.value;
    setOtNote(value);
    if (typeof window !== "undefined") localStorage.setItem(`otNote-day-${currentDay}`, value);
  };

  const handleNtNoteChange = (e) => {
    const value = e.target.value;
    setNtNote(value);
    if (typeof window !== "undefined") localStorage.setItem(`ntNote-day-${currentDay}`, value);
  };

  // ---------------- Other Handlers ----------------
  const handleContinueIntro = () => {
    if (typeof window !== "undefined") localStorage.setItem("introSeen","true");
    setShowIntro(false);
    const audio = document.getElementById("backgroundMusic");
    if (audio) audio.play().catch(err=>console.log("Autoplay prevented", err));
  };

  const acceptConsent = async () => {
    const now = new Date().toISOString();
    setConsentTosAt(now);
    setConsentPrivacyAt(now);
    // save locally
    localStorage.setItem('consent', JSON.stringify({ tos: true, privacy: true, tosAt: now, privacyAt: now }));
    // save to Supabase profile if available
    if (isSupabaseConfigured && supabase && currentUser) {
      try {
        await supabase.from('profiles').upsert({ id: currentUser, tos_accepted_at: now, privacy_accepted_at: now });
      } catch (err) { console.warn('save consent failed', err); }
    }
    setTosChecked(true);
    setPrivacyChecked(true);
    setShowConsentModal(false);
    setShowPolicyViewer(false);
  };

  const toggleMusic = () => {
    const audio = document.getElementById("backgroundMusic");
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== "undefined") localStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    const audio = document.getElementById("backgroundMusic");
    if (audio) audio.volume = vol;
    if (typeof window !== "undefined") localStorage.setItem("musicVolume", vol);
  };

  const openStreakIntroWithSpin = () => {
    setBadgeSpinning(true);
    setTimeout(() => {
      setBadgeSpinning(false);
      setShowIntro(true);
      const audio = document.getElementById("backgroundMusic");
      if (audio) audio.play().catch(err=>console.log("Autoplay prevented", err));
    }, 600);
  };

  // Profile / Auth helpers
  const openProfile = () => {
    if (currentUser) setShowProfileModal(true);
    else setShowAuthModal(true);
  };

  // Load follower/following counts for the profile modal when opened
  useEffect(() => {
    if (!showProfileModal || !currentUser) {
      setModalFollowerCount(0);
      setModalFollowingCount(0);
      return;
    }
    setModalCountsLoading(true);
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          const { count: followers } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('followee_id', currentUser);
          const { count: following } = await supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', currentUser);
          setModalFollowerCount(followers || 0);
          setModalFollowingCount(following || 0);
        } catch (err) { console.warn('load modal follow counts failed', err); }
        finally { setModalCountsLoading(false); }
      })();
    } else {
      const follows = JSON.parse(localStorage.getItem('follows') || '{}');
      let fcount = 0, gcount = 0;
      Object.keys(follows).forEach(f => { (follows[f] || []).forEach(t => { if (t === currentUser) fcount += 1; }); if (f === currentUser) gcount = (follows[f] || []).length; });
      setModalFollowerCount(fcount);
      setModalFollowingCount(gcount);
      setModalCountsLoading(false);
    }
  }, [showProfileModal, currentUser]);

  // Prevent background scrolling when the policy viewer is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prev = document.body.style.overflow;
    if (showPolicyViewer) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [showPolicyViewer]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail || !authPassword) { setAuthError("Email and password required"); return; }
    if (isSupabaseConfigured && supabase) {
      (async () => {
        if (authMode === 'signup') {
          const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
          if (error) { setAuthError(error.message); return; }
          // create empty profile row (server-side should have RLS; here we upsert client-side)
          const user = data.user;
          if (user) {
            await supabase.from('profiles').upsert({ id: user.id, email: user.email });
            setCurrentUser(user.id);
            setProfileDesc(""); setFavVerse(""); setProfileAvatar(DEFAULT_AVATAR);
            setShowAuthModal(false);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
          if (error) { setAuthError(error.message); return; }
          const user = data.user;
          if (user) {
            setCurrentUser(user.id);
            // fetch profile
            const { data:profiles } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            const p = profiles || {};
            setProfileDesc(p.description || ""); setFavVerse(p.fav_verse || ""); setProfileAvatar(p.avatar_url || DEFAULT_AVATAR);
            setLongestStreak(p.longest_streak || 0);
            setShowAuthModal(false);
          }
        }
        setAuthPassword("");
      })();
      return;
    }

    // Fallback localStorage (legacy)
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (authMode === 'signup') {
      if (users[authEmail]) { setAuthError("Account already exists"); return; }
      users[authEmail] = { password: authPassword, description: "", favVerse: "", avatar: DEFAULT_AVATAR };
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", authEmail);
      setCurrentUser(authEmail);
      setProfileDesc(""); setFavVerse(""); setProfileAvatar(DEFAULT_AVATAR);
      setShowAuthModal(false);
    } else {
      const u = users[authEmail];
      if (!u || u.password !== authPassword) { setAuthError("Invalid credentials"); return; }
      localStorage.setItem("currentUser", authEmail);
      setCurrentUser(authEmail);
      setProfileDesc(u.description || ""); setFavVerse(u.favVerse || ""); setProfileAvatar(u.avatar || DEFAULT_AVATAR);
      setShowAuthModal(false);
    }
    setAuthPassword("");
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowProfileModal(false);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    if (!confirm('Delete account and all associated data? This cannot be undone.')) return;
    // Supabase path: delete follows, profile, avatar, then sign out
    if (isSupabaseConfigured && supabase) {
      try {
        // delete follows where follower or followee
        await supabase.from('follows').delete().or(`follower_id.eq.${currentUser},followee_id.eq.${currentUser}`);
      } catch (err) { console.warn('delete follows failed', err); }
      try {
        // get profile to find avatar path
        const { data: p } = await supabase.from('profiles').select('avatar_url').eq('id', currentUser).maybeSingle();
        const avatarUrl = p?.avatar_url || '';
        // attempt to remove common filenames
        const tryRemove = async (path) => {
          try { await supabase.storage.from('avatars').remove([path]); } catch (e) { /* ignore */ }
        };
        // If avatarUrl includes the currentUser filename, derive path
        if (avatarUrl && avatarUrl.includes(currentUser)) {
          // try png/jpg
          await tryRemove(`avatars/${currentUser}.png`);
          await tryRemove(`avatars/${currentUser}.jpg`);
          // try exact tail if present
          const parts = avatarUrl.split('/');
          const tail = parts.slice(-2).join('/');
          if (tail) await tryRemove(tail);
        }
      } catch (err) { console.warn('remove avatar failed', err); }
      try {
        await supabase.from('profiles').delete().eq('id', currentUser);
      } catch (err) { console.warn('delete profile failed', err); }
      try { await supabase.auth.signOut(); } catch (err) { /* ignore */ }
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setShowProfileModal(false);
      alert('Account deleted locally. Note: deleting the Auth user account requires server-side (admin) operation if you want the authentication record removed.');
      return;
    }

    // localStorage fallback: remove user and follows
    try {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      delete users[currentUser];
      localStorage.setItem('users', JSON.stringify(users));
      const follows = JSON.parse(localStorage.getItem('follows') || '{}');
      // remove entries where follower is currentUser
      delete follows[currentUser];
      // remove followee references
      Object.keys(follows).forEach(k => { follows[k] = (follows[k] || []).filter(x => x !== currentUser); });
      localStorage.setItem('follows', JSON.stringify(follows));
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      setShowProfileModal(false);
      alert('Local account deleted');
    } catch (err) { console.error('local delete failed', err); }
  };

  const saveProfile = () => {
    if (!currentUser) return;
    if (isSupabaseConfigured && supabase) {
      (async () => {
        // if avatar is data URL, upload to storage
        let avatarUrl = profileAvatar;
        if (profileAvatar && profileAvatar.startsWith('data:')) {
          try {
            // convert dataURL to blob
            const res = await fetch(profileAvatar);
            const blob = await res.blob();
            const fileExt = blob.type === 'image/png' ? 'png' : 'jpg';
            const fileName = `avatars/${currentUser}.${fileExt}`;
            await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
          } catch (err) { console.error('upload failed', err); }
        }
        await supabase.from('profiles').upsert({ id: currentUser, email: '', description: profileDesc, fav_verse: favVerse, avatar_url: avatarUrl, longest_streak: longestStreak, streak: streak, completed_days: completedDays, tos_accepted_at: consentTosAt, privacy_accepted_at: consentPrivacyAt });
        setProfileAvatar(avatarUrl);
        setShowProfileModal(false);
      })();
      return;
    }

    // Fallback localStorage
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    users[currentUser] = users[currentUser] || { password: "" };
    users[currentUser].description = profileDesc;
    users[currentUser].favVerse = favVerse;
    users[currentUser].avatar = profileAvatar;
    localStorage.setItem("users", JSON.stringify(users));
    setShowProfileModal(false);
  };

  const handleAvatarChange = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      setProfileAvatar(url);
    };
    reader.readAsDataURL(file);
  };

  const clearCache = () => { 
    if (typeof window !== "undefined") localStorage.clear(); 
    alert("Local cache cleared!"); 
  };

  const progressPercent = Math.round((completedDays/365)*100);

  if (showIntro) return (
    <div className="streak-modal-backdrop">
      <div className="streak-modal">
        <StreakIntro streak={streak} longest={longestStreak} onContinue={handleContinueIntro} />
      </div>
    </div>
  );

  return (
    <div className="app-root" data-scheme={colorScheme}>
      <div className="app-card">
        <div style={{ 
          minHeight:"100vh", 
          backgroundColor: darkMode ? "#2B2B2B":"#FBF7F2", 
          color: darkMode ? "#EDEDED" : "#000000",
          fontFamily:"Georgia, serif", 
          padding:24, 
          transition:"all 0.5s ease" 
        }}>
      
      {/* Audio */}
      <audio id="backgroundMusic" loop>
        <source src="/music/peaceful.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <header className="app-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, gap:12 }}>
        <div className="header-left" style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>changeDay(1)}>🏠 Home</button>
          <button onClick={()=>setShowSettings(true)}>⚙️ Settings</button>
          <div style={{ marginLeft:8 }}>
            <input
              placeholder="Search people..."
              value={searchQuery}
              onChange={e=>searchProfiles(e.target.value)}
              style={{ padding:8, borderRadius:8, width:220, border: darkMode? '1px solid #555':'1px solid #ccc' }}
            />
          </div>
        </div>
        <h1 style={{ color: darkMode?"#EDEDED":"var(--accent)", fontSize:36 }}>Bible in 365 Days</h1>
        <div className="header-right" style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={()=>setShowResources(true)}>📚 Resources</button>
          <button onClick={()=>window.location.href="mailto:plaworkshop7@gmail.com"}>✉️ Contact</button>
          <button onClick={deleteAccount} style={{ background:'#ff4d4f', color:'#fff', borderRadius:6, padding:'6px 10px', border:'none', cursor:'pointer' }}>Delete account</button>
          <div style={{ width:40, height:40, borderRadius:20, overflow:"hidden", cursor:"pointer", boxShadow:"0 6px 18px rgba(0,0,0,0.08)" }} onClick={openProfile}>
            <img src={profileAvatar} alt="profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        </div>
      </header>

      {/* Search results */}
      {searchResults && searchResults.length > 0 && (
        <div style={{ maxWidth:800, margin:'0 auto 16px', background: darkMode? '#2F2F2F':'#FFF', border: '1px solid #EEE', borderRadius:8, padding:8 }}>
          {searchError && <div style={{ color:'crimson' }}>{searchError}</div>}
          {isSearching && <div style={{ fontSize:12, color:'#666' }}>Searching...</div>}
          {searchResults.map(p => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 6px', borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ width:44, height:44, borderRadius:8, overflow:'hidden' }}>
                <img src={p.avatar_url || DEFAULT_AVATAR} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{p.username || p.id}</div>
                <div style={{ fontSize:12, color:'#666' }}>{p.description || ''}</div>
              </div>
              <div>
                {followingMap[p.id] ? (
                  <button onClick={()=>unfollowUser(p.id)} style={{ background:'#EEE', color:'#000' }}>Following</button>
                ) : (
                  <button onClick={()=>followUser(p.id)} style={{ background:'#6B3E26', color:'#FBF7F2' }}>Follow</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Streak badge */}
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div
          role="button"
          tabIndex={0}
          onClick={openStreakIntroWithSpin}
          onKeyDown={(e)=>{ if(e.key==="Enter"||e.key===" ") { e.preventDefault(); openStreakIntroWithSpin(); } }}
          style={{
            display:"inline-flex",
            alignItems:"center",
            gap:12,
            background: darkMode?"#3A3A3A":"#FFF8ED",
            border: "1px solid "+(darkMode?"#555":"#E2D5C8"),
            padding:"8px 14px",
            borderRadius:24,
            cursor:"pointer",
            transform: badgeSpinning ? "rotate(360deg) scale(1.05)" : "none",
            transition: "transform 0.6s ease"
          }}
        >
          <span style={{ fontSize:22 }}>🔥</span>
          <div style={{ textAlign:"left", lineHeight:1 }}>
            <div style={{ fontSize:12, color: darkMode?"#EDEDED":"#6B3E26" }}>Current Streak</div>
            <div style={{ fontSize:18, fontWeight:700 }}>{streak} {streak === 1 ? "day" : "days"}</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <div style={{ position:"fixed", top:0,left:0,width:"100%",height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:999 }}>
          <div style={{ background: darkMode?"#3A3A3A":"#FFF", color: darkMode?"#EDEDED":"#000", padding:24, borderRadius:12, width:"90%", maxWidth:420, transform:"translateY(-50px)", opacity:0, animation:"slideIn 0.3s forwards" }}>
            <h2>Settings</h2>
            <div style={{ marginBottom:10 }}><label><input type="checkbox" checked={darkMode} onChange={toggleDarkMode}/> Dark Mode</label></div>
            <div style={{ marginBottom:10 }}><label>Music Volume: <input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={handleVolumeChange} /></label></div>
            <div style={{ marginBottom:10 }}>
              <button onClick={() => { setPolicyToView('privacy'); setShowPolicyViewer(true); }} style={{ marginRight:8 }}>View Privacy Policy</button>
              <button onClick={() => { setPolicyToView('tos'); setShowPolicyViewer(true); }}>View Terms of Service</button>
            </div>
            <div style={{ marginBottom:10 }}>
              <button onClick={() => setShowConsentModal(true)}>Review / Re-accept Policies</button>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ marginBottom:6 }}>Color Scheme</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setScheme('warm')} style={{ flex:1, background: colorScheme==='warm'? 'var(--accent)':'#EEE', color: colorScheme==='warm'? '#FBF7F2':'#000' }}>Warm</button>
                <button onClick={()=>setScheme('cool')} style={{ flex:1, background: colorScheme==='cool'? 'var(--accent)':'#EEE', color: colorScheme==='cool'? '#FBF7F2':'#000' }}>Cool</button>
              </div>
            </div>
            <div style={{ marginBottom:10 }}><button onClick={clearCache}>Clear Local Cache</button></div>
            <div style={{ textAlign:"right", marginTop:10 }}><button onClick={()=>setShowSettings(false)}>Close</button></div>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{ position:"fixed", top:0,left:0,width:"100%",height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }}>
          <div style={{ background: darkMode?"#2B2B2B":"#FFF", color: darkMode?"#EDEDED":"#000", padding:20, borderRadius:12, width:320 }}>
            <h3>{authMode==='signup' ? 'Sign up' : 'Log in'}</h3>
            {authError && <div style={{ color:'crimson', marginBottom:8 }}>{authError}</div>}
            <form onSubmit={handleAuthSubmit}>
              <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} style={{ width:'100%', marginBottom:8 }} />
              <input type="password" placeholder="Password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} style={{ width:'100%', marginBottom:8 }} />
              <div style={{ display:'flex', gap:8 }}>
                <button type="submit">{authMode==='signup' ? 'Create account' : 'Log in'}</button>
                <button type="button" onClick={()=>setAuthMode(authMode==='signup'?'login':'signup')} style={{ background:'#EEE', color:'#000' }}>{authMode==='signup' ? 'Have an account?' : 'Create account'}</button>
              </div>
            </form>
            <div style={{ textAlign:'right', marginTop:10 }}><button onClick={()=>setShowAuthModal(false)}>Close</button></div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={{ position:"fixed", top:0,left:0,width:"100%",height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 }}>
          <div style={{ background: darkMode?"#2B2B2B":"#FFF", color: darkMode?"#EDEDED":"#000", padding:20, borderRadius:12, width:360 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:80,height:80,borderRadius:12,overflow:'hidden' }}>
                <img src={profileAvatar} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{currentUser}</div>
                <div style={{ fontSize:12, color:'#6B3E26' }}>Streak: {streak} • Longest: {longestStreak}</div>
                <div style={{ fontSize:12, color:'#6B3E26', marginTop:6 }}>
                  {modalCountsLoading ? (
                    <span className="spinner" aria-hidden style={{ display:'inline-block', marginRight:8 }}>🔄</span>
                  ) : (
                    <>{modalFollowerCount} follower{modalFollowerCount===1?"":"s"} • {modalFollowingCount} following</>
                  )}
                </div>
              </div>
            </div>
            <div style={{ marginTop:12 }}>
              <label style={{ display:'block', marginBottom:6 }}>Profile picture</label>
              <input type="file" accept="image/png,image/jpeg" onChange={(e)=>handleAvatarChange(e.target.files && e.target.files[0])} />
            </div>
            <div style={{ marginTop:12 }}>
              <label style={{ display:'block', marginBottom:6 }}>About</label>
              <textarea value={profileDesc} onChange={e=>setProfileDesc(e.target.value)} style={{ width:'100%', minHeight:80 }} />
            </div>
            <div style={{ marginTop:12 }}>
              <label style={{ display:'block', marginBottom:6 }}>Favorite verse</label>
              <input value={favVerse} onChange={e=>setFavVerse(e.target.value)} style={{ width:'100%' }} />
            </div>
            <div style={{ marginTop:12 }}>
              <div className="progress-wrap" style={{ width:'100%', marginBottom:8 }}><div className="progress-bar" style={{ width:`${progressPercent}%` }} /></div>
              <div style={{ fontSize:12, color:'#6B3E26' }}>{completedDays}/365 days ({progressPercent}%)</div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
              <button onClick={saveProfile}>Save</button>
              <button onClick={logout} style={{ background:'#EEE', color:'#000' }}>Logout</button>
            </div>
          </div>
        </div>
      )}
      {showResources && (
        <div style={{ position:"fixed", top:0,left:0,width:"100%",height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:999 }}>
          <div style={{ background: darkMode?"#3A3A3A":"#FFF", color: darkMode?"#EDEDED":"#000", padding:24, borderRadius:12, width:"90%", maxWidth:400, transform:"translateY(-50px)", opacity:0, animation:"slideIn 0.3s forwards" }}>
            <h2>Resources</h2>
            <ul>
              <li><a href="https://www.bible.com" target="_blank" style={{ color: darkMode?"#EDEDED":"#000" }}>Bible.com</a></li>
              <li><a href="https://www.youtube.com/@bibleproject" target="_blank" style={{ color: darkMode?"#EDEDED":"#000" }}>Bible Project YouTube</a></li>
            </ul>
            <div style={{ textAlign:"right", marginTop:10 }}><button onClick={()=>setShowResources(false)}>Close</button></div>
          </div>
        </div>
      )}
      {/* Policy viewer modal */}
      {showPolicyViewer && (
        <div style={{ position:"fixed", top:0,left:0,width:"100%",height:"100%", backgroundColor:"rgba(0,0,0,0.6)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:4000 }}>
          <div style={{ background: darkMode?"#2B2B2B":"#FFF", color: darkMode?"#EDEDED":"#000", padding:20, borderRadius:12, width:"90%", maxWidth:720, maxHeight:"80%", overflowY:"auto" }}>
            <h2>{policyToView === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h2>
            <pre style={{ whiteSpace:'pre-wrap', fontFamily:'inherit', lineHeight:1.4, maxHeight:'60vh', overflowY:'auto', paddingRight:8 }}>{policyToView === 'privacy' ? PRIVACY_POLICY_TEXT : TOS_TEXT}</pre>
            <div style={{ marginTop:12 }}>
              <label style={{ display:'block', marginBottom:8 }}><input type="checkbox" style={checkboxStyle} checked={tosChecked} onChange={e=>setTosChecked(e.target.checked)} /> I have read and agree to the Terms of Service</label>
              <label style={{ display:'block', marginBottom:8 }}><input type="checkbox" style={checkboxStyle} checked={privacyChecked} onChange={e=>setPrivacyChecked(e.target.checked)} /> I have read and agree to the Privacy Policy</label>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
              <div><button onClick={()=>setShowPolicyViewer(false)}>Close</button></div>
              <div><button disabled={!(tosChecked && privacyChecked)} onClick={acceptConsent} style={{ background: tosChecked && privacyChecked ? '#6B3E26' : '#DDD', color: tosChecked && privacyChecked ? '#FFF' : '#666' }}>Accept and Continue</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Consent modal (shown on first open until accepted) */}
      {showConsentModal && (
        <div style={{ position:"fixed", top:0,left:0,width:"100%",height:"100%", backgroundColor:"rgba(0,0,0,0.75)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:3000 }}>
          <div style={{ background: darkMode?"#2B2B2B":"#FFF", color: darkMode?"#EDEDED":"#000", padding:20, borderRadius:12, width:"92%", maxWidth:520 }}>
            <h2>Welcome — Please accept our policies</h2>
            <p style={{ lineHeight:1.4 }}>Before using this app you must accept our Terms of Service and Privacy Policy. You can read them below.</p>
            <div style={{ marginTop:8 }}>
              <label style={{ display:'block', marginBottom:6 }}>
                <input type="checkbox" style={checkboxStyle} checked={agreedAll} onChange={e=>{ const v = e.target.checked; setAgreedAll(v); setTosChecked(v); setPrivacyChecked(v); }} />
                {' '}
                I have read and agree to the Terms of Service and Privacy Policy
                {' '}
                (<button onClick={()=>{ setPolicyToView('tos'); setShowPolicyViewer(true); }}>view</button>{' / '}
                <button onClick={()=>{ setPolicyToView('privacy'); setShowPolicyViewer(true); }}>view</button>)
              </label>
            </div>
            <div style={{ marginTop:12, textAlign:'right' }}>
              <button disabled={!agreedAll} onClick={acceptConsent} style={{ background: agreedAll ? '#6B3E26' : '#DDD', color: agreedAll ? '#FFF' : '#666' }}>Accept and Continue</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideIn { from {opacity:0; transform:translateY(-50px);} to {opacity:1; transform:translateY(0);} }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spinner { display:inline-block; animation: spin 1s linear infinite; }
    `}</style>

      {/* Navigation */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <input 
          type="number" 
          placeholder="Go to day" 
          value={jumpDay} 
          onChange={e=>setJumpDay(e.target.value)} 
          style={{ 
            width:110,
            padding:6, 
            background: darkMode?"#3A3A3A":"#FFF", 
            color: darkMode?"#EDEDED":"#000", 
            border: darkMode?"1px solid #555":"1px solid #ccc",
            borderRadius:6,
            transition:"all 0.3s ease",
            outline:"none"
          }}
          onFocus={e=>e.currentTarget.style.borderColor = darkMode?"#A67C52":"#6B3E26"}
          onBlur={e=>e.currentTarget.style.borderColor = darkMode?"#555":"#ccc"}
        />
        <button 
          onClick={jumpToDay} 
          style={{
            padding:"6px 12px",
            borderRadius:6,
            border:"none",
            backgroundColor:"#6B3E26",
            color:"#FBF7F2",
            cursor:"pointer",
            transition:"transform 0.2s ease"
          }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
        >
          Go
        </button>

        <input 
          type="date" 
          value={selectedDate} 
          onChange={e=>handleDateChange(e.target.value)} 
          style={{ 
            padding:6, 
            background: darkMode?"#3A3A3A":"#FFF", 
            color: darkMode?"#EDEDED":"#000", 
            border: darkMode?"1px solid #555":"1px solid #ccc",
            borderRadius:6,
            transition:"all 0.3s ease",
            outline:"none"
          }}
          onFocus={e=>e.currentTarget.style.borderColor = darkMode?"#A67C52":"#6B3E26"}
          onBlur={e=>e.currentTarget.style.borderColor = darkMode?"#555":"#ccc"}
        />
      </div>

      {/* Progress bar */}
      <div style={{ margin:"20px 0", textAlign:"center" }}>
        <p>📊 Progress: {completedDays}/365 days ({progressPercent}%)</p>
        <div className="progress-wrap" style={{ width: "90%", margin: "0 auto" }}>
          <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Day content sections with fade transition */}
      <div style={{ opacity: dayOpacity, transition:"opacity 0.25s ease" }}>
        <section className="card" style={{ border: "1px solid "+(darkMode?"#555":"#E2D5C8"), color: darkMode?"#EDEDED":"#000" }}>
          <h3 className="section-title">📜 Old Testament</h3>
          <p>{day.oldTestament}</p>
          <div style={{ marginTop:10 }}>
            <h4 style={{ marginBottom:6 }}>Notes</h4>
            <textarea
              value={otNote}
              onChange={handleOtNoteChange}
              placeholder="Notes for the Old Testament chapter..."
              style={{
                width:"100%",
                minHeight:80,
                padding:8,
                borderRadius:6,
                border: darkMode?"1px solid #555":"1px solid #ccc",
                fontFamily:"Georgia, serif",
                background: darkMode?"#3A3A3A":"#FFF",
                color: darkMode?"#EDEDED":"#000"
              }}
            />
          </div>
          <h3 className="section-title">✝️ New Testament</h3>
          <p>{day.newTestament}</p>
          <div style={{ marginTop:10 }}>
            <h4 style={{ marginBottom:6 }}>Notes</h4>
            <textarea
              value={ntNote}
              onChange={handleNtNoteChange}
              placeholder="Notes for the New Testament chapter..."
              style={{
                width:"100%",
                minHeight:80,
                padding:8,
                borderRadius:6,
                border: darkMode?"1px solid #555":"1px solid #ccc",
                fontFamily:"Georgia, serif",
                background: darkMode?"#3A3A3A":"#FFF",
                color: darkMode?"#EDEDED":"#000"
              }}
            />
          </div>
        </section>

        <section className="card card--muted" style={{ borderLeft: "6px solid "+(darkMode?"#A67C52":"#6B3E26"), color: darkMode?"#EDEDED":"#000" }}>
          <h3 className="section-title">Reflection</h3>
          <p>{day.reflection}</p>
        </section>

        <section className="card card--muted" style={{ borderLeft: "6px solid "+(darkMode?"#C19B77":"#8A6A52"), color: darkMode?"#EDEDED":"#000" }}>
          <h3 className="section-title">Journaling Prompt</h3>
          <p>{day.prompt}</p>
          <textarea 
            value={journal} 
            onChange={handleJournalChange} 
            placeholder="Write your thoughts here..." 
            style={{ 
              width:"100%", 
              minHeight:120, 
              padding:10, 
              marginTop:10, 
              borderRadius:6, 
              border: darkMode?"1px solid #555":"1px solid #ccc", 
              fontFamily:"Georgia, serif", 
              background: darkMode?"#3A3A3A":"#FFF", 
              color: darkMode?"#EDEDED":"#000" 
            }} 
          />
        </section>
      </div>

      {/* Previous / Next */}
      <div style={{ marginTop:30, textAlign:"center" }}>
        <button onClick={prevDay} disabled={currentDay===1}>Previous</button>
        <button onClick={nextDay} disabled={currentDay===365} style={{ marginLeft:10 }}>Next</button>
      </div>

      {/* Music button */}
      <button onClick={toggleMusic} style={{position:"fixed", bottom:20,right:20,padding:10,borderRadius:8, background:"#6B3E26", color:"#FBF7F2"}}>🎵 Music</button>

      <style>{`@keyframes fadeIn { from {opacity:0;} to {opacity:1;} }`}</style>
    </div>
      </div>
    </div>
  );
}
