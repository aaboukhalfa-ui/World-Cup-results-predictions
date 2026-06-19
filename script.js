// =================================================================
// ⚠️ ضع هنا بيانات مشروع Firebase الخاص بك
// =================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBfMkvZYeQ-SwP791FkwiqOphiEtM8oeuk",
  authDomain: "worldcup2026-a00f8.firebaseapp.com",
  projectId: "worldcup2026-a00f8",
  storageBucket: "worldcup2026-a00f8.firebasestorage.app",
  messagingSenderId: "764723385580",
  appId: "1:764723385580:web:41986564042faec71fc1c9",
  measurementId: "G-9TVP7VS1N7"
};

const ADMIN_PASSWORD = "1010";

let firebaseReady = false;
let db = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
} catch (e) {
    console.error("فشل الاتصال بـ Firebase. تأكد من ضبط firebaseConfig بشكل صحيح.", e);
}

let currentUser = localStorage.getItem("prediction_user") || "";
let currentUserDisplay = localStorage.getItem("prediction_user_display") || currentUser;
let currentGroup = 'A';
let currentMode = 'predict';
let authMode = 'login';
let timerInterval = null; // لتشغيل عداد الإغلاق الحي التنازلي

// قاعدة البيانات الكاملة لجميع المجموعات مع إضافة kickoffTime (بصيغة ISO كاملة) لتنفيذ نظام القفل
const groupsData = {
    A: { name: "المجموعة الأولى", teams: ["المكسيك 🇲🇽", "جنوب إفريقيا 🇿🇦", "كوريا الجنوبية 🇰🇷", "جمهورية التشيك 🇨🇿"],
         matches: [{id:"A1",tA:"المكسيك 🇲🇽",tB:"جنوب إفريقيا 🇿🇦",kickoffTime:"2026-06-11T16:00:00Z"},{id:"A2",tA:"كوريا الجنوبية 🇰🇷",tB:"جمهورية التشيك 🇨🇿",kickoffTime:"2026-06-11T19:00:00Z"},{id:"A3",tA:"المكسيك 🇲🇽",tB:"كوريا الجنوبية 🇰🇷",kickoffTime:"2026-06-15T15:00:00Z"},{id:"A4",tA:"جنوب إفريقيا 🇿🇦",tB:"جمهورية التشيك 🇨🇿",kickoffTime:"2026-06-15T18:00:00Z"},{id:"A5",tA:"المكسيك 🇲🇽",tB:"جمهورية التشيك 🇨🇿",kickoffTime:"2026-06-19T15:00:00Z"},{id:"A6",tA:"كوريا الجنوبية 🇰🇷",tB:"جنوب إفريقيا 🇿🇦",kickoffTime:"2026-06-19T18:00:00Z"}] },
    B: { name: "المجموعة الثانية", teams: ["كندا 🇨🇦", "البوسنة والهرسك 🇧🇦", "قطر 🇶🇦", "سويسرا 🇨🇭"],
         matches: [{id:"B1",tA:"كندا 🇨🇦",tB:"البوسنة والهرسك 🇧🇦",kickoffTime:"2026-06-12T14:00:00Z"},{id:"B2",tA:"قطر 🇶🇦",tB:"سويسرا 🇨🇭",kickoffTime:"2026-06-12T17:00:00Z"},{id:"B3",tA:"كندا 🇨🇦",tB:"قطر 🇶🇦",kickoffTime:"2026-06-16T16:00:00Z"},{id:"B4",tA:"البوسنة والهرسك 🇧🇦",tB:"سويسرا 🇨🇭",kickoffTime:"2026-06-16T19:00:00Z"},{id:"B5",tA:"كندا 🇨🇦",tB:"سويسرا 🇨🇭",kickoffTime:"2026-06-20T14:00:00Z"},{id:"B6",tA:"قطر 🇶🇦",tB:"البوسنة والهرسك 🇧🇦",kickoffTime:"2026-06-20T17:00:00Z"}] },
    C: { name: "المجموعة الثالثة", teams: ["البرازيل 🇧🇷", "المغرب 🇲🇦", "هايتي 🇭🇹", "اسكتلندا 🏴"],
         matches: [{id:"C1",tA:"البرازيل 🇧🇷",tB:"المغرب 🇲🇦",kickoffTime:"2026-06-12T20:00:00Z"},{id:"C2",tA:"هايتي 🇭🇹",tB:"اسكتلندا 🏴",kickoffTime:"2026-06-13T13:00:00Z"},{id:"C3",tA:"البرازيل 🇧🇷",tB:"هايتي 🇭🇹",kickoffTime:"2026-06-17T15:00:00Z"},{id:"C4",tA:"المغرب 🇲🇦",tB:"اسكتلندا 🏴",kickoffTime:"2026-06-17T18:00:00Z"},{id:"C5",tA:"البرازيل 🇧🇷",tB:"اسكتلندا 🏴",kickoffTime:"2026-06-21T16:00:00Z"},{id:"C6",tA:"هايتي 🇭🇹",tB:"المغرب 🇲🇦",kickoffTime:"2026-06-21T19:00:00Z"}] },
    D: { name: "المجموعة الرابعة", teams: ["الولايات المتحدة 🇺🇸", "باراغواي 🇵🇾", "أستراليا 🇦🇺", "تركيا 🇹🇷"],
         matches: [{id:"D1",tA:"الولايات المتحدة 🇺🇸",tB:"باراغواي 🇵🇾",kickoffTime:"2026-06-13T16:00:00Z"},{id:"D2",tA:"أستراليا 🇦🇺",tB:"تركيا 🇹🇷",kickoffTime:"2026-06-13T19:00:00Z"},{id:"D3",tA:"الولايات المتحدة 🇺🇸",tB:"أستراليا 🇦🇺",kickoffTime:"2026-06-18T14:00:00Z"},{id:"D4",tA:"باراغواي 🇵🇾",tB:"تركيا 🇹🇷",kickoffTime:"2026-06-18T17:00:00Z"},{id:"D5",tA:"الولايات المتحدة 🇺🇸",tB:"تركيا 🇹🇷",kickoffTime:"2026-06-22T14:00:00Z"},{id:"D6",tA:"أستراليا 🇦🇺",tB:"باراغواي 🇵🇾",kickoffTime:"2026-06-22T17:00:00Z"}] },
    E: { name: "المجموعة الخامسة", teams: ["ألمانيا 🇩🇪", "كوراساو 🇨🇼", "كوت ديفوار 🇨🇮", "الإكوادور 🇪🇨"],
         matches: [{id:"E1",tA:"ألمانيا 🇩🇪",tB:"كوراساو 🇨🇼",kickoffTime:"2026-06-14T13:00:00Z"},{id:"E2",tA:"كوت ديفوار 🇨🇮",tB:"الإكوادور 🇪🇨",kickoffTime:"2026-06-14T16:00:00Z"},{id:"E3",tA:"ألمانيا 🇩🇪",tB:"كوت ديفوار 🇨🇮",kickoffTime:"2026-06-19T13:00:00Z"},{id:"E4",tA:"كوراساو 🇨🇼",tB:"الإكوادور 🇪🇨",kickoffTime:"2026-06-19T20:00:00Z"},{id:"E5",tA:"ألمانيا 🇩🇪",tB:"الإكوادور 🇪🇨",kickoffTime:"2026-06-23T15:00:00Z"},{id:"E6",tA:"كوت ديفوار 🇨🇮",tB:"كوراساو 🇨🇼",kickoffTime:"2026-06-23T18:00:00Z"}] },
    F: { name: "المجموعة السادسة", teams: ["هولندا 🇳🇱", "اليابان 🇯🇵", "السويد 🇸🇪", "تونس 🇹🇳"],
         matches: [{id:"F1",tA:"هولندا 🇳🇱",tB:"اليابان 🇯🇵",kickoffTime:"2026-06-14T19:00:00Z"},{id:"F2",tA:"السويد 🇸🇪",tB:"تونس 🇹🇳",kickoffTime:"2026-06-15T13:00:00Z"},{id:"F3",tA:"هولندا 🇳🇱",tB:"السويد 🇸🇪",kickoffTime:"2026-06-20T13:00:00Z"},{id:"F4",tA:"اليابان 🇯🇵",tB:"تونس 🇹🇳",kickoffTime:"2026-06-20T20:00:00Z"},{id:"F5",tA:"هولندا 🇳🇱",tB:"تونس 🇹🇳",kickoffTime:"2026-06-24T14:00:00Z"},{id:"F6",tA:"السويد 🇸🇪",tB:"اليابان 🇯🇵",kickoffTime:"2026-06-24T17:00:00Z"}] },
    G: { name: "المجموعة السابعة", teams: ["بلجيكا 🇧🇪", "مصر 🇪🇬", "إيران 🇮🇷", "نيوزيلندا 🇳🇿"],
         matches: [{id:"G1",tA:"بلجيكا 🇧🇪",tB:"مصر 🇪🇬",kickoffTime:"2026-06-15T21:00:00Z"},{id:"G2",tA:"إيران 🇮🇷",tB:"نيوزيلندا 🇳🇿",kickoffTime:"2026-06-16T13:00:00Z"},{id:"G3",tA:"بلجيكا 🇧🇪",tB:"إيران 🇮🇷",kickoffTime:"2026-06-21T13:00:00Z"},{id:"G4",tA:"مصر 🇪🇬",tB:"نيوزيلندا 🇳🇿",kickoffTime:"2026-06-21T20:00:00Z"},{id:"G5",tA:"بلجيكا 🇧🇪",tB:"نيوزيلندا 🇳🇿",kickoffTime:"2026-06-25T15:00:00Z"},{id:"G6",tA:"إيران 🇮🇷",tB:"مصر 🇪🇬",kickoffTime:"2026-06-25T18:00:00Z"}] },
    H: { name: "المجموعة الثامنة", teams: ["إسبانيا 🇪🇸", "الرأس الأخضر 🇨🇻", "السعودية 🇸🇦", "الأوروغواي 🇺🇾"],
         matches: [{id:"H1",tA:"إسبانيا 🇪🇸",tB:"الرأس الأخضر 🇨🇻",kickoffTime:"2026-06-16T16:00:00Z"},{id:"H2",tA:"السعودية 🇸🇦",tB:"الأوروغواي 🇺🇾",kickoffTime:"2026-06-16T19:00:00Z"},{id:"H3",tA:"إسبانيا 🇪🇸",tB:"السعودية 🇸🇦",kickoffTime:"2026-06-22T13:00:00Z"},{id:"H4",tA:"الرأس الأخضر 🇨🇻",tB:"الأوروغواي 🇺🇾",kickoffTime:"2026-06-22T20:00:00Z"},{id:"H5",tA:"إسبانيا 🇪🇸",tB:"الأوروغواي 🇺🇾",kickoffTime:"2026-06-26T14:00:00Z"},{id:"H6",tA:"السعودية 🇸🇦",tB:"الرأس الأخضر 🇨🇻",kickoffTime:"2026-06-26T17:00:00Z"}] },
    I: { name: "المجموعة التاسعة", teams: ["فرنسا 🇫🇷", "السنغال 🇸🇳", "العراق 🇮🇶", "النرويج 🇳🇴"],
         matches: [{id:"I1",tA:"فرنسا 🇫🇷",tB:"السنغال 🇸🇳",kickoffTime:"2026-06-17T13:00:00Z"},{id:"I2",tA:"العراق 🇮🇶",tB:"النرويج 🇳🇴",kickoffTime:"2026-06-17T20:00:00Z"},{id:"I3",tA:"فرنسا 🇫🇷",tB:"العراق 🇮🇶",kickoffTime:"2026-06-23T13:00:00Z"},{id:"I4",tA:"السنغال 🇸🇳",tB:"النرويج 🇳🇴",kickoffTime:"2026-06-23T20:00:00Z"},{id:"I5",tA:"فرنسا 🇫🇷",tB:"النرويج 🇳🇴",kickoffTime:"2026-06-27T15:00:00Z"},{id:"I6",tA:"العراق 🇮🇶",tB:"السنغال 🇸🇳",kickoffTime:"2026-06-27T18:00:00Z"}] },
    J: { name: "المجموعة العاشرة", teams: ["الأرجنتين 🇦🇷", "الجزائر 🇩🇿", "النمسا 🇦🇹", "الأردن 🇯🇴"],
         matches: [{id:"J1",tA:"الأرجنتين 🇦🇷",tB:"الجزائر 🇩🇿",kickoffTime:"2026-06-18T13:00:00Z"},{id:"J2",tA:"النمسا 🇦🇹",tB:"الأردن 🇯🇴",kickoffTime:"2026-06-18T20:00:00Z"},{id:"J3",tA:"الأرجنتين 🇦🇷",tB:"النمسا 🇦🇹",kickoffTime:"2026-06-24T13:00:00Z"},{id:"J4",tA:"الجزائر 🇩🇿",tB:"الأردن 🇯🇴",kickoffTime:"2026-06-24T20:00:00Z"},{id:"J5",tA:"الأرجنتين 🇦🇷",tB:"الأردن 🇯🇴",kickoffTime:"2026-06-28T14:00:00Z"},{id:"J6",tA:"النمسا 🇦🇹",tB:"الجزائر 🇩🇿",kickoffTime:"2026-06-28T17:00:00Z"}] },
    K: { name: "المجموعة الحادية عشرة", teams: ["البرتغال 🇵🇹", "الكونغو الديمقراطية 🇨🇩", "أوزبكستان 🇺🇿", "كولومبيا 🇨🇴"],
         matches: [{id:"K1",tA:"البرتغال 🇵🇹",tB:"الكونغو الديمقراطية 🇨🇩",kickoffTime:"2026-06-19T13:00:00Z"},{id:"K2",tA:"أوزبكستان 🇺🇿",tB:"كولومبيا 🇨🇴",kickoffTime:"2026-06-19T20:00:00Z"},{id:"K3",tA:"البرتغال 🇵🇹",tB:"أوزبكستان 🇺🇿",kickoffTime:"2026-06-25T13:00:00Z"},{id:"K4",tA:"الكونغو الديمقراطية 🇨🇩",tB:"كولومبيا 🇨🇴",kickoffTime:"2026-06-25T20:00:00Z"},{id:"K5",tA:"البرتغال 🇵🇹",tB:"كولومبيا 🇨🇴",kickoffTime:"2026-06-29T15:00:00Z"},{id:"K6",tA:"أوزبكستان 🇺🇿",tB:"الكونغو الديمقراطية 🇨🇩",kickoffTime:"2026-06-29T18:00:00Z"}] },
    L: { name: "المجموعة الثانية عشرة", teams: ["إنجلترا 🏴", "كرواتيا 🇭🇷", "غانا 🇬🇭", "بنما 🇵🇦"],
         matches: [{id:"L1",tA:"إنجلترا 🏴",tB:"كرواتيا 🇭🇷",kickoffTime:"2026-06-20T13:00:00Z"},{id:"L2",tA:"غانا 🇬🇭",tB:"بنما 🇵🇦",kickoffTime:"2026-06-20T20:00:00Z"},{id:"L3",tA:"إنجلترا 🏴",tB:"غانا 🇬🇭",kickoffTime:"2026-06-26T13:00:00Z"},{id:"L4",tA:"كرواتيا 🇭🇷",tB:"بنما 🇵🇦",kickoffTime:"2026-06-26T20:00:00Z"},{id:"L5",tA:"إنجلترا 🏴",tB:"بنما 🇵🇦",kickoffTime:"2026-06-30T15:00:00Z"},{id:"L6",tA:"غانا 🇬🇭",tB:"كرواتيا 🇭🇷",kickoffTime:"2026-06-30T18:00:00Z"}] }
};

