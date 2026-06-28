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
// 🏆 بيانات مرحلة خروج المغلوب (دور الـ32 وحتى النهائي)
// المباريات الـ16 الأولى ثابتة كما في الصورة الرسمية. كل مباراة لاحقة
// (دور الـ16 فصاعداً) تُعبَّأ تلقائياً بالفريقين الفائزين من المباراتين
// السابقتين لها بمجرد إدخال نتيجتيهما (يدوياً من المالك أو من توقع اللاعب).
// =================================================================
const knockoutData = {
    round32: {
        name: "دور الـ32", date: "29 يونيو",
        matches: [
            { id: "R32-1",  tA: "البرازيل 🇧🇷",        tB: "اليابان 🇯🇵",        side: "left"  },
            { id: "R32-2",  tA: "كوت ديفوار 🇨🇮",       tB: "النرويج 🇳🇴",        side: "left"  },
            { id: "R32-3",  tA: "المكسيك 🇲🇽",          tB: "الإكوادور 🇪🇨",       side: "left"  },
            { id: "R32-4",  tA: "إنجلترا 🏴",           tB: "الكونغو الديمقراطية 🇨🇩", side: "left"  },
            { id: "R32-5",  tA: "الأرجنتين 🇦🇷",         tB: "الأوروغواي 🇺🇾",      side: "left"  },
            { id: "R32-6",  tA: "أستراليا 🇦🇺",         tB: "مصر 🇪🇬",            side: "left"  },
            { id: "R32-7",  tA: "سويسرا 🇨🇭",           tB: "الجزائر 🇩🇿",        side: "left"  },
            { id: "R32-8",  tA: "كولومبيا 🇨🇴",         tB: "غانا 🇬🇭",           side: "left"  },
            { id: "R32-9",  tA: "ألمانيا 🇩🇪",          tB: "إيران 🇮🇷",          side: "right" },
            { id: "R32-10", tA: "فرنسا 🇫🇷",            tB: "السويد 🇸🇪",         side: "right" },
            { id: "R32-11", tA: "جنوب إفريقيا 🇿🇦",      tB: "كندا 🇨🇦",           side: "right" },
            { id: "R32-12", tA: "هولندا 🇳🇱",           tB: "المغرب 🇲🇦",         side: "right" },
            { id: "R32-13", tA: "البرتغال 🇵🇹",         tB: "كرواتيا 🇭🇷",        side: "right" },
            { id: "R32-14", tA: "إسبانيا 🇪🇸",          tB: "النمسا 🇦🇹",         side: "right" },
            { id: "R32-15", tA: "الولايات المتحدة 🇺🇸",  tB: "البوسنة والهرسك 🇧🇦",  side: "right" },
            { id: "R32-16", tA: "بلجيكا 🇧🇪",           tB: "السنغال 🇸🇳",        side: "right" }
        ]
    },
    round16: {
        name: "دور الـ16", date: "5 يوليو",
        matches: [
            { id: "R16-1", from: ["R32-1", "R32-2"],  side: "left"  },
            { id: "R16-2", from: ["R32-3", "R32-4"],  side: "left"  },
            { id: "R16-3", from: ["R32-5", "R32-6"],  side: "left"  },
            { id: "R16-4", from: ["R32-7", "R32-8"],  side: "left"  },
            { id: "R16-5", from: ["R32-9", "R32-10"], side: "right" },
            { id: "R16-6", from: ["R32-11", "R32-12"],side: "right" },
            { id: "R16-7", from: ["R32-13", "R32-14"],side: "right" },
            { id: "R16-8", from: ["R32-15", "R32-16"],side: "right" }
        ]
    },
    quarter: {
        name: "ربع النهائي", date: "9-12 يوليو",
        matches: [
            { id: "QF-1", from: ["R16-1", "R16-2"], side: "left",  date: "12 يوليو" },
            { id: "QF-2", from: ["R16-3", "R16-4"], side: "left",  date: "12 يوليو" },
            { id: "QF-3", from: ["R16-5", "R16-6"], side: "right", date: "9 يوليو"  },
            { id: "QF-4", from: ["R16-7", "R16-8"], side: "right", date: "10 يوليو" }
        ]
    },
    semi: {
        name: "نصف النهائي", date: "14-15 يوليو",
        matches: [
            { id: "SF-1", from: ["QF-1", "QF-2"], side: "left",  date: "15 يوليو" },
            { id: "SF-2", from: ["QF-3", "QF-4"], side: "right", date: "14 يوليو" }
        ]
    },
    final: {
        name: "النهائي", date: "19 يوليو",
        matches: [
            { id: "FINAL", from: ["SF-1", "SF-2"], side: "center" }
        ]
    }
};

