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

// كلمة مرور المالك (2026) للتحكم بالقفل الفردي للمباريات وتسجيل النتائج
const ADMIN_PASSWORD = "2026";

let firebaseReady = false;
let db = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;
} catch (e) {
    console.error("فشل الاتصال بـ Firebase.", e);
}

let currentUser = localStorage.getItem("prediction_user") || "";
let currentUserDisplay = localStorage.getItem("prediction_user_display") || currentUser;
let currentGroup = 'A';
let currentMode = 'predict';
let authMode = 'login'; 

// بيانات المجموعات (لا توجد توقيتات)
const groupsData = {
    A: { name: "المجموعة الأولى", teams: ["المكسيك 🇲🇽", "جنوب إفريقيا 🇿🇦", "كوريا الجنوبية 🇰🇷", "جمهورية التشيك 🇨🇿"],
         matches: [{id:"A1",tA:"المكسيك 🇲🇽",tB:"جنوب إفريقيا 🇿🇦"},{id:"A2",tA:"كوريا الجنوبية 🇰🇷",tB:"جمهورية التشيك 🇨🇿"},{id:"A3",tA:"المكسيك 🇲🇽",tB:"كوريا الجنوبية 🇰🇷"},{id:"A4",tA:"جنوب إفريقيا 🇿🇦",tB:"جمهورية التشيك 🇨🇿"},{id:"A5",tA:"المكسيك 🇲🇽",tB:"جمهورية التشيك 🇨🇿"},{id:"A6",tA:"كوريا الجنوبية 🇰🇷",tB:"جنوب إفريقيا 🇿🇦"}] },
    B: { name: "المجموعة الثانية", teams: ["كندا 🇨🇦", "البوسنة والهرسك 🇧🇦", "قطر 🇶🇦", "سويسرا 🇨🇭"],
         matches: [{id:"B1",tA:"كندا 🇨🇦",tB:"البوسنة والهرسك 🇧🇦"},{id:"B2",tA:"قطر 🇶🇦",tB:"سويسرا 🇨🇭"},{id:"B3",tA:"كندا 🇨🇦",tB:"قطر 🇶🇦"},{id:"B4",tA:"البوسنة والهرسك 🇧🇦",tB:"سويسرا 🇨🇭"},{id:"B5",tA:"كندا 🇨🇦",tB:"سويسرا 🇨🇭"},{id:"B6",tA:"قطر 🇶🇦",tB:"البوسنة والهرسك 🇧🇦"}] },
    C: { name: "المجموعة الثالثة", teams: ["البرازيل 🇧🇷", "المغرب 🇲🇦", "هايتي 🇭🇹", "اسكتلندا 🏴"],
         matches: [{id:"C1",tA:"البرازيل 🇧🇷",tB:"المغرب 🇲🇦"},{id:"C2",tA:"هايتي 🇭🇹",tB:"اسكتلندا 🏴"},{id:"C3",tA:"البرازيل 🇧🇷",tB:"هايتي 🇭🇹"},{id:"C4",tA:"المغرب 🇲🇦",tB:"اسكتلندا 🏴"},{id:"C5",tA:"البرازيل 🇧🇷",tB:"اسكتلندا 🏴"},{id:"C6",tA:"هايتي 🇭🇹",tB:"المغرب 🇲🇦"}] },
    D: { name: "المجموعة الرابعة", teams: ["الولايات المتحدة 🇺🇸", "باراغواي 🇵🇾", "أستراليا 🇦🇺", "تركيا 🇹🇷"],
         matches: [{id:"D1",tA:"الولايات المتحدة 🇺🇸",tB:"باراغواي 🇵🇾"},{id:"D2",tA:"أستراليا 🇦🇺",tB:"تركيا 🇹🇷"},{id:"D3",tA:"الولايات المتحدة 🇺🇸",tB:"أستراليا 🇦🇺"},{id:"D4",tA:"باراغواي 🇵🇾",tB:"تركيا 🇹🇷"},{id:"D5",tA:"الولايات المتحدة 🇺🇸",tB:"تركيا 🇹🇷"},{id:"D6",tA:"أستراليا 🇦🇺",tB:"باراغواي 🇵🇾"}] },
    E: { name: "المجموعة الخامسة", teams: ["ألمانيا 🇩🇪", "كوراساو 🇨🇼", "كوت ديفوار 🇨🇮", "الإكوادور 🇪🇨"],
         matches: [{id:"E1",tA:"ألمانيا 🇩🇪",tB:"كوراساو 🇨🇼"},{id:"E2",tA:"كوت ديفوار 🇨🇮",tB:"الإكوادور 🇪🇨"},{id:"E3",tA:"ألمانيا 🇩🇪",tB:"كوت ديفوار 🇨🇮"},{id:"E4",tA:"كوراساو 🇨🇼",tB:"الإكوادور 🇪🇨"},{id:"E5",tA:"ألمانيا 🇩🇪",tB:"الإكوادور 🇪🇨"},{id:"E6",tA:"كوت ديفوار 🇨🇮",tB:"كوراساو 🇨🇼"}] },
    F: { name: "المجموعة السادسة", teams: ["هولندا 🇳🇱", "اليابان 🇯🇵", "السويد 🇸🇪", "تونس 🇹🇳"],
         matches: [{id:"F1",tA:"هولندا 🇳🇱",tB:"اليابان 🇯🇵"},{id:"F2",tA:"السويد 🇸🇪",tB:"تونس 🇹🇳"},{id:"F3",tA:"هولندا 🇳🇱",tB:"السويد 🇸🇪"},{id:"F4",tA:"اليابان 🇯🇵",tB:"تونس 🇹🇳"},{id:"F5",tA:"هولندا 🇳🇱",tB:"تونس 🇹🇳"},{id:"F6",tA:"السويد 🇸🇪",tB:"اليابان 🇯🇵"}] },
    G: { name: "المجموعة السابعة", teams: ["بلجيكا 🇧🇪", "مصر 🇪🇬", "إيران 🇮🇷", "نيوزيلندا 🇳🇿"],
         matches: [{id:"G1",tA:"بلجيكا 🇧🇪",tB:"مصر 🇪🇬"},{id:"G2",tA:"إيران 🇮🇷",tB:"نيوزيلندا 🇳🇿"},{id:"G3",tA:"بلجيكا 🇧🇪",tB:"إيران 🇮🇷"},{id:"G4",tA:"مصر 🇪🇬",tB:"نيوزيلندا 🇳🇿"},{id:"G5",tA:"بلجيكا 🇧🇪",tB:"نيوزيلندا 🇳🇿"},{id:"G6",tA:"إيران 🇮🇷",tB:"مصر 🇪🇬"}] },
    H: { name: "المجموعة الثامنة", teams: ["إسبانيا 🇪🇸", "الرأس الأخضر 🇨🇻", "السعودية 🇸🇦", "الأوروغواي 🇺🇾"],
         matches: [{id:"H1",tA:"إسبانيا 🇪🇸",tB:"الرأس الأخضر 🇨🇻"},{id:"H2",tA:"السعودية 🇸🇦",tB:"الأوروغواي 🇺🇾"},{id:"H3",tA:"إسبانيا 🇪🇸",tB:"السعودية 🇸🇦"},{id:"H4",tA:"الرأس الأخضر 🇨🇻",tB:"الأوروغواي 🇺🇾"},{id:"H5",tA:"إسبانيا 🇪🇸",tB:"الأوروغواي 🇺🇾"},{id:"H6",tA:"السعودية 🇸🇦",tB:"الرأس الأخضر 🇨🇻"}] },
    I: { name: "المجموعة التاسعة", teams: ["فرنسا 🇫🇷", "السنغال 🇸🇳", "العراق 🇮🇶", "النرويج 🇳🇴"],
         matches: [{id:"I1",tA:"فرنسا 🇫🇷",tB:"السنغال 🇸🇳"},{id:"I2",tA:"العراق 🇮🇶",tB:"النرويج 🇳🇴"},{id:"I3",tA:"فرنسا 🇫🇷",tB:"العراق 🇮🇶"},{id:"I4",tA:"السنغال 🇸🇳",tB:"النرويج 🇳🇴"},{id:"I5",tA:"فرنسا 🇫🇷",tB:"النرويج 🇳🇴"},{id:"I6",tA:"العراق 🇮🇶",tB:"السنغال 🇸🇳"}] },
    J: { name: "المجموعة العاشرة", teams: ["الأرجنتين 🇦🇷", "الجزائر 🇩🇿", "النمسا 🇦🇹", "الأردن 🇯🇴"],
         matches: [{id:"J1",tA:"الأرجنتين 🇦🇷",tB:"الجزائر 🇩🇿"},{id:"J2",tA:"النمسا 🇦🇹",tB:"الأردن 🇯🇴"},{id:"J3",tA:"الأرجنتين 🇦🇷",tB:"النمسا 🇦🇹"},{id:"J4",tA:"الجزائر 🇩🇿",tB:"الأردن 🇯🇴"},{id:"J5",tA:"الأرجنتين 🇦🇷",tB:"الأردن 🇯🇴"},{id:"J6",tA:"النمسا 🇦🇹",tB:"الجزائر 🇩🇿"}] },
    K: { name: "المجموعة الحادية عشرة", teams: ["البرتغال 🇵🇹", "الكونغو الديمقراطية 🇨🇩", "أوزبكستان 🇺🇿", "كولومبيا 🇨🇴"],
         matches: [{id:"K1",tA:"البرتغال 🇵🇹",tB:"الكونغو الديمقراطية 🇨🇩"},{id:"K2",tA:"أوزبكستان 🇺🇿",tB:"كولومبيا 🇨🇴"},{id:"K3",tA:"البرتغال 🇵🇹",tB:"أوزبكستان 🇺🇿"},{id:"K4",tA:"الكونغو الديمقراطية 🇨🇩",tB:"كولومبيا 🇨🇴"},{id:"K5",tA:"البرتغال 🇵🇹",tB:"كولومبيا 🇨🇴"},{id:"K6",tA:"أوزبكستان 🇺🇿",tB:"الكونغو الديمقراطية 🇨🇩"}] },
    L: { name: "المجموعة الثانية عشرة", teams: ["إنجلترا 🏴", "كرواتيا 🇭🇷", "غانا 🇬🇭", "بنما 🇵🇦"],
         matches: [{id:"L1",tA:"إنجلترا 🏴",tB:"كرواتيا 🇭🇷"},{id:"L2",tA:"غانا 🇬🇭",tB:"بنما 🇵🇦"},{id:"L3",tA:"إنجلترا 🏴",tB:"غانا 🇬🇭"},{id:"L4",tA:"كرواتيا 🇭🇷",tB:"بنما 🇵🇦"},{id:"L5",tA:"إنجلترا 🏴",tB:"بنما 🇵🇦"},{id:"L6",tA:"غانا 🇬🇭",tB:"كرواتيا 🇭🇷"}] }
};