// =================================================================
// تهيئة الصفحة عند التحميل
// =================================================================
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById('groups-nav');
    if (nav) {
        nav.innerHTML = "";
        Object.keys(groupsData).forEach(g => {
            let li = document.createElement('li');
            li.textContent = `المجموعة ${g}`;
            li.id = `tab-${g}`;
            if (g === 'A') li.className = 'active-tab';
            li.onclick = () => switchGroup(g);
            nav.appendChild(li);
        });

        let knockoutTab = document.createElement('li');
        knockoutTab.textContent = `🏆 خروج المغلوب`;
        knockoutTab.id = `tab-knockout`;
        knockoutTab.onclick = () => switchToKnockout();
        nav.appendChild(knockoutTab);
    }

    if (currentUser) {
        showApp();
    } else {
        document.getElementById("login-screen").style.display = "flex";
    }

    const pwInput = document.getElementById("password-input");
    if (pwInput) {
        pwInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") loginUser();
        });
    }
});

function switchGroup(g) {
    const oldTab = document.getElementById(`tab-${currentGroup === 'knockout' ? 'knockout' : currentGroup}`);
    if (oldTab) oldTab.classList.remove('active-tab');
    currentGroup = g;
    const newTab = document.getElementById(`tab-${currentGroup}`);
    if (newTab) newTab.classList.add('active-tab');

    document.getElementById('current-group-title').textContent = `⚽ مباريات ${groupsData[g].name}`;
    document.getElementById('groups-view').style.display = "block";
    document.getElementById('knockout-view').style.display = "none";

    loadData();
}