const knockoutRoundOrder = ["round32", "round16", "quarter", "semi", "final"];

// خريطة سريعة: id المباراة -> الجولة التي تنتمي إليها
const knockoutMatchToRound = {};
knockoutRoundOrder.forEach(rk => {
    knockoutData[rk].matches.forEach(m => { knockoutMatchToRound[m.id] = rk; });
});

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
            li.onclick = () => switchGroupOrPredictions(g);
            nav.appendChild(li);
        });

        let knockoutTab = document.createElement('li');
        knockoutTab.textContent = `🏆 خروج المغلوب`;
        knockoutTab.id = `tab-knockout`;
        knockoutTab.onclick = () => switchToKnockoutFromAnyView();
        nav.appendChild(knockoutTab);

        let predictionsTab = document.createElement('li');
        predictionsTab.textContent = `📋 توقعات اللاعبين`;
        predictionsTab.id = `tab-predictions`;
        predictionsTab.onclick = () => switchToPredictionsView();
        nav.appendChild(predictionsTab);
    }

    if (currentUser) showApp();
    else document.getElementById("login-screen").style.display = "flex";

    const pwInput = document.getElementById("password-input");
    if (pwInput) {
        pwInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") loginUser();
        });
    }

    // إضافة غير مدمرة: الخروج من صفحة "توقعات اللاعبين" تلقائياً عند الضغط
    // على أزرار "وضع توقعاتي" أو "إدخال النتائج الحقيقية" (بدون تعديل setMode نفسها)
    const predictModeBtn = document.getElementById('btn-predict-mode');
    if (predictModeBtn) predictModeBtn.addEventListener('click', exitPredictionsViewIfActive);
    const realModeBtn = document.getElementById('btn-real-mode');
    if (realModeBtn) realModeBtn.addEventListener('click', exitPredictionsViewIfActive);
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

    document.getElementById('current-group-title').textContent = `🏆 مرحلة خروج المغلوب - الطريق إلى النهائي`;
    document.getElementById('groups-view').style.display = "none";
    document.getElementById('knockout-view').style.display = "block";

    loadKnockoutData();
}

// =================================================================
// 📋 صفحة عرض توقعات جميع اللاعبين لكل مباراة مجموعة منتهية
// (ميزة جديدة: لا تُعدّل أي دالة موجودة سابقاً، بل تُضاف بجانبها)
// =================================================================
let isPredictionsViewActive = false; // علم يحدد إن كنا داخل صفحة "توقعات اللاعبين"

// عند الضغط على تبويب مجموعة (A..L): إذا كنا في صفحة توقعات اللاعبين نبقى فيها
// ونعرض توقعات تلك المجموعة، وإلا فالسلوك الطبيعي القديم (switchGroup) يبقى كما هو
function switchGroupOrPredictions(g) {
    if (isPredictionsViewActive) {
        renderGroupSelectionForPredictions(g);
    } else {
        switchGroup(g);
    }
}

// يضمن إخفاء صفحة "توقعات اللاعبين" وإعادة الزر العادي للحالة الطبيعية
// عند الخروج منها إلى مجموعة عادية (يُستخدم فقط داخلياً قبل استدعاء switchGroup الأصلية)
function exitPredictionsViewIfActive() {
    if (isPredictionsViewActive) {
        isPredictionsViewActive = false;
        const predTab = document.getElementById('tab-predictions');
        if (predTab) predTab.classList.remove('active-tab');
        document.getElementById('predictions-view').style.display = "none";
        document.getElementById('groups-view').style.display = "block"; // إعادة إظهار شاشة المباريات العادية
        const newTab = document.getElementById(`tab-${currentGroup}`);
        if (newTab) newTab.className = 'active-tab';
        document.getElementById('current-group-title').textContent = `⚽ مباريات ${groupsData[currentGroup].name}`;
    }
}