// =================================================================
// وظيفة الإدارة: تغيير اسم عرض اللاعب (Moderation)
// =================================================================
function renameUserByAdmin() {
    let targetId = document.getElementById("admin-target-id").value.trim().toLowerCase();
    let newName = document.getElementById("admin-new-name").value.trim();

    if (!targetId || !newName) {
        alert("⚠️ الرجاء إدخال اسم الحساب الأصلي والاسم اللائق الجديد.");
        return;
    }

    db.collection("users_passwords").doc(targetId).get().then(doc => {
        if (!doc.exists) {
            alert("❌ لم يتم العثور على حساب بهذا الاسم. (تأكد من كتابة الـ ID بدقة).");
            return;
        }

        db.collection("users_passwords").doc(targetId).update({
            displayName: newName
        }).then(() => {
            alert(`✅ تم تغيير الاسم في جدول الترتيب بنجاح إلى: ${newName}`);
            document.getElementById("admin-target-id").value = "";
            document.getElementById("admin-new-name").value = "";
            updateLeaderboard(); 
        }).catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء التحديث.");
        });
    }).catch(err => {
        console.error(err);
        alert("❌ تعذر الاتصال بقاعدة البيانات.");
    });
}

// =================================================================
// وظيفة الإدارة الفردية: قفل/فتح التوقعات لكل مباراة على حدة
// =================================================================
function toggleMatchLock(matchId, isCurrentlyLocked) {
    if (!firebaseReady) return;
    let newState = !isCurrentlyLocked;

    db.collection("worldcup2026").doc("real_results").get().then(doc => {
        let data = doc.exists ? doc.data() : {};
        let matchData = data[matchId] || { a: "", b: "" };
        matchData.isLocked = newState; // تحديث حالة القفل في السحابة
        
        db.collection("worldcup2026").doc("real_results").set({
            [matchId]: matchData
        }, { merge: true }).then(() => {
            loadData(); // إعادة تحميل الواجهة لتحديث الزر
        }).catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء محاولة تعديل قفل المباراة.");
        });
    });
}