function switchToKnockout() {
    const oldTab = document.getElementById(`tab-${currentGroup === 'knockout' ? 'knockout' : currentGroup}`);
    if (oldTab) oldTab.classList.remove('active-tab');
    currentGroup = 'knockout';
    document.getElementById('tab-knockout').classList.add('active-tab');

    document.getElementById('current-group-title').textContent = `🏆 مرحلة خروج المغلوب`;
    document.getElementById('groups-view').style.display = "none";
    document.getElementById('knockout-view').style.display = "block";
}

function showApp() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("welcome-msg").textContent = `🏆 المتحدي الحالي: ${currentUserDisplay}`;
    loadData();
}

function setLoginError(msg) {
    const el = document.getElementById("login-error");
    if (el) el.textContent = msg;
}

function setAuthMode(mode) {
    authMode = mode;
    setLoginError("");

    document.getElementById("auth-tab-login").classList.toggle("active", mode === "login");
    document.getElementById("auth-tab-signup").classList.toggle("active", mode === "signup");

    const hint = document.getElementById("auth-hint");
    const loginBtn = document.getElementById("login-btn");

    if (mode === "login") {
        hint.textContent = "سجّل دخولك بحسابك الحالي: اكتب اسمك وكلمة السر التي استخدمتها سابقاً.";
        loginBtn.textContent = "دخول 🚀";
    } else {
        hint.textContent = "أنشئ حساباً جديداً: اختر اسماً وكلمة سر جديدين لم تُستخدما من قبل.";
        loginBtn.textContent = "إنشاء الحساب ✨";
    }
}