function switchToKnockoutFromAnyView() {
    exitPredictionsViewIfActive();
    switchToKnockout();
}

function switchToPredictionsView() {
    const oldTab = document.getElementById(`tab-${currentGroup === 'knockout' ? 'knockout' : currentGroup}`);
    if (oldTab) oldTab.classList.remove('active-tab');

    isPredictionsViewActive = true;
    document.getElementById('tab-predictions').className = 'active-tab';

    document.getElementById('current-group-title').textContent = `📋 توقعات اللاعبين`;
    document.getElementById('groups-view').style.display = "none";
    document.getElementById('knockout-view').style.display = "none";
    document.getElementById('predictions-view').style.display = "block";

    // نعرض افتراضياً توقعات المجموعة الحالية (أو A إذا لم تكن محددة)
    renderGroupSelectionForPredictions(currentGroup === 'knockout' ? 'A' : currentGroup);
}

function renderGroupSelectionForPredictions(g) {
    Object.keys(groupsData).forEach(key => {
        const tab = document.getElementById(`tab-${key}`);
        if (tab) tab.classList.toggle('active-tab', key === g);
    });
    const knockoutTab = document.getElementById('tab-knockout');
    if (knockoutTab) knockoutTab.classList.remove('active-tab');

    currentGroup = g;
    document.getElementById('current-group-title').textContent = `📋 توقعات اللاعبين - ${groupsData[g].name}`;
    loadAllPredictionsForGroup(g);
}

// جلب النتائج الحقيقية وكل توقعات المستخدمين المسجَّلين، ثم عرض المباريات
// المنتهية فقط (التي أدخل المالك نتيجتها الحقيقية)
function loadAllPredictionsForGroup(g) {
    const container = document.getElementById('predictions-list');
    if (!container || !firebaseReady) return;
    container.innerHTML = `<p class="pred-empty-msg">⏳ جاري تحميل التوقعات...</p>`;

    db.collection("worldcup2026").doc("real_results").get().then(realDoc => {
        let real = realDoc.exists ? realDoc.data() : {};

        // المباريات المنتهية فقط في هذه المجموعة (نتيجة حقيقية صالحة مُدخلة)
        let finishedMatches = groupsData[g].matches.filter(m => {
            const r = real[m.id];
            return r && isValidScore(r.a) && isValidScore(r.b);
        });

        if (finishedMatches.length === 0) {
            container.innerHTML = `<p class="pred-empty-msg">⌛ لا توجد مباريات منتهية بعد في هذه المجموعة. ستظهر توقعات اللاعبين هنا فور إدخال المالك للنتائج الحقيقية.</p>`;
            return;
        }

        // كل المستخدمين المسجَّلين (لعرض اسمهم اللائق، وأيضاً لتضمين من لم يتوقع حتى لو لم يحفظ شيئاً)
        db.collection("users_passwords").get().then(usersSnap => {
            let registeredUsers = [];
            usersSnap.forEach(udoc => {
                let username = udoc.id;
                if (username.toLowerCase() === ADMIN_USERNAME) return; // 🚫 نفس قاعدة استثناء الأدمن المعتمدة في باقي التطبيق
                registeredUsers.push({ user: username, displayName: udoc.data().displayName || username });
            });

            db.collection("worldcup2026").get().then(allDocsSnap => {
                let predictionsByUser = {};
                allDocsSnap.forEach(doc => {
                    if (doc.id.startsWith("predict_")) {
                        predictionsByUser[doc.id.replace("predict_", "")] = doc.data();
                    }
                });

                renderPredictionsList(finishedMatches, real, registeredUsers, predictionsByUser);
            }).catch(err => {
                console.error(err);
                container.innerHTML = `<p class="pred-empty-msg">❌ تعذر تحميل توقعات اللاعبين.</p>`;
            });
        }).catch(err => {
            console.error(err);
            container.innerHTML = `<p class="pred-empty-msg">❌ تعذر تحميل قائمة اللاعبين المسجَّلين.</p>`;
        });
    }).catch(err => {
        console.error(err);
        container.innerHTML = `<p class="pred-empty-msg">❌ تعذر تحميل النتائج الحقيقية.</p>`;
    });
}