// =================================================================
// تهيئة وتشغيل الصفحة
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

    if (currentUser) showApp();
    else document.getElementById("login-screen").style.display = "flex";

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
    if (newTab) newTab.className = 'active-tab';

    document.getElementById('current-group-title').textContent = `⚽ مباريات ${groupsData[g].name}`;
    document.getElementById('groups-view').style.display = "block";
    document.getElementById('knockout-view').style.display = "none";

    loadData();
}

function switchToKnockout() {
    const oldTab = document.getElementById(`tab-${currentGroup === 'knockout' ? 'knockout' : currentGroup}`);
    if (oldTab) oldTab.classList.remove('active-tab');
    currentGroup = 'knockout';
    document.getElementById('tab-knockout').className = 'active-tab';

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
        setLoginError("⚠️ لم يتم ضبط Firebase بعد.");
        return;
    }

    let rawName = document.getElementById("username-input").value.trim();
    let pass = document.getElementById("password-input").value.trim();
    setLoginError("");

    if (rawName === "" || pass === "") return setLoginError("الرجاء كتابة الاسم وكلمة السر معاً!");
    if (rawName.length > 30) return setLoginError("الاسم طويل جداً (30 حرف كحد أقصى).");
    if (/[\/\.\#\$\[\]]/.test(rawName)) return setLoginError("الاسم يحتوي على رموز غير مسموحة.");

    let name = rawName.toLowerCase();
    const loginBtn = document.getElementById("login-btn");
    loginBtn.disabled = true;
    loginBtn.textContent = "جاري التحقق...";

    db.collection("users_passwords").doc(name).get().then(doc => {
        if (doc.exists) {
            if (authMode === 'signup') {
                setLoginError("⚠️ هذا الاسم مستخدم بالفعل! اضغط على «حساب موجود».");
                loginBtn.disabled = false; loginBtn.textContent = "إنشاء الحساب ✨"; return;
            }
            if (doc.data().password === pass) successLogin(name, doc.data().displayName || rawName);
            else {
                setLoginError("❌ كلمة السر غير صحيحة!");
                loginBtn.disabled = false; loginBtn.textContent = "دخول 🚀";
            }
        } else {
            if (authMode === 'login') {
                setLoginError("⚠️ لا يوجد حساب بهذا الاسم. اضغط على «حساب جديد».");
                loginBtn.disabled = false; loginBtn.textContent = "دخول 🚀"; return;
            }
            db.collection("users_passwords").doc(name).set({ password: pass, displayName: rawName, previousPosition: "" }).then(() => {
                successLogin(name, rawName);
            }).catch(err => {
                setLoginError("❌ تعذر إنشاء الحساب.");
                loginBtn.disabled = false; loginBtn.textContent = "إنشاء الحساب ✨";
            });
        }
    }).catch(err => {
        setLoginError("❌ تعذر الاتصال بالشبكة.");
        loginBtn.disabled = false; loginBtn.textContent = authMode === 'login' ? "دخول 🚀" : "إنشاء الحساب ✨";
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
    currentUser = ""; currentUserDisplay = ""; currentMode = 'predict';

    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-predict-mode').classList.add('active');

    document.getElementById("username-input").value = "";
    document.getElementById("password-input").value = "";
    setAuthMode('login');

    const loginBtn = document.getElementById("login-btn");
    loginBtn.disabled = false;
    document.getElementById("login-screen").style.display = "flex";
}

// تعديل وضع الشاشة לעرض/إخفاء لوحة الإدارة للمالك
function setMode(mode) {
    const adminPanel = document.getElementById('admin-panel');
    
    if (mode === 'real') {
        let password = prompt("أدخل رمز المالك (PIN) لتسجيل النتائج وإدارة اللاعبين:");
        if (password === null) return;
        if (password !== ADMIN_PASSWORD) {
            alert("❌ رمز غير صحيح!");
            return;
        }
        if (adminPanel) adminPanel.style.display = 'block';
    } else {
        if (adminPanel) adminPanel.style.display = 'none';
    }
    
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${mode}-mode`).classList.add('active');

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.textContent = mode === 'real' ? "💾 حفظ النتائج الحقيقية" : "حفظ التوقعات 💾";
    loadData();
}

function loadData() {
    if (!groupsData[currentGroup]) return;
    if (!firebaseReady) return;

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let realResults = realDoc.exists ? realDoc.data() : {};
        db.collection("worldcup2026").doc(`predict_${currentUser}`).get().then(userDoc => {
            let userPredictions = userDoc.exists ? userDoc.data() : {};

            autoFillMissedPredictions(currentGroup, realResults, userPredictions).then(updatedPredictions => {
                renderMatchesLayout(realResults, updatedPredictions);
                calculateSystem(realResults, updatedPredictions);
            });
        }).catch(err => {
            renderMatchesLayout(realResults, {}); calculateSystem(realResults, {});
        });
    }).catch(err => {
        renderMatchesLayout({}, {}); calculateSystem({}, {});
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

    if (!changed || !firebaseReady || !currentUser) return Promise.resolve(userPredictions);

    return db.collection("worldcup2026").doc(`predict_${currentUser}`)
        .set(toSave, { merge: true }).then(() => userPredictions).catch(() => userPredictions);
}

// 🃏 خاصية الجوكر: التأكد من اختيار جوكر واحد فقط لكل مجموعة
function handleJokerChange(matchId) {
    const currentCheckbox = document.getElementById(`joker-${matchId}`);
    if (currentCheckbox && currentCheckbox.checked) {
        groupsData[currentGroup].matches.forEach(m => {
            if (m.id !== matchId) {
                const otherCheckbox = document.getElementById(`joker-${m.id}`);
                if (otherCheckbox) otherCheckbox.checked = false;
            }
        });
    }
}

// عرض واجهة المباريات (مدمج بها نظام القفل الفردي الجديد)
function renderMatchesLayout(realResults, userPredictions) {
    const container = document.getElementById('matches-list');
    if (!container) return;
    container.innerHTML = "";

    let hasOpenMatchesForUser = false; // لاكتشاف ما إذا كانت كل المباريات مغلقة لإخفاء زر الحفظ

    groupsData[currentGroup].matches.forEach(m => {
        let realMatchData = realResults[m.id] || { a: "", b: "" };
        let saved = currentMode === 'real' ? realMatchData : (userPredictions[m.id] || { a: "", b: "", isJoker: false });

        let isRealExist = (realMatchData.a !== undefined && realMatchData.a !== "");
        let isManualLocked = realMatchData.isLocked === true; // قراءة القفل الفردي من قاعدة البيانات للمباراة

        // في وضع اللاعب: تقفل المباراة إذا سجلت نتيجتها النهائية أو إذا قفلها المسؤول يدوياً
        let isDisabled = "";
        if (currentMode === 'predict') {
            if (isRealExist || isManualLocked) isDisabled = "disabled";
            else hasOpenMatchesForUser = true;
        }

        let lockNote = "";
        let adminLockBtn = "";

        // عرض رسائل القفل المناسبة للمستخدم وزر القفل للمسؤول
        if (currentMode === 'real') {
            if (isRealExist) {
                lockNote = `<span class="match-locked-note" style="color:var(--text-muted);">🔒 النتيجة محفوظة</span>`;
            }
            // زر المالك لقفل/فتح المباراة يدوياً
            let lockText = isManualLocked ? "🔓 المباراة مقفلة - افتحها الآن" : "🔒 المباراة مفتوحة - اقفلها الآن";
            let lockClass = isManualLocked ? "locked" : "unlocked";
            adminLockBtn = `<button class="admin-lock-btn ${lockClass}" onclick="toggleMatchLock('${m.id}', ${isManualLocked})">${lockText}</button>`;
        } else {
            if (isRealExist) {
                lockNote = `<span class="match-locked-note">🔒 انتهت المباراة - التوقع مقفل</span>`;
            } else if (isManualLocked) {
                lockNote = `<span class="match-locked-note" style="color:var(--danger);font-weight:bold;">🔒 مغلقة (حان وقت البداية)</span>`;
            }
        }

        let isJokerChecked = saved.isJoker ? "checked" : "";

        container.innerHTML += `
            <div class="match-box">
                <div class="joker-container">
                    <label class="joker-label" title="مباراة الجوكر (نقاط مضاعفة 🔥)">
                        <input type="checkbox" class="joker-checkbox" id="joker-${m.id}" ${isJokerChecked} ${isDisabled} onchange="handleJokerChange('${m.id}')">
                        <span class="joker-icon">🃏</span>
                    </label>
                </div>
                <span class="team-name">${escapeHtml(m.tA)}</span>
                <div class="vs-inputs-wrap">
                    <div class="vs-inputs">
                        <input type="number" min="0" step="1" ${isDisabled} class="score-input" id="inputA-${m.id}" value="${saved.a !== undefined ? saved.a : ''}">
                        <span class="vs-text">ضد</span>
                        <input type="number" min="0" step="1" ${isDisabled} class="score-input" id="inputB-${m.id}" value="${saved.b !== undefined ? saved.b : ''}">
                    </div>
                    ${lockNote}
                    ${adminLockBtn}
                </div>
                <span class="team-name">${escapeHtml(m.tB)}</span>
            </div>
        `;
    });

    // إخفاء زر حفظ التوقعات للاعبين إذا كانت جميع المباريات في هذه المجموعة مقفلة
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        if (currentMode === 'predict' && !hasOpenMatchesForUser) {
            saveBtn.style.display = "none";
        } else {
            saveBtn.style.display = "block";
        }
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

// احتساب النقاط وتفعيل ميزة ضعف النقاط للجوكر
function pointsForPrediction(pa, pb, ra, rb, isAuto, isJoker) {
    if (isAuto) return 0;
    let scorePoints = 0;
    if (pa === ra && pb === rb) {
        scorePoints = 3;
    } else {
        const predictedOutcome = pa > pb ? 'A' : (pb > pa ? 'B' : 'D');
        const realOutcome = ra > rb ? 'A' : (rb > ra ? 'B' : 'D');
        scorePoints = (predictedOutcome === realOutcome) ? 1 : 0;
    }
    return isJoker ? (scorePoints * 2) : scorePoints;
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
    if (!firebaseReady) return alert("⚠️ لم يتم ضبط Firebase.");

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let latestRealResults = realDoc.exists ? realDoc.data() : {};
        let dataToSave = {};
        let hasInvalid = false;
        let blockedLockedMatch = false;

        groupsData[currentGroup].matches.forEach(m => {
            const inputA = document.getElementById(`inputA-${m.id}`);
            const inputB = document.getElementById(`inputB-${m.id}`);
            const jokerChk = document.getElementById(`joker-${m.id}`);
            if (!inputA || !inputB) return;

            const realM = latestRealResults[m.id];
            const isRealExist = realM && isValidScore(realM.a) && isValidScore(realM.b);
            const isManualLocked = realM && realM.isLocked === true;

            // منع المستخدم من حفظ المباريات المقفلة الفردية
            if (currentMode === 'predict' && (isRealExist || isManualLocked)) {
                blockedLockedMatch = true;
                return; // نتخطى هذه المباراة ولا نرسلها للسحابة
            }

            const valA = inputA.value.trim();
            const valB = inputB.value.trim();
            let isJokerActive = jokerChk ? jokerChk.checked : false;

            inputA.classList.remove('invalid');
            inputB.classList.remove('invalid');

            if (valA === "" && valB === "") {
                // للحفاظ على حالة القفل إن وجدت عندما يكون المالك هو من يحفظ
                let saveObj = currentMode === 'real' ? { a: "", b: "", isLocked: isManualLocked } : { a: "", b: "", isJoker: isJokerActive };
                dataToSave[m.id] = saveObj;
                return;
            }

            if (!isValidScore(valA) || !isValidScore(valB)) {
                inputA.classList.add('invalid');
                inputB.classList.add('invalid');
                hasInvalid = true;
                return;
            }

            let saveObj = currentMode === 'real' ? { a: valA, b: valB, isLocked: isManualLocked } : { a: valA, b: valB, isJoker: isJokerActive };
            dataToSave[m.id] = saveObj;
        });

        if (hasInvalid) return alert("⚠️ تحقق من النتائج: يجب إدخال أعداد صحيحة غير سالبة.");

        let docName = currentMode === 'real' ? "real_results" : `predict_${currentUser}`;
        db.collection("worldcup2026").doc(docName).set(dataToSave, { merge: true }).then(() => {
            if (blockedLockedMatch) alert("💾 تم الحفظ. ملاحظة: بعض المباريات كانت مقفلة بالفعل فلم يتم تعديلها.");
            else alert("💾 تم حفظ البيانات بنجاح!");
            loadData();
        }).catch(err => {
            console.error(err); alert("❌ حدث خطأ أثناء الحفظ.");
        });
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
                challengePoints += pointsForPrediction(pa, pb, ra, rb, p.auto, p.isJoker);
            }
        }
    });

    const groupBonus = computeGroupBonus(currentGroup, realResults, userPredictions);
    challengePoints += groupBonus;

    const badge = document.getElementById('accuracy-badge');
    if (badge) badge.textContent = currentMode === 'real' ? `👑 أنت في وضع إدخال النتائج الحقيقية لمجموعة ${currentGroup}` : `🎯 نقاط تحدي التوقعات الخاصة بك: ${challengePoints} نقطة`;

    const bonusBadge = document.getElementById('group-bonus-badge');
    if (bonusBadge) {
        if (currentMode === 'real') bonusBadge.style.display = "none";
        else if (groupBonus > 0) {
            bonusBadge.style.display = "block";
            bonusBadge.textContent = `🏆 مبروك! توقعت ترتيب هذه المجموعة بالكامل بشكل صحيح: +3 نقاط`;
        } else bonusBadge.style.display = "none";
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

// جلب الترتيب مع الأسهم المؤشرة
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
                            totalPoints += pointsForPrediction(pa, pb, ra, rb, userPred.auto, userPred.isJoker);
                        }
                    });

                    Object.keys(groupsData).forEach(g => {
                        totalPoints += computeGroupBonus(g, real, userPreds);
                    });

                    scores.push({ user, points: totalPoints });
                }
            });

            if (scores.length === 0) return renderLeaderboard([]);

            Promise.all(
                scores.map(s =>
                    db.collection("users_passwords").doc(s.user).get().then(udoc => ({
                        name: (udoc.exists && udoc.data().displayName) ? udoc.data().displayName : s.user,
                        points: s.points,
                        previousPosition: (udoc.exists && udoc.data().previousPosition) ? udoc.data().previousPosition : ""
                    })).catch(() => ({ name: s.user, points: s.points, previousPosition: "" }))
                )
            ).then(finalScores => {
                finalScores.sort((a, b) => b.points - a.points);
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
        filteredScores.forEach((s, idx) => {
            let currentRank = idx + 1;
            let arrow = "▬";
            let arrowClass = "trend-equal";

            if (s.previousPosition !== undefined && s.previousPosition !== null && s.previousPosition !== "") {
                let prev = parseInt(s.previousPosition, 10);
                if (currentRank < prev) { arrow = "▲"; arrowClass = "trend-up"; } 
                else if (currentRank > prev) { arrow = "▼"; arrowClass = "trend-down"; }
            }

            listContainer.innerHTML += `<li>
                <span>👤 ${escapeHtml(s.name)} <span class="trend-arrow ${arrowClass}" title="الترتيب السابق: ${s.previousPosition || 'غير معروف'}">${arrow}</span></span> 
                <span>${s.points} ن</span>
            </li>`;
        });
    }
}