function loginUser() {
    if (!firebaseReady) {
        setLoginError("⚠️ لم يتم ضبط Firebase بعد. أضف بيانات المشروع في script.js");
        return;
    }

    let rawName = document.getElementById("username-input").value.trim();
    let pass = document.getElementById("password-input").value.trim();
    setLoginError("");

    if (rawName === "" || pass === "") {
        setLoginError("الرجاء كتابة الاسم وكلمة السر معاً!");
        return;
    }
    if (rawName.length > 30) {
        setLoginError("الاسم طويل جداً (30 حرف كحد أقصى).");
        return;
    }
    if (/[\/\.\#\$\[\]]/.test(rawName)) {
        setLoginError("الاسم يحتوي على رموز غير مسموحة (مثل / . # $ [ ]).");
        return;
    }

    let name = rawName.toLowerCase();
    const loginBtn = document.getElementById("login-btn");
    loginBtn.disabled = true;
    loginBtn.textContent = "جاري التحقق...";

    db.collection("users_passwords").doc(name).get().then(doc => {
        if (doc.exists) {
            if (authMode === 'signup') {
                setLoginError("⚠️ هذا الاسم مستخدم بالفعل! إذا كان حسابك، اضغط على «حساب موجود» وادخل كلمة سرك.");
                loginBtn.disabled = false;
                loginBtn.textContent = "إنشاء الحساب ✨";
                return;
            }
            if (doc.data().password === pass) {
                successLogin(name, doc.data().displayName || rawName);
            } else {
                setLoginError("❌ كلمة السر غير صحيحة لهذا الحساب!");
                loginBtn.disabled = false;
                loginBtn.textContent = "دخول 🚀";
            }
        } else {
            if (authMode === 'login') {
                setLoginError("⚠️ لا يوجد حساب بهذا الاسم. إذا كانت هذه أول مرة، اضغط على «حساب جديد».");
                loginBtn.disabled = false;
                loginBtn.textContent = "دخول 🚀";
                return;
            }
            // عند إنشاء حساب جديد، نقوم بتهيئة حقل الترتيب السابق بقيمة افتراضية فارغة
            db.collection("users_passwords").doc(name).set({ password: pass, displayName: rawName, previousRank: null }).then(() => {
                successLogin(name, rawName);
            }).catch(err => {
                console.error(err);
                setLoginError("❌ تعذر إنشاء الحساب. حاول مجدداً.");
                loginBtn.disabled = false;
                loginBtn.textContent = "إنشاء الحساب ✨";
            });
        }
    }).catch(err => {
        console.error(err);
        setLoginError("❌ تعذر الاتصال بقاعدة البيانات. تحقق من اتصالك بالإنترنت.");
        loginBtn.disabled = false;
        loginBtn.textContent = authMode === 'login' ? "دخول 🚀" : "إنشاء الحساب ✨";
    });
}

function successLogin(name, displayName) {
    localStorage.setItem("prediction_user", name);
    localStorage.setItem("prediction_user_display", displayName || name);
    currentUser = name;
    currentUserDisplay = displayName || name;
    showApp();
}

function logoutUser() {
    localStorage.removeItem("prediction_user");
    localStorage.removeItem("prediction_user_display");
    currentUser = "";
    currentUserDisplay = "";
    currentMode = 'predict';

    if (timerInterval) clearInterval(timerInterval);

    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-predict-mode').classList.add('active');

    document.getElementById("username-input").value = "";
    document.getElementById("password-input").value = "";
    setAuthMode('login');

    const loginBtn = document.getElementById("login-btn");
    loginBtn.disabled = false;
    document.getElementById("login-screen").style.display = "flex";
}

function setMode(mode) {
    if (mode === 'real') {
        let password = prompt("أدخل رمز المالك لتسجيل النتائج الحقيقية:");
        if (password === null) return;
        if (password !== ADMIN_PASSWORD) {
            alert("❌ رمز غير صحيح!");
            return;
        }
    }
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${mode}-mode`).classList.add('active');

    const saveBtn = document.getElementById('save-btn');
    saveBtn.textContent = mode === 'real' ? "💾 حفظ النتائج الحقيقية" : "حفظ وقفل التوقعات 💾";
    loadData();
}

function loadData() {
    if (!groupsData[currentGroup]) return;
    if (!firebaseReady) {
        renderMatchesLayout({}, {});
        calculateSystem({}, {});
        return;
    }

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let realResults = realDoc.exists ? realDoc.data() : {};
        db.collection("worldcup2026").doc(`predict_${currentUser}`).get().then(userDoc => {
            let userPredictions = userDoc.exists ? userDoc.data() : {};

            autoFillMissedPredictions(currentGroup, realResults, userPredictions).then(updatedPredictions => {
                renderMatchesLayout(realResults, updatedPredictions);
                calculateSystem(realResults, updatedPredictions);
            });
        }).catch(err => {
            console.error(err);
            renderMatchesLayout(realResults, {});
            calculateSystem(realResults, {});
        });
    }).catch(err => {
        console.error(err);
        renderMatchesLayout({}, {});
        calculateSystem({}, {});
    });
    updateLeaderboard();
}

function autoFillMissedPredictions(groupKey, realResults, userPredictions) {
    let toSave = {};
    let changed = false;

    groupsData[groupKey].matches.forEach(m => {
        const real = realResults[m.id];
        const realIsSet = real && isValidScore(real.a) && isValidScore(real.b);
        if (!realIsSet) return; 

        const pred = userPredictions[m.id];
        const predIsSet = pred && isValidScore(pred.a) && isValidScore(pred.b);
        if (predIsSet) return; 

        userPredictions[m.id] = { a: real.a, b: real.b, auto: true, isJoker: false };
        toSave[m.id] = { a: real.a, b: real.b, auto: true, isJoker: false };
        changed = true;
    });

    if (!changed || !firebaseReady || !currentUser) {
        return Promise.resolve(userPredictions);
    }

    return db.collection("worldcup2026").doc(`predict_${currentUser}`)
        .set(toSave, { merge: true })
        .then(() => userPredictions)
        .catch(err => {
            console.error("فشل حفظ التعبئة التلقائية:", err);
            return userPredictions; 
        });
}

// 3️⃣ تفعيل العداد والتحقق المستمر لقفل الإدخال تلقائياً قبل البدء بـ 15 دقيقة
function startCountdownTimers() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        const elements = document.querySelectorAll('.countdown-timer-span');
        let currentGroupMatches = groupsData[currentGroup]?.matches || [];
        
        elements.forEach(el => {
            let kickoffStr = el.getAttribute('data-kickoff');
            if (!kickoffStr) return;
            
            let kickoffTime = new Date(kickoffStr).getTime();
            let now = Date.now();
            let timeUntilLock = kickoffTime - 15 * 60 * 1000 - now; // الوقت المتبقي حتى موعد القفل (قبل 15 دقيقة من الركلة)

            if (timeUntilLock <= 0) {
                el.innerHTML = `<span class="locked-text">🔒 مقفلة الآن</span>`;
                // قفل الحقول المرتبطة بها في المتصفح فوراً دون الحاجة لإعادة التحديث
                let mId = el.getAttribute('data-match-id');
                let inpA = document.getElementById(`inputA-${mId}`);
                let inpB = document.getElementById(`inputB-${mId}`);
                let jBtn = document.getElementById(`joker-btn-${mId}`);
                if (inpA && currentMode === 'predict') inpA.disabled = true;
                if (inpB && currentMode === 'predict') inpB.disabled = true;
                if (jBtn && currentMode === 'predict') jBtn.disabled = true;
            } else {
                let days = Math.floor(timeUntilLock / (1000 * 60 * 60 * 24));
                let hours = Math.floor((timeUntilLock % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((timeUntilLock % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((timeUntilLock % (1000 * 60)) / 1000);
                
                let countdownStr = "⏳ يغلق بعد: ";
                if (days > 0) countdownStr += `${days} يوم و `;
                countdownStr += `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                el.innerHTML = `<span class="timer-active">${countdownStr}</span>`;
            }
        });

        // إخفاء زر الحفظ بالكامل إذا كانت جميع المباريات في هذه المجموعة مقفلة التوقع
        if (currentMode === 'predict' && currentGroup !== 'knockout') {
            let disabledInputs = document.querySelectorAll('.score-input:not(:disabled)');
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                if (disabledInputs.length === 0) {
                    saveBtn.style.display = 'none';
                } else {
                    saveBtn.style.display = 'block';
                }
            }
        }
    }, 1000);
}

