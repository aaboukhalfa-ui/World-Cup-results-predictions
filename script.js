// =================================================================
// ⚠️ ضع هنا بيانات مشروع Firebase الخاص بك (من إعدادات المشروع في console.firebase.google.com)
// تم ملء البيانات بناءً على إعدادات مشروعك الحالية بنجاح ✅
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

// كلمة مرور المالك لتسجيل النتائج الحقيقية
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
let authMode = 'login'; // 'login' = حساب موجود, 'signup' = حساب جديد

// قاعدة البيانات الكاملة لجميع المجموعات والـ 72 مباراة لمونديال 2026
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
            db.collection("users_passwords").doc(name).set({ password: pass, displayName: rawName }).then(() => {
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

            // ✅ تعبئة تلقائية للمباريات المنتهية التي لم يتوقعها المستخدم
            // (سواء لاعب قديم نسي مباراة، أو لاعب جديد انضم بعد بدء البطولة).
            // تُحفظ في قاعدة بياناته الخاصة بعلامة auto:true لضمان 0 نقطة دائماً،
            // وتبقى قابلة للتعديل اليدوي من لوحة Firebase فقط (وليس من الواجهة).
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

// =================================================================
// تعبئة تلقائية لتوقعات المباريات المنتهية التي تركها المستخدم فارغة.
//
// السبب: حتى لا تتعطل واجهة وجدول الترتيب الشخصي للمستخدم (لاعب جديد
// انضم بعد بدء البطولة، أو لاعب قديم نسي مباراة)، نملأ توقعه بنفس
// النتيجة الحقيقية تلقائياً. لكن هذا التوقع المُعبَّأ تلقائياً يُعلَّم
// داخلياً بـ auto:true ولا يُحسب له أي نقاط في نظام التحدي (0 نقطة
// دائماً)، حتى لو تطابقت الأرقام مع النتيجة الحقيقية بالضرورة.
//
// التعديل اليدوي: لو أراد المالك تصحيح توقع لاعب نسي بالخطأ، يمكنه
// فتح Firebase Console مباشرة، وتعديل الحقل a/b لتلك المباراة في
// مستند `predict_<username>`، وحذف أو تغيير حقل auto إلى false (أو
// حذفه بالكامل) ليُحسب التوقع بشكل طبيعي مرة أخرى.
// =================================================================
function autoFillMissedPredictions(groupKey, realResults, userPredictions) {
    let toSave = {};
    let changed = false;

    groupsData[groupKey].matches.forEach(m => {
        const real = realResults[m.id];
        const realIsSet = real && isValidScore(real.a) && isValidScore(real.b);
        if (!realIsSet) return; // المباراة لم تُلعب بعد، لا تعبئة

        const pred = userPredictions[m.id];
        const predIsSet = pred && isValidScore(pred.a) && isValidScore(pred.b);
        if (predIsSet) return; // المستخدم توقع هذه المباراة فعلاً، لا تغيير

        // توقع مفقود لمباراة منتهية -> نعبّئه بالنتيجة الحقيقية، معلّماً بـ auto:true
        userPredictions[m.id] = { a: real.a, b: real.b, auto: true };
        toSave[m.id] = { a: real.a, b: real.b, auto: true };
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
            return userPredictions; // نعرضها للمستخدم حتى لو فشل الحفظ، سيُعاد المحاولة لاحقاً
        });
}

function renderMatchesLayout(realResults, userPredictions) {
    const container = document.getElementById('matches-list');
    if (!container) return;
    container.innerHTML = "";

    groupsData[currentGroup].matches.forEach(m => {
        let isRealExist = (realResults[m.id] && realResults[m.id].a !== undefined && realResults[m.id].a !== "");
        let saved = currentMode === 'real' ? (realResults[m.id] || { a: "", b: "" }) : (userPredictions[m.id] || { a: "", b: "" });

        // ✅ القفل الدائم: بعد إدخال النتيجة الحقيقية لمباراة، تُقفل بشكل
        // كامل في كل الأوضاع (سواء وضع التوقعات أو وضع إدخال النتائج
        // الحقيقية). لا يوجد أي زر أو طريقة لإعادة فتحها من الواجهة.
        let isDisabled = isRealExist ? "disabled" : "";
        let lockNote = "";
        if (isRealExist) {
            lockNote = currentMode === 'real'
                ? `<span class="match-locked-note">🔒 النتيجة محفوظة بشكل نهائي - لا يمكن تعديلها</span>`
                : `<span class="match-locked-note">🔒 انتهت المباراة - التوقع مقفل</span>`;
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
                    ${lockNote}
                </div>
                <span class="team-name">${escapeHtml(m.tB)}</span>
            </div>
        `;
    });
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

// =================================================================
// نقاط توقع نتيجة مباراة واحدة حسب القاعدة الجديدة:
// 3 نقاط = نتيجة دقيقة طابقت تماماً
// 1 نقطة = توقع صحيح للفوز/الخسارة/التعادل لكن الأرقام غير دقيقة
// 0 نقطة = توقع خاطئ تماماً
//
// isAuto: إذا كان التوقع مُعبَّأ تلقائياً (لاعب لم يتوقع المباراة فعلاً
// وتم نسخ النتيجة الحقيقية له تلقائياً)، يُعطى 0 نقطة دائماً ولا يُحسب
// كتوقع حقيقي، حتى لو تطابقت الأرقام بالضرورة مع النتيجة الحقيقية.
// =================================================================
function pointsForPrediction(pa, pb, ra, rb, isAuto) {
    if (isAuto) return 0;
    if (pa === ra && pb === rb) return 3;
    const predictedOutcome = pa > pb ? 'A' : (pb > pa ? 'B' : 'D');
    const realOutcome = ra > rb ? 'A' : (rb > ra ? 'B' : 'D');
    return predictedOutcome === realOutcome ? 1 : 0;
}

// =================================================================
// يحسب ترتيب فرق مجموعة معيّنة (1 إلى 4) بالاستناد إلى نتائج معطاة
// (سواء كانت نتائج حقيقية أو توقعات مستخدم). يعيد:
// { order: [اسم الفريق الأول, الثاني, الثالث, الرابع],
//   isComplete: هل كل المباريات الست (وفقط الست) موجودة فيها نتيجة صحيحة,
//   hasTie: هل يوجد تعادل بالنقاط بين أي فريقين في الترتيب }
//
// ✅ تشديد: matchesWithResult يجب أن يساوي بالضبط عدد مباريات المجموعة
// (6 مباريات). أي قيمة ناقصة أو غير صالحة (فارغة/null/undefined/غير رقمية)
// تجعل isComplete = false فوراً، ولا يُحسب أي ترتيب نهائي لهذه الحالة.
// =================================================================
function computeGroupOrder(groupKey, resultsObj) {
    const safeResults = resultsObj || {};
    let stats = {};
    groupsData[groupKey].teams.forEach(t => { stats[t] = { name: t, pts: 0 }; });

    let matchesWithResult = 0;
    groupsData[groupKey].matches.forEach(m => {
        const res = safeResults[m.id];
        if (res && isValidScore(res.a) && isValidScore(res.b)) {
            matchesWithResult++;
            let a = parseInt(res.a, 10), b = parseInt(res.b, 10);
            if (a > b) stats[m.tA].pts += 3;
            else if (b > a) stats[m.tB].pts += 3;
            else { stats[m.tA].pts += 1; stats[m.tB].pts += 1; }
        }
    });

    const totalMatches = groupsData[groupKey].matches.length; // 6 لكل مجموعة
    const isComplete = matchesWithResult === totalMatches;

    const sorted = Object.values(stats).sort((x, y) => y.pts - x.pts);

    let hasTie = false;
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].pts === sorted[i + 1].pts) { hasTie = true; break; }
    }

    return {
        order: sorted.map(s => s.name),
        isComplete,
        hasTie
    };
}

// =================================================================
// 🏆 نقاط ترتيب المجموعة (القاعدة الجديدة): 1 نقطة فقط لكل مجموعة
// متوقَّعة بشكل صحيح 100%، بحد أقصى 12 نقطة (1 × 12 مجموعة).
//
// الشروط الصارمة لمنح النقطة (Rule 1 + Rule 2):
// 1) يجب أن تكون المجموعة الحقيقية مكتملة بالكامل: الست مباريات لها
//    نتيجة حقيقية صحيحة مُدخلة من الأدمن. أي مباراة ناقصة = 0 نقطة فوراً.
// 2) لا يوجد أي تعادل بالنقاط بين الفرق في الترتيب الحقيقي (وإلا فالترتيب
//    غير محدد بشكل قاطع، فلا تُمنح أي نقطة لأي مستخدم في هذه الحالة).
// 3) يجب أن يكون توقع المستخدم نفسه أيضاً غير متعادل (أي أن المستخدم
//    فعلاً رتّب الفرق 1-2-3-4 بشكل حاسم عبر توقعاته للمباريات الست،
//    وليس توقعاً ناقصاً أو فارغاً يُنتج تعادلاً صورياً بين الفرق).
// 4) ترتيب التوقع (1 إلى 4) يجب أن يطابق الترتيب الحقيقي حرفياً وبالكامل.
//
// ✅ هذا يمنع تماماً مشكلة "نقاط فورية عند التسجيل": مستخدم جديد بلا
// أي توقعات محفوظة سيحصل على hasTie = true (كل الفرق متعادلة عند 0 نقطة)
// في دالة computeGroupOrder الخاصة بتوقعاته، وبالتالي صفر نقطة دائماً،
// بغض النظر عن حالة النتائج الحقيقية.
// =================================================================
function computeGroupBonus(groupKey, realResults, userPredictions) {
    const real = computeGroupOrder(groupKey, realResults);
    if (!real.isComplete || real.hasTie) return 0; // Rule 1: المجموعة غير مكتملة بعد

    const predicted = computeGroupOrder(groupKey, userPredictions);
    if (!predicted.isComplete || predicted.hasTie) return 0; // توقع ناقص أو متعادل لا يُحسب

    const exactMatch = real.order.every((team, i) => team === predicted.order[i]);
    return exactMatch ? 1 : 0; // Rule 2: نقطة واحدة فقط للترتيب الصحيح 100%
}

// =================================================================
// 🔢 يحسب إجمالي نقاط الترتيب لكل المجموعات الـ 12 لمستخدم معيّن.
// الحد الأقصى النظري: 12 نقطة (1 نقطة × 12 مجموعة).
// تُستخدم هذه الدالة في الـ Leaderboard وفي عرض المجموعة الحالية، لضمان
// أن القيمة نفسها تُحسب دائماً بنفس الطريقة في كل مكان (Rule 3).
// =================================================================
function computeAllGroupsBonus(realResults, userPredictions) {
    let total = 0;
    Object.keys(groupsData).forEach(g => {
        total += computeGroupBonus(g, realResults, userPredictions);
    });
    return total;
}

// ✅ ملاحظة أمان: قبل أي حفظ، نتحقق أولاً من آخر نسخة محفوظة من النتائج
// الحقيقية مباشرة من Firebase (وليس من الواجهة)، لمنع أي محاولة لتعديل
// مباراة مقفلة عبر التلاعب بالواجهة (مثلاً من أدوات المطوّر في المتصفح).
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

            // أي مباراة سُجلت نتيجتها الحقيقية فعلاً تبقى مقفلة تماماً،
            // سواء كنا في وضع التوقعات أو وضع إدخال النتائج الحقيقية.
            if (isLocked) {
                blockedLockedMatch = true;
                return; // لا تُضمَّن هذه المباراة في عملية الحفظ نهائياً
            }

            const valA = inputA.value.trim();
            const valB = inputB.value.trim();

            inputA.classList.remove('invalid');
            inputB.classList.remove('invalid');

            if (valA === "" && valB === "") {
                dataToSave[m.id] = { a: "", b: "" };
                return;
            }

            if (!isValidScore(valA) || !isValidScore(valB)) {
                inputA.classList.add('invalid');
                inputB.classList.add('invalid');
                hasInvalid = true;
                return;
            }

            dataToSave[m.id] = { a: valA, b: valB };
        });

        if (hasInvalid) {
            alert("⚠️ تحقق من النتائج: يجب إدخال أعداد صحيحة غير سالبة لكل مباراة (أو تركها فارغة بالكامل).");
            return;
        }

        let docName = currentMode === 'real' ? "real_results" : `predict_${currentUser}`;
        db.collection("worldcup2026").doc(docName).set(dataToSave, { merge: true }).then(() => {
            if (blockedLockedMatch) {
                alert("💾 تم الحفظ. ملاحظة: بعض المباريات كانت مقفلة بالفعل (نتيجتها الحقيقية مسجّلة) فلم يتم تعديلها.");
            } else {
                alert("💾 تم حفظ وإرسال البيانات بنجاح!");
            }
            loadData();
        }).catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء الحفظ. تحقق من اتصال الإنترنت أو إعدادات Firebase.");
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
        const p = userPredictions[m.id] || { a: "", b: "" };
        const r = realResults[m.id] || { a: "", b: "" };

        const predictionExists = isValidScore(p.a) && isValidScore(p.b);
        const realExists = isValidScore(r.a) && isValidScore(r.b);

        // pPoints/rPoints هنا هي نقاط ترتيب الفرق الفعلية (3 فوز / 1 تعادل)
        // وليست نقاط دقة توقع المستخدم - تبقى كما هي لأنها صحيحة فعلياً
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

            // ✅ نقاط تحدي التوقعات الشخصية بالقاعدة الجديدة: 3 / 1 / 0
            if (predictionExists) {
                let pa = parseInt(p.a, 10), pb = parseInt(p.b, 10);
                challengePoints += pointsForPrediction(pa, pb, ra, rb);
            }
        }
    });

    // ✅ مكافأة توقع ترتيب المجموعة بالكامل (1 نقطة إضافية لو الترتيب مطابق تماماً، فقط إذا اكتملت كل نتائج المجموعة الحقيقية)
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
            bonusBadge.textContent = `🏆 مبروك! توقعت ترتيب هذه المجموعة بالكامل بشكل صحيح: +1 نقطة`;
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

// اسم المستخدم الخاص بحساب المالك/الأدمن - يُستثنى دائماً من جدول المتصدرين
const ADMIN_USERNAME = "boukhalfa anes";

// خريطة سريعة: id المباراة -> رمز المجموعة (مستخدمة لحساب نقاط المتصدرين)
const matchIdToGroup = {};
Object.keys(groupsData).forEach(g => {
    groupsData[g].matches.forEach(m => { matchIdToGroup[m.id] = g; });
});

function updateLeaderboard() {
    if (!firebaseReady) return;

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let real = realDoc.exists ? realDoc.data() : {};

        db.collection("worldcup2026").get().then(querySnapshot => {
            let scores = [];
            querySnapshot.forEach(doc => {
                if (doc.id.startsWith("predict_")) {
                    let user = doc.id.replace("predict_", "");

                    // 🚫 استثناء حساب المالك/الأدمن من جدول المتصدرين
                    if (user.toLowerCase() === ADMIN_USERNAME) return;

                    let userPreds = doc.data();
                    let totalPoints = 0;

                    // ✅ نقاط كل مباراة بالقاعدة الجديدة: 3 دقيقة / 1 نتيجة صحيحة / 0 خطأ
                    Object.keys(real).forEach(mId => {
                        const realResult = real[mId];
                        const userPred = userPreds[mId];
                        if (
                            userPred && isValidScore(userPred.a) && isValidScore(userPred.b) &&
                            realResult && isValidScore(realResult.a) && isValidScore(realResult.b)
                        ) {
                            let pa = parseInt(userPred.a, 10), pb = parseInt(userPred.b, 10);
                            let ra = parseInt(realResult.a, 10), rb = parseInt(realResult.b, 10);
                            totalPoints += pointsForPrediction(pa, pb, ra, rb);
                        }
                    });

                    // ✅ إضافة نقاط ترتيب المجموعات (1 نقطة لكل مجموعة متوقَّعة بشكل صحيح 100%، فقط بعد اكتمالها بالكامل - حد أقصى 12 نقطة)
                    totalPoints += computeAllGroupsBonus(real, userPreds);

                    scores.push({ user, points: totalPoints });
                }
            });

            if (scores.length === 0) {
                renderLeaderboard([]);
                return;
            }

            Promise.all(
                scores.map(s =>
                    db.collection("users_passwords").doc(s.user).get().then(udoc => ({
                        name: (udoc.exists && udoc.data().displayName) ? udoc.data().displayName : s.user,
                        points: s.points
                    })).catch(() => ({ name: s.user, points: s.points }))
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

    // 🚫 فلترة إضافية احترازية: استثناء حساب الأدمن حتى لو ظهر بالاسم المعروض (displayName)
    const filteredScores = scores.filter(s => (s.name || "").trim().toLowerCase() !== ADMIN_USERNAME);

    listContainer.innerHTML = "";
    if (filteredScores.length === 0) {
        listContainer.innerHTML = `<li class="empty-msg">لا يوجد متسابقون بعد</li>`;
    } else {
        filteredScores.forEach(s => {
            listContainer.innerHTML += `<li><span>👤 ${escapeHtml(s.name)}</span> <span>${s.points} ن</span></li>`;
        });
    }
}