function renderPredictionsList(finishedMatches, real, registeredUsers, predictionsByUser) {
    const container = document.getElementById('predictions-list');
    if (!container) return;

    let html = "";
    finishedMatches.forEach(m => {
        const r = real[m.id];
        const ra = parseInt(r.a, 10), rb = parseInt(r.b, 10);

        html += `<div class="pred-match-card">
            <div class="pred-match-header">
                <span class="pred-match-teams">${escapeHtml(m.tA)} ضد ${escapeHtml(m.tB)}</span>
                <span class="pred-match-result">النتيجة الحقيقية: ${ra} - ${rb}</span>
            </div>
            <div class="pred-rows">`;

        // نرتب اللاعبين أبجدياً بالاسم اللائق لتسهيل القراءة
        let sortedUsers = [...registeredUsers].sort((a, b) => a.displayName.localeCompare(b.displayName, 'ar'));

        sortedUsers.forEach(ru => {
            const userPreds = predictionsByUser[ru.user] || {};
            const p = userPreds[m.id];
            const predictionExists = p && isValidScore(p.a) && isValidScore(p.b);

            if (!predictionExists) {
                html += `<div class="pred-row">
                    <span class="pred-user">👤 ${escapeHtml(ru.displayName)}</span>
                    <span class="pred-no-prediction">لم يتوقع هذه المباراة</span>
                </div>`;
                return;
            }

            const pa = parseInt(p.a, 10), pb = parseInt(p.b, 10);
            const pts = pointsForPrediction(pa, pb, ra, rb, p.auto, p.isJoker);
            const ptsClass = pts >= 3 ? 'pred-points-3' : (pts >= 1 ? 'pred-points-1' : 'pred-points-0');
            const jokerTag = p.isJoker ? `<span class="pred-joker-tag" title="مباراة الجوكر">🃏</span>` : "";
            const autoTag = p.auto ? `<span class="pred-no-prediction" style="margin-right:6px;">(تلقائي)</span>` : "";

            html += `<div class="pred-row">
                <span class="pred-user">👤 ${escapeHtml(ru.displayName)}</span>
                <span>
                    ${autoTag}
                    ${jokerTag}
                    <span class="pred-score">${pa} - ${pb}</span>
                    <span class="pred-points-tag ${ptsClass}">${pts} ن</span>
                </span>
            </div>`;
        });

        html += `</div></div>`;
    });

    container.innerHTML = html;
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

    const koSaveBtn = document.getElementById('ko-save-btn');
    if (koSaveBtn) koSaveBtn.textContent = mode === 'real' ? "💾 حفظ نتائج خروج المغلوب" : "حفظ توقعاتي 💾";

    if (currentGroup === 'knockout') {
        loadKnockoutData();
    } else {
        loadData();
    }
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

// =================================================================
// 🏆 مرحلة خروج المغلوب - المنطق الكامل
//
// كل مباراة في resultsObj مخزَّنة بالشكل:
// { a: "2", b: "1", penaltyWinner: "A" أو "B" أو "" , isLocked: bool }
// - a/b: نتيجة الوقت الأصلي (90 دقيقة). يمكن أن تكون متعادلة.
// - penaltyWinner: تُستخدم فقط إذا كانت النتيجة متعادلة، وتحدد الفائز
//   بركلات الترجيح ("A" يعني الفريق الأول tA، "B" يعني الفريق الثاني tB).
// =================================================================

function getKnockoutMatchById(matchId) {
    const rk = knockoutMatchToRound[matchId];
    if (!rk) return null;
    return knockoutData[rk].matches.find(m => m.id === matchId) || null;
}

// يحدد اسم الفريق الذي يجب أن يظهر في خانة tA أو tB لمباراة معيّنة.
// إذا كانت المباراة من الدور الأول (R32) فالاسم ثابت، وإلا فهو الفائز
// من المباراة السابقة المرتبطة بـ from[0]/from[1] بحسب resultsObj.
function resolveSlotTeam(match, slotIndex, resultsObj) {
    if (match.tA !== undefined && slotIndex === 0) return match.tA;
    if (match.tB !== undefined && slotIndex === 1) return match.tB;
    if (!match.from) return null;

    const prevMatchId = match.from[slotIndex];
    const prevMatch = getKnockoutMatchById(prevMatchId);
    if (!prevMatch) return null;

    const winner = computeKnockoutWinner(prevMatch, resultsObj);
    return winner ? winner.team : `(فائز ${prevMatch.id})`;
}

// يحسب الفائز من مباراة معيّنة بناءً على نتيجة محفوظة (حقيقية أو توقع).
// يعيد { team: "اسم الفريق", slot: 'A' أو 'B' } أو null إن لم تُحسم بعد.
function computeKnockoutWinner(match, resultsObj) {
    const res = resultsObj[match.id];
    if (!res || !isValidScore(res.a) || !isValidScore(res.b)) return null;

    const teamA = resolveSlotTeam(match, 0, resultsObj);
    const teamB = resolveSlotTeam(match, 1, resultsObj);
    if (!teamA || !teamB) return null;

    const a = parseInt(res.a, 10), b = parseInt(res.b, 10);
    if (a > b) return { team: teamA, slot: 'A' };
    if (b > a) return { team: teamB, slot: 'B' };

    // تعادل في الوقت الأصلي -> يُحدد الفائز بركلات الترجيح
    if (res.penaltyWinner === 'A') return { team: teamA, slot: 'A' };
    if (res.penaltyWinner === 'B') return { team: teamB, slot: 'B' };
    return null; // متعادل ولم يُحدَّد فائز الترجيح بعد
}

// نقاط توقع مباراة خروج المغلوب الواحدة (نفس قاعدة 3/1/0 + مكافأة ركلات الترجيح)
// realRes/predRes بالشكل {a,b,penaltyWinner}
function pointsForKnockoutPrediction(predRes, realRes) {
    if (!predRes || !isValidScore(predRes.a) || !isValidScore(predRes.b)) return 0;
    if (!realRes || !isValidScore(realRes.a) || !isValidScore(realRes.b)) return 0;

    const pa = parseInt(predRes.a, 10), pb = parseInt(predRes.b, 10);
    const ra = parseInt(realRes.a, 10), rb = parseInt(realRes.b, 10);

    let points = 0;
    if (pa === ra && pb === rb) points = 3;
    else {
        const predOutcome = pa > pb ? 'A' : (pb > pa ? 'B' : 'D');
        const realOutcome = ra > rb ? 'A' : (rb > ra ? 'B' : 'D');
        points = (predOutcome === realOutcome) ? 1 : 0;
    }

    // مكافأة ركلات الترجيح: فقط إذا كانت النتيجة الحقيقية متعادلة (ذهبت لركلات الترجيح)
    const realWasDraw = (ra === rb);
    if (realWasDraw && realRes.penaltyWinner && predRes.penaltyWinner) {
        if (predRes.penaltyWinner === realRes.penaltyWinner) points += 2;
    }

    return points;
}

// =================================================================
// جلب نتائج خروج المغلوب الحقيقية وتوقعات المستخدم وعرض القوسين
// =================================================================
function loadKnockoutData() {
    const container = document.getElementById('knockout-bracket-container');
    if (!container || !firebaseReady) return;

    db.collection("worldcup2026").doc("knockout_real").get().then(realDoc => {
        let realResults = realDoc.exists ? realDoc.data() : {};
        db.collection("worldcup2026").doc(`knockout_predict_${currentUser}`).get().then(userDoc => {
            let userPredictions = userDoc.exists ? userDoc.data() : {};
            renderKnockoutBracket(realResults, userPredictions);
            renderKnockoutBadge(realResults, userPredictions);
        }).catch(() => {
            renderKnockoutBracket(realResults, {});
        });
    }).catch(err => {
        console.error(err);
        container.innerHTML = `<p class="pred-empty-msg">❌ تعذر تحميل بيانات خروج المغلوب.</p>`;
    });
}

function renderKnockoutBadge(realResults, userPredictions) {
    const badge = document.getElementById('knockout-accuracy-badge');
    if (!badge) return;
    if (currentMode === 'real') {
        badge.textContent = `👑 أنت في وضع إدخال النتائج الحقيقية لمرحلة خروج المغلوب`;
        return;
    }
    let total = 0;
    knockoutRoundOrder.forEach(rk => {
        knockoutData[rk].matches.forEach(m => {
            total += pointsForKnockoutPrediction(userPredictions[m.id], realResults[m.id]);
        });
    });
    badge.textContent = `🎯 نقاط تحدي خروج المغلوب الخاصة بك: ${total} نقطة`;
}

// يبني صندوق مباراة واحدة (HTML) لكل من العرض اليساري/الأيمن/المركزي
function renderKnockoutMatchBox(match, realResults, userPredictions) {
    const teamA = resolveSlotTeam(match, 0, realResults);
    const teamB = resolveSlotTeam(match, 1, realResults);
    const teamAKnown = teamA && !teamA.startsWith("(فائز");
    const teamBKnown = teamB && !teamB.startsWith("(فائز");

    const realRes = realResults[match.id] || { a: "", b: "", penaltyWinner: "" };
    const predRes = userPredictions[match.id] || { a: "", b: "", penaltyWinner: "" };

    const isRealExist = isValidScore(realRes.a) && isValidScore(realRes.b);
    const isManualLocked = realRes.isLocked === true;
    const saved = currentMode === 'real' ? realRes : predRes;

    // لا يمكن إدخال أي نتيجة قبل تحديد الفريقين المتأهلين فعلاً
    const slotsReady = teamAKnown && teamBKnown;
    let isDisabled = (!slotsReady) ? "disabled" : "";
    if (currentMode === 'predict' && (isRealExist || isManualLocked)) isDisabled = "disabled";

    // التعادل في النتيجة المعروضة -> نحتاج خانة اختيار الفائز بركلات الترجيح
    const showsDraw = isValidScore(saved.a) && isValidScore(saved.b) && parseInt(saved.a,10) === parseInt(saved.b,10);

    let lockNote = "";
    let adminLockBtn = "";
    if (currentMode === 'real') {
        if (isRealExist) lockNote = `<span class="match-locked-note" style="color:var(--text-muted);">🔒 النتيجة محفوظة</span>`;
        if (slotsReady) {
            let lockText = isManualLocked ? "🔓 افتح المباراة" : "🔒 اقفل المباراة";
            let lockClass = isManualLocked ? "locked" : "unlocked";
            adminLockBtn = `<button class="admin-lock-btn ${lockClass}" onclick="toggleKnockoutMatchLock('${match.id}', ${isManualLocked})">${lockText}</button>`;
        }
    } else {
        if (isRealExist) lockNote = `<span class="match-locked-note">🔒 انتهت المباراة - التوقع مقفل</span>`;
        else if (isManualLocked) lockNote = `<span class="match-locked-note" style="color:var(--danger);font-weight:bold;">🔒 مغلقة</span>`;
        else if (!slotsReady) lockNote = `<span class="match-locked-note" style="color:var(--text-muted);">⏳ بانتظار تحديد الفريقين</span>`;
    }

    let penaltyBox = "";
    if (slotsReady && showsDraw) {
        const pwA = saved.penaltyWinner === 'A' ? 'selected' : '';
        const pwB = saved.penaltyWinner === 'B' ? 'selected' : '';
        penaltyBox = `
            <div class="penalty-box">
                <span class="penalty-label">⚽ الفائز بركلات الترجيح:</span>
                <button type="button" class="penalty-pick-btn ${pwA}" ${isDisabled} onclick="setPenaltyWinner('${match.id}','A')">${escapeHtml(teamA)}</button>
                <button type="button" class="penalty-pick-btn ${pwB}" ${isDisabled} onclick="setPenaltyWinner('${match.id}','B')">${escapeHtml(teamB)}</button>
            </div>`;
    }

    const displayTeamA = teamAKnown ? escapeHtml(teamA) : `<span class="tbd-team">${escapeHtml(teamA || '؟')}</span>`;
    const displayTeamB = teamBKnown ? escapeHtml(teamB) : `<span class="tbd-team">${escapeHtml(teamB || '؟')}</span>`;

    return `
        <div class="ko-match-box" data-match-id="${match.id}">
            <div class="ko-match-date">${match.date ? '📅 ' + match.date : ''}</div>
            <div class="ko-team-row">
                <span class="ko-team-name">${displayTeamA}</span>
                <input type="number" min="0" step="1" ${isDisabled} class="score-input ko-score-input" id="ko-inputA-${match.id}" value="${saved.a !== undefined ? saved.a : ''}" onchange="handleKnockoutScoreChange('${match.id}')">
            </div>
            <div class="ko-vs-sep">vs</div>
            <div class="ko-team-row">
                <span class="ko-team-name">${displayTeamB}</span>
                <input type="number" min="0" step="1" ${isDisabled} class="score-input ko-score-input" id="ko-inputB-${match.id}" value="${saved.b !== undefined ? saved.b : ''}" onchange="handleKnockoutScoreChange('${match.id}')">
            </div>
            ${penaltyBox}
            ${lockNote}
            ${adminLockBtn}
        </div>
    `;
}

// عند تغيير نتيجة مباراة، نعيد الرسم لتحديث ظهور/اختفاء صندوق ركلات
// الترجيح وتحديث أسماء الفرق في الجولة التالية مباشرة (بدون إعادة تحميل من Firebase)
function handleKnockoutScoreChange(matchId) {
    renderKnockoutBracketFromCurrentInputs();
}

function setPenaltyWinner(matchId, slot) {
    const btns = document.querySelectorAll(`.ko-match-box[data-match-id="${matchId}"] .penalty-pick-btn`);
    btns.forEach((b, i) => b.classList.toggle('selected', (i === 0 && slot === 'A') || (i === 1 && slot === 'B')));
    knockoutPendingPenalties[matchId] = slot;
}

let knockoutPendingPenalties = {}; // اختيارات ركلات الترجيح غير المحفوظة بعد، بالذاكرة فقط حتى الحفظ

// إعادة قراءة كل صناديق الإدخال الحالية على الشاشة وإعادة بناء الترتيب
// (يُستخدم بعد كل تغيير لتحديث تأهل الفرق للجولة التالية فوراً في الواجهة)
function renderKnockoutBracketFromCurrentInputs() {
    let liveResults = {};
    knockoutRoundOrder.forEach(rk => {
        knockoutData[rk].matches.forEach(m => {
            const inputA = document.getElementById(`ko-inputA-${m.id}`);
            const inputB = document.getElementById(`ko-inputB-${m.id}`);
            if (inputA && inputB) {
                liveResults[m.id] = {
                    a: inputA.value.trim(),
                    b: inputB.value.trim(),
                    penaltyWinner: knockoutPendingPenalties[m.id] || ""
                };
            }
        });
    });
    renderKnockoutBracket(liveResults, currentMode === 'predict' ? liveResults : {}, true);
}

// يبني عمود كامل (يسار أو يمين) يحتوي كل الجولات من R32 حتى نصف النهائي
function buildKnockoutColumnHtml(side, realResults, userPredictions) {
    let html = "";
    ["round32", "round16", "quarter", "semi"].forEach(rk => {
        const roundMatches = knockoutData[rk].matches.filter(m => m.side === side);
        if (roundMatches.length === 0) return;
        html += `<div class="ko-round-column">`;
        html += `<div class="ko-round-title">${knockoutData[rk].name}</div>`;
        roundMatches.forEach(m => {
            const data = currentMode === 'real' ? realResults : userPredictions;
            html += renderKnockoutMatchBox(m, realResults, data);
        });
        html += `</div>`;
    });
    return html;
}

function renderKnockoutBracket(realResults, userPredictions, skipBadge) {
    const leftCol = document.getElementById('knockout-left-col');
    const rightCol = document.getElementById('knockout-right-col');
    const finalBox = document.getElementById('knockout-final-box');
    if (!leftCol || !rightCol || !finalBox) return;

    const dataForUser = currentMode === 'real' ? realResults : userPredictions;

    leftCol.innerHTML = buildKnockoutColumnHtml('left', realResults, dataForUser);
    rightCol.innerHTML = buildKnockoutColumnHtml('right', realResults, dataForUser);

    const finalMatch = knockoutData.final.matches[0];
    finalBox.innerHTML = `<div class="ko-round-title">🏆 ${knockoutData.final.name} - ${knockoutData.final.date}</div>` +
        renderKnockoutMatchBox(finalMatch, realResults, dataForUser);

    if (!skipBadge) renderKnockoutBadge(realResults, userPredictions);
}

// =================================================================
// قفل/فتح مباراة خروج مغلوب معيّنة يدوياً (نفس فكرة دور المجموعات)
// =================================================================
function toggleKnockoutMatchLock(matchId, isCurrentlyLocked) {
    if (!firebaseReady) return;
    let newState = !isCurrentlyLocked;

    db.collection("worldcup2026").doc("knockout_real").get().then(doc => {
        let data = doc.exists ? doc.data() : {};
        let matchData = data[matchId] || { a: "", b: "" };
        matchData.isLocked = newState;

        db.collection("worldcup2026").doc("knockout_real").set({ [matchId]: matchData }, { merge: true })
            .then(() => loadKnockoutData())
            .catch(err => { console.error(err); alert("❌ حدث خطأ أثناء محاولة تعديل قفل المباراة."); });
    });
}

// =================================================================
// حفظ بيانات خروج المغلوب (نتائج حقيقية من المالك أو توقعات من اللاعب)
// =================================================================
function saveKnockoutData() {
    if (!firebaseReady) return alert("⚠️ لم يتم ضبط Firebase.");

    db.collection("worldcup2026").doc("knockout_real").get().then(realDoc => {
        let latestReal = realDoc.exists ? realDoc.data() : {};
        let dataToSave = {};
        let hasInvalid = false;
        let blockedLockedMatch = false;

        knockoutRoundOrder.forEach(rk => {
            knockoutData[rk].matches.forEach(m => {
                const inputA = document.getElementById(`ko-inputA-${m.id}`);
                const inputB = document.getElementById(`ko-inputB-${m.id}`);
                if (!inputA || !inputB) return;

                const realM = latestReal[m.id];
                const isRealExist = realM && isValidScore(realM.a) && isValidScore(realM.b);
                const isManualLocked = realM && realM.isLocked === true;

                if (currentMode === 'predict' && (isRealExist || isManualLocked)) {
                    blockedLockedMatch = true;
                    return;
                }

                const valA = inputA.value.trim();
                const valB = inputB.value.trim();
                inputA.classList.remove('invalid');
                inputB.classList.remove('invalid');

                if (valA === "" && valB === "") {
                    dataToSave[m.id] = { a: "", b: "", penaltyWinner: "", isLocked: isManualLocked };
                    return;
                }

                if (!isValidScore(valA) || !isValidScore(valB)) {
                    inputA.classList.add('invalid');
                    inputB.classList.add('invalid');
                    hasInvalid = true;
                    return;
                }

                const isDraw = parseInt(valA, 10) === parseInt(valB, 10);
                const penaltyWinner = isDraw ? (knockoutPendingPenalties[m.id] || "") : "";

                dataToSave[m.id] = { a: valA, b: valB, penaltyWinner: penaltyWinner, isLocked: isManualLocked };
            });
        });

        if (hasInvalid) return alert("⚠️ تحقق من النتائج: يجب إدخال أعداد صحيحة غير سالبة.");

        let docName = currentMode === 'real' ? "knockout_real" : `knockout_predict_${currentUser}`;
        db.collection("worldcup2026").doc(docName).set(dataToSave, { merge: true }).then(() => {
            knockoutPendingPenalties = {};
            if (blockedLockedMatch) alert("💾 تم الحفظ. ملاحظة: بعض المباريات كانت مقفلة بالفعل فلم يتم تعديلها.");
            else alert("💾 تم حفظ بيانات خروج المغلوب بنجاح!");
            loadKnockoutData();
        }).catch(err => {
            console.error(err);
            alert("❌ حدث خطأ أثناء الحفظ.");
        });
    });
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

        db.collection("worldcup2026").doc("knockout_real").get().then(koRealDoc => {
            let koReal = koRealDoc.exists ? koRealDoc.data() : {};

            db.collection("worldcup2026").get().then(querySnapshot => {
                let scores = [];
                let koPredictionsByUser = {};

                querySnapshot.forEach(doc => {
                    if (doc.id.startsWith("knockout_predict_")) {
                        koPredictionsByUser[doc.id.replace("knockout_predict_", "")] = doc.data();
                    }
                });

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

                        // ✅ إضافة نقاط مرحلة خروج المغلوب لهذا اللاعب
                        const koPreds = koPredictionsByUser[user] || {};
                        knockoutRoundOrder.forEach(rk => {
                            knockoutData[rk].matches.forEach(m => {
                                totalPoints += pointsForKnockoutPrediction(koPreds[m.id], koReal[m.id]);
                            });
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