function renderMatchesLayout(realResults, userPredictions) {
    const container = document.getElementById('matches-list');
    if (!container) return;
    container.innerHTML = "";

    let anyActiveInputs = false;

    groupsData[currentGroup].matches.forEach(m => {
        let isRealExist = (realResults[m.id] && realResults[m.id].a !== undefined && realResults[m.id].a !== "");
        let saved = currentMode === 'real' ? (realResults[m.id] || { a: "", b: "" }) : (userPredictions[m.id] || { a: "", b: "", isJoker: false });

        // 3️⃣ التحقق من موعد المباراة لقفل الحقول تلقائياً قبل الركلة بـ 15 دقيقة
        let kickoff = m.kickoffTime ? new Date(m.kickoffTime).getTime() : 0;
        let isTimeLocked = kickoff ? (kickoff - Date.now() <= 15 * 60 * 1000) : false;

        let isDisabled = "";
        if (isRealExist) {
            isDisabled = "disabled";
        } else if (isTimeLocked && currentMode === 'predict') {
            isDisabled = "disabled";
        }

        if (!isDisabled) anyActiveInputs = true;

        let lockNote = "";
        if (isRealExist) {
            lockNote = currentMode === 'real'
                ? `<span class="match-locked-note">🔒 النتيجة محفوظة بشكل نهائي - لا يمكن تعديلها</span>`
                : `<span class="match-locked-note">🔒 انتهت المباراة - التوقع مقفل</span>`;
        } else if (isTimeLocked && currentMode === 'predict') {
            lockNote = `<span class="match-locked-note locked-text">🔒 مقفلة (بدأت أو تبقت أقل من 15 دقيقة)</span>`;
        } else if (m.kickoffTime) {
            lockNote = `<span class="match-locked-note countdown-timer-span" data-match-id="${m.id}" data-kickoff="${m.kickoffTime}">⏳ جاري حساب الوقت...</span>`;
        }

        // 1️⃣ إضافة واجهة مستخدم زر الجوكر التفاعلي
        let jokerHtml = "";
        if (currentMode === 'predict') {
            let isJokerActive = saved.isJoker ? "active" : "";
            jokerHtml = `
                <button class="joker-btn ${isJokerActive}" id="joker-btn-${m.id}" onclick="toggleJoker('${m.id}')" ${isDisabled}>
                    🃏 <span class="joker-label">جوكر التحدي</span>
                </button>
            `;
        }

        container.innerHTML += `
            <div class="match-box">
                <span class="team-name">${escapeHtml(m.tA)}</span>
                <div class="vs-inputs-wrap">
                    <div class="vs-inputs">
                        <input type="number" min="0" step="1" ${isDisabled} class="score-input" id="inputA-${m.id}" value="${saved.a !== undefined ? saved.a : ''}">
                        <span class="vs-text">ضد</span>
                        <input type="number" min="0" step="1" ${isDisabled} class="score-input" id="inputB-${m.id}" value="${saved.b !== undefined ? saved.b : ''}">
                    </div>
                    <div class="match-status-bar">
                        ${jokerHtml}
                        ${lockNote}
                    </div>
                </div>
                <span class="team-name">${escapeHtml(m.tB)}</span>
            </div>
        `;
    });

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        if (!anyActiveInputs && currentMode === 'predict') {
            saveBtn.style.display = 'none';
        } else {
            saveBtn.style.display = 'block';
        }
    }

    startCountdownTimers();
}

// 1️⃣ تفعيل اختيار جوكر واحد فقط لكل مجموعة وسحب البقية تلقائياً
function toggleJoker(matchId) {
    const clickedBtn = document.getElementById(`joker-btn-${matchId}`);
    if (!clickedBtn || clickedBtn.hasAttribute('disabled')) return;

    const isCurrentlyActive = clickedBtn.classList.contains('active');

    // إزالة تفعيل أي جوكر آخر مفعل في واجهة المجموعة الحالية فوراً
    groupsData[currentGroup].matches.forEach(m => {
        const btn = document.getElementById(`joker-btn-${m.id}`);
        if (btn) btn.classList.remove('active');
    });

    // تفعيل الزر المختار فقط إذا لم يكن مفعلاً سابقاً
    if (!isCurrentlyActive) {
        clickedBtn.classList.add('active');
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function isValidScore(value) {
    if (value === "" || value === null || value === undefined) return false;
    if (!/^\d+$/.test(String(value).trim())) return false;
    return true;
}

// 1️⃣ تحديث آلية احتساب النقاط وتضمين مضاعف الجوكر المختار بنجاح
function pointsForPrediction(pa, pb, ra, rb, isAuto, isJoker = false) {
    if (isAuto) return 0;
    let pts = 0;
    if (pa === ra && pb === rb) {
        pts = 3;
    } else {
        const predictedOutcome = pa > pb ? 'A' : (pb > pa ? 'B' : 'D');
        const realOutcome = ra > rb ? 'A' : (rb > ra ? 'B' : 'D');
        if (predictedOutcome === realOutcome) pts = 1;
    }

    // مضاعفة النقاط كاملة إذا تم تحديد المباراة كجوكر بنجاح
    if (isJoker) pts *= 2;
    return pts;
}

function computeGroupOrder(groupKey, resultsObj) {
    let stats = {};
    groupsData[groupKey].teams.forEach(t => { stats[t] = { name: t, pts: 0 }; });

    let matchesWithResult = 0;
    groupsData[groupKey].matches.forEach(m => {
        const res = resultsObj[m.id];
        if (res && isValidScore(res.a) && isValidScore(res.b)) {
            matchesWithResult++;
            let a = parseInt(res.a, 10), b = parseInt(res.b, 10);
            if (a > b) stats[m.tA].pts += 3;
            else if (b > a) stats[m.tB].pts += 3;
            else { stats[m.tA].pts += 1; stats[m.tB].pts += 1; }
        }
    });

    const isComplete = matchesWithResult === groupsData[groupKey].matches.length;
    const sorted = Object.values(stats).sort((x, y) => y.pts - x.pts);

    let hasTie = false;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].pts === sorted[i + 1].pts) { hasTie = true; break; }
    }

    return { order: sorted.map(s => s.name), isComplete, hasTie };
}

function computeGroupBonus(groupKey, realResults, userPredictions) {
    const real = computeGroupOrder(groupKey, realResults);
    if (!real.isComplete || real.hasTie) return 0;

    const predicted = computeGroupOrder(groupKey, userPredictions);
    if (predicted.hasTie) return 0;

    const exactMatch = real.order.every((team, i) => team === predicted.order[i]);
    return exactMatch ? 3 : 0;
}

function saveDataToCloud() {
    if (!firebaseReady) {
        alert("⚠️ لم يتم ضبط Firebase. لا يمكن الحفظ الآن.");
        return;
    }

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let latestRealResults = realDoc.exists ? realDoc.data() : {};

        let dataToSave = {};
        let hasInvalid = false;
        let blockedLockedMatch = false;

        groupsData[currentGroup].matches.forEach(m => {
            const inputA = document.getElementById(`inputA-${m.id}`);
            const inputB = document.getElementById(`inputB-${m.id}`);
            if (!inputA || !inputB) return;

            const realM = latestRealResults[m.id];
            const isLocked = realM && isValidScore(realM.a) && isValidScore(realM.b);

            // 3️⃣ التحقق الأمني السحابي لقفل المباراة لمنع التلاعب البرمي بالواجهة
            let kickoff = m.kickoffTime ? new Date(m.kickoffTime).getTime() : 0;
            let isTimeLocked = kickoff ? (kickoff - Date.now() <= 15 * 60 * 1000) : false;

            if (isLocked || (isTimeLocked && currentMode === 'predict')) {
                blockedLockedMatch = true;
                return; 
            }

            const valA = inputA.value.trim();
            const valB = inputB.value.trim();

            // 1️⃣ جلب وتجهيز متغير حفظ الجوكر وحفظه بداخل كائن التوقع الحالي
            let isJoker = false;
            if (currentMode === 'predict') {
                const jokerBtn = document.getElementById(`joker-btn-${m.id}`);
                if (jokerBtn && jokerBtn.classList.contains('active')) {
                    isJoker = true;
                }
            }

            inputA.classList.remove('invalid');
            inputB.classList.remove('invalid');

            if (valA === "" && valB === "") {
                dataToSave[m.id] = currentMode === 'real' ? { a: "", b: "" } : { a: "", b: "", isJoker: false };
                return;
            }

            if (!isValidScore(valA) || !isValidScore(valB)) {
                inputA.classList.add('invalid');
                inputB.classList.add('invalid');
                hasInvalid = true;
                return;
            }

            dataToSave[m.id] = { a: valA, b: valB };
            if (currentMode === 'predict') {
                dataToSave[m.id].isJoker = isJoker;
            }
        });

        if (hasInvalid) {
            alert("⚠️ تحقق من النتائج: يجب إدخال أعداد صحيحة غير سالبة لكل مباراة.");
            return;
        }

        let docName = currentMode === 'real' ? "real_results" : `predict_${currentUser}`;
        db.collection("worldcup2026").doc(docName).set(dataToSave, { merge: true }).then(() => {
            if (blockedLockedMatch) {
                alert("💾 تم الحفظ. ملاحظة: بعض المباريات كانت مقفلة أو انتهى وقت توقعها فلم يتم تعديلها.");
            } else {
                alert("💾 تم حفظ وإرسال البيانات بنجاح!");
            }
            loadData();
        }).catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء الحفظ. تحقق من الاتصال.");
        });
    }).catch(err => {
        console.error(err);
        alert("❌ تعذر التحقق من حالة المباريات. حاول مجدداً.");
    });
}

function calculateSystem(realResults, userPredictions) {
    let teamStats = {};
    groupsData[currentGroup].teams.forEach(t => {
        teamStats[t] = { name: t, pPoints: 0, rPoints: 0, played: 0 };
    });

    let challengePoints = 0;
    groupsData[currentGroup].matches.forEach(m => {
        const p = userPredictions[m.id] || { a: "", b: "", isJoker: false };
        const r = realResults[m.id] || { a: "", b: "" };

        const predictionExists = isValidScore(p.a) && isValidScore(p.b);
        const realExists = isValidScore(r.a) && isValidScore(r.b);

        if (predictionExists) {
            let pa = parseInt(p.a, 10), pb = parseInt(p.b, 10);
            if (pa > pb) teamStats[m.tA].pPoints += 3;
            else if (pb > pa) teamStats[m.tB].pPoints += 3;
            else { teamStats[m.tA].pPoints += 1; teamStats[m.tB].pPoints += 1; }
        }

        if (realExists) {
            teamStats[m.tA].played += 1;
            teamStats[m.tB].played += 1;
            let ra = parseInt(r.a, 10), rb = parseInt(r.b, 10);
            if (ra > rb) teamStats[m.tA].rPoints += 3;
            else if (rb > ra) teamStats[m.tB].rPoints += 3;
            else { teamStats[m.tA].rPoints += 1; teamStats[m.tB].rPoints += 1; }

            if (predictionExists) {
                let pa = parseInt(p.a, 10), pb = parseInt(p.b, 10);
                // 1️⃣ تمرير حالة حقل الجوكر لحساب النقاط الفورية المعروضة
                challengePoints += pointsForPrediction(pa, pb, ra, rb, p.auto, p.isJoker || false);
            }
        }
    });

    const groupBonus = computeGroupBonus(currentGroup, realResults, userPredictions);
    challengePoints += groupBonus;

    const badge = document.getElementById('accuracy-badge');
    if (badge) {
        badge.textContent = currentMode === 'real'
            ? `👑 أنت في وضع إدخال النتائج الحقيقية لمجموعة ${currentGroup}`
            : `🎯 نقاط تحدي التوقعات الخاصة بك في هذه المجموعة: ${challengePoints} نقطة`;
    }

    const bonusBadge = document.getElementById('group-bonus-badge');
    if (bonusBadge) {
        if (currentMode === 'real') {
            bonusBadge.style.display = "none";
        } else if (groupBonus > 0) {
            bonusBadge.style.display = "block";
            bonusBadge.textContent = `🏆 مبروك! توقعت ترتيب هذه المجموعة بالكامل بشكل صحيح: +3 نقاط`;
        } else {
            bonusBadge.style.display = "none";
        }
    }

    let sorted = Object.values(teamStats).sort((a, b) => b.rPoints - a.rPoints || b.pPoints - a.pPoints);
    const tbody = document.getElementById('table-body');
    if (tbody) {
        tbody.innerHTML = "";
        sorted.forEach((t, i) => {
            tbody.innerHTML += `<tr>
                <td><span class="position">${i + 1}</span></td>
                <td>${escapeHtml(t.name)}</td>
                <td>${t.played}</td>
                <td>${t.pPoints}</td>
                <td style="color:var(--blue-glow)">${t.rPoints}</td>
            </tr>`;
        });
    }
}

const ADMIN_USERNAME = "boukhalfa anes";

const matchIdToGroup = {};
Object.keys(groupsData).forEach(g => {
    groupsData[g].matches.forEach(m => { matchIdToGroup[m.id] = g; });
});

// 2️⃣ حساب جدول الترتيب العام، تحديد المؤشرات وتحديث الترتيب السابق في قاعدة البيانات بـ Batch
function updateLeaderboard() {
    if (!firebaseReady) return;

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let real = realDoc.exists ? realDoc.data() : {};

        db.collection("worldcup2026").get().then(querySnapshot => {
            let scores = [];
            querySnapshot.forEach(doc => {
                if (doc.id.startsWith("predict_")) {
                    let user = doc.id.replace("predict_", "");

                    if (user.toLowerCase() === ADMIN_USERNAME) return;

                    let userPreds = doc.data();
                    let totalPoints = 0;

                    Object.keys(real).forEach(mId => {
                        const realResult = real[mId];
                        const userPred = userPreds[mId];
                        if (
                            userPred && isValidScore(userPred.a) && isValidScore(userPred.b) &&
                            realResult && isValidScore(realResult.a) && isValidScore(realResult.b)
                        ) {
                            let pa = parseInt(userPred.a, 10), pb = parseInt(userPred.b, 10);
                            let ra = parseInt(realResult.a, 10), rb = parseInt(realResult.b, 10);
                            // 1️⃣ قراءة وحساب مضاعفات نقاط الجوكر المدخرة في قاعدة البيانات لكل مستخدم
                            totalPoints += pointsForPrediction(pa, pb, ra, rb, userPred.auto, userPred.isJoker || false);
                        }
                    });

                    Object.keys(groupsData).forEach(g => {
                        totalPoints += computeGroupBonus(g, real, userPreds);
                    });

                    scores.push({ user, points: totalPoints });
                }
            });

            if (scores.length === 0) {
                renderLeaderboard([]);
                return;
            }

            Promise.all(
                scores.map(s =>
                    db.collection("users_passwords").doc(s.user).get().then(udoc => {
                        let udata = udoc.exists ? udoc.data() : {};
                        return {
                            id: s.user,
                            name: udata.displayName || s.user,
                            points: s.points,
                            previousRank: udata.previousRank !== undefined ? udata.previousRank : null
                        };
                    }).catch(() => ({ id: s.user, name: s.user, points: s.points, previousRank: null }))
                )
            ).then(finalScores => {
                // ترتيب المتنافسين تنازلياً حسب إجمالي النقاط
                finalScores.sort((a, b) => b.points - a.points);

                let batch = db.batch();
                let updatedAny = false;

                finalScores.forEach((s, index) => {
                    let currentRank = index + 1;
                    
                    // مقارنة الترتيب الحالي بالترتيب المدخر لتحديد الاتجاه
                    if (s.previousRank === null) {
                        s.trend = "same";
                    } else if (currentRank < s.previousRank) {
                        s.trend = "up"; // تقدم للأعلى (مثال: من المركز 4 إلى المركز 2)
                    } else if (currentRank > s.previousRank) {
                        s.trend = "down"; // تراجع للخلف
                    } else {
                        s.trend = "same"; // استقرار في المركز
                    }

                    // تحديث الترتيب الحالي في السحاب ليكون جاهزاً للتحديث القادم مجدداً
                    if (s.previousRank !== currentRank) {
                        let uRef = db.collection("users_passwords").doc(s.id);
                        batch.set(uRef, { previousRank: currentRank }, { merge: true });
                        updatedAny = true;
                    }
                });

                if (updatedAny) {
                    batch.commit().catch(err => console.error("خطأ أثناء تحديث المراكز السابقة:", err));
                }

                renderLeaderboard(finalScores);
            });
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
}

function renderLeaderboard(scores) {
    const listContainer = document.getElementById("leaderboard-list");
    if (!listContainer) return;

    const filteredScores = scores.filter(s => (s.name || "").trim().toLowerCase() !== ADMIN_USERNAME);

    listContainer.innerHTML = "";
    if (filteredScores.length === 0) {
        listContainer.innerHTML = `<li class="empty-msg">لا يوجد متسابقون بعد</li>`;
    } else {
        filteredScores.forEach(s => {
            // 2️⃣ بناء وتعيين أيقونة مؤشر الصعود والهبوط والتحكم بفئاتها الديناميكية في CSS
            let trendIcon = "▬";
            let trendClass = "trend-same";
            if (s.trend === "up") { trendIcon = "▲"; trendClass = "trend-up"; }
            if (s.trend === "down") { trendIcon = "▼"; trendClass = "trend-down"; }

            listContainer.innerHTML += `
                <li>
                    <span><span class="trend ${trendClass}">${trendIcon}</span> 👤 ${escapeHtml(s.name)}</span> 
                    <span>${s.points} ن</span>
                </li>`;
        });
    }
}
