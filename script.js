const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "nexoraStudyDataV2";
let currentBoard = "";
let currentClass = "";
let currentSubject = "";
let currentChapter = "";
let quizAnswered = false;

const class10Subjects = [
  {name:"Mathematics", icon:"∑", chapters:["Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Some Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes","Statistics","Probability"]},
  {name:"Science", icon:"⚗", chapters:["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and Its Compounds","Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity","Light – Reflection and Refraction","The Human Eye and the Colourful World","Electricity","Magnetic Effects of Electric Current","Our Environment"]},
  {name:"Social Science", icon:"⌖", chapters:["History: The Rise of Nationalism in Europe","History: Nationalism in India","History: The Making of a Global World","Geography: Resources and Development","Geography: Forest and Wildlife Resources","Geography: Water Resources","Civics: Power Sharing","Civics: Federalism","Economics: Development","Economics: Sectors of the Indian Economy"]},
  {name:"English", icon:"Aa", chapters:["A Letter to God","Nelson Mandela: Long Walk to Freedom","Two Stories about Flying","From the Diary of Anne Frank","Glimpses of India","Mijbil the Otter","Madam Rides the Bus","The Sermon at Benares","The Proposal","Grammar and Writing Practice"]},
  {name:"Hindi", icon:"अ", chapters:["पाठ्यपुस्तक के गद्य पाठ","पाठ्यपुस्तक के पद्य पाठ","पूरक पठन","व्याकरण","लेखन कौशल"]},
  {name:"Sanskrit", icon:"सं", chapters:["अपठित अवबोधनम्","रचनात्मक कार्यम्","सन्धि","समास","प्रत्यय","वाच्य परिवर्तनम्","समय लेखनम्","पठित अवबोधनम्"]}
];
const genericSubjects = {
  junior:["Mathematics","Science","English","Hindi","Social Studies"],
  senior:["Physics","Chemistry","Mathematics","Biology","English"]
};
const lessonData = {
  "Chemical Reactions and Equations": {
    intro:"A chemical reaction is a process in which one or more substances change into new substances with different properties.",
    sections:[["Chemical reaction","Reactants are the starting substances. Products are the new substances formed during a reaction."],["Chemical equation","A chemical equation represents a reaction using chemical symbols and formulae."],["Balanced equation","An equation is balanced when each element has the same number of atoms on both sides. Example: 2H₂ + O₂ → 2H₂O."],["Types of reactions","Common types include combination, decomposition, displacement, double displacement and redox reactions."],["Corrosion and rancidity","Corrosion is the gradual damage of metals by their environment. Rancidity is the oxidation of fats and oils."]]
  },
  "Real Numbers": {intro:"Real numbers include rational and irrational numbers. This chapter explores the fundamental properties of real numbers.",sections:[["Euclid’s division lemma","For positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b."],["Fundamental theorem of arithmetic","Every composite number can be expressed as a product of primes, and this factorisation is unique apart from order."],["HCF and LCM","Prime factorisation can be used to find the highest common factor and least common multiple."]]},
  "Polynomials": {intro:"A polynomial is an algebraic expression made from variables and coefficients with non-negative integer powers.",sections:[["Zeroes","A zero of a polynomial is a value of the variable for which the polynomial becomes zero."],["Relationship of zeroes and coefficients","For ax² + bx + c, the sum of zeroes is −b/a and the product is c/a."],["Division algorithm","For polynomials p(x) and g(x), p(x) = g(x)q(x) + r(x)."]]}
};

function loadData(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{completed:[],scores:[],notes:[]}}catch(e){return {completed:[],scores:[],notes:[]}}}
let appData=loadData();
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(appData));updateStats()}
function updateStats(){
  $("completedCount").textContent=appData.completed.length;
  $("quizCount").textContent=appData.scores.length;
  $("averageScore").textContent=appData.scores.length?Math.round(appData.scores.reduce((a,b)=>a+b,0)/appData.scores.length)+"%":"—";
}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  $(name+"View").classList.add("active");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("currentSection").textContent=name==="learn"?"My Learning":name==="tutor"?"AI Tutor":name==="quiz"?"Quiz & Practice":name==="notes"?"My Notes":"Dashboard";
  $("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.go)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));

function loadSubjects(){
  currentBoard=$("boardSelect").value; currentClass=$("classSelect").value;
  $("subjectArea").classList.add("hidden"); $("selectionNote").textContent="Choose a board and class to load available subjects.";
  if(!currentBoard||!currentClass)return;
  $("selectionNote").textContent=currentBoard+" • Class "+currentClass+" selected. Class 10 MP Board has the first chapter library prototype; other combinations show a subject structure while content is being prepared.";
  const subjects=Number(currentClass)===10?class10Subjects.map(s=>s.name):(Number(currentClass)<=8?genericSubjects.junior:genericSubjects.senior);
  $("subjectGrid").innerHTML="";
  subjects.forEach(name=>{
    const data=class10Subjects.find(s=>s.name===name);
    const btn=document.createElement("button");btn.className="subject-card";
    btn.innerHTML=`<b>${data?data.icon:"✧"} &nbsp; ${name}</b><small>${data&&currentBoard==="MP Board"?"Chapter list available":"Learning section planned"}</small>`;
    btn.addEventListener("click",()=>selectSubject(name,btn));$("subjectGrid").appendChild(btn);
  });
  $("subjectArea").classList.remove("hidden");$("chapterArea").classList.add("hidden");$("lessonArea").classList.add("hidden");
}
$("boardSelect").addEventListener("change",loadSubjects);$("classSelect").addEventListener("change",loadSubjects);
function selectSubject(subject,button){
  currentSubject=subject;document.querySelectorAll(".subject-card").forEach(b=>b.classList.remove("selected"));button.classList.add("selected");
  const isSupported=currentBoard==="MP Board"&&Number(currentClass)===10;
  const data=class10Subjects.find(s=>s.name===subject);
  $("chapterHeading").textContent=subject+" chapters";$("chapterEyebrow").textContent=currentBoard.toUpperCase()+" • CLASS "+currentClass;
  $("chapterList").innerHTML="";
  if(isSupported&&data){
    data.chapters.forEach((chapter,i)=>{
      const b=document.createElement("button");b.className="chapter-item";
      b.innerHTML=`<span>${i+1}. ${chapter}</span><small>Open lesson →</small>`;
      b.addEventListener("click",()=>openLesson(chapter));$("chapterList").appendChild(b);
    });
  }else{
    $("chapterList").innerHTML='<p class="subtle">This subject structure is ready, but its board-specific chapter list and verified lesson content are not added yet.</p>';
  }
  $("chapterArea").classList.remove("hidden");$("lessonArea").classList.add("hidden");
}
function openLesson(chapter){
  currentChapter=chapter;$("lessonTitle").textContent=chapter;
  const data=lessonData[chapter];
  if(data){
    $("lessonContent").innerHTML=`<p>${data.intro}</p>`+data.sections.map(s=>`<h3>${s[0]}</h3><p>${s[1]}</p>`).join("");
    $("lessonStatus").textContent="Introductory lesson available";
  }else{
    $("lessonContent").innerHTML='<div class="content-warning">This chapter is listed in the learning library, but its full explanation, examples and exercises are still being prepared. We will add verified board-specific content before marking it complete.</div>';
    $("lessonStatus").textContent="Chapter listing available • lesson content pending";
  }
  $("completeChapter").textContent=appData.completed.includes(chapter)?"Completed ✓":"Mark complete ✓";
  $("lessonArea").classList.remove("hidden");$("lessonArea").scrollIntoView({behavior:"smooth",block:"start"});
}
$("completeChapter").addEventListener("click",()=>{
  if(!currentChapter)return;
  if(!appData.completed.includes(currentChapter))appData.completed.push(currentChapter);
  saveData();$("completeChapter").textContent="Completed ✓";
});

function addChat(text,type){const div=document.createElement("div");div.className="chat-message "+type;const b=document.createElement("b");b.textContent=type==="user"?"YOU":"NEXORA TUTOR";const p=document.createElement("p");p.textContent=text;div.append(b,p);$("chatWindow").appendChild(div);$("chatWindow").scrollTop=$("chatWindow").scrollHeight}
function sendTutor(){
  const q=$("tutorInput").value.trim();if(!q)return;addChat(q,"user");$("tutorInput").value="";
  const lang=$("languageSelect").value;
  const reply=lang==="Hindi"?"यह अभी NEXORA का demo tutor है। वास्तविक AI उत्तर देने के लिए सुरक्षित backend और AI API जोड़ना बाकी है। फिलहाल अपने सवाल को छोटे भागों में बाँटकर पढ़ने की कोशिश करें।":"This is the NEXORA demo tutor. A secure backend and AI API still need to be connected for real AI answers. For now, try breaking your question into smaller parts and studying them one by one.";
  setTimeout(()=>addChat(reply,"assistant"),450);
}
$("sendTutor").addEventListener("click",sendTutor);$("tutorInput").addEventListener("keydown",e=>{if(e.key==="Enter")sendTutor()});
$("clearChat").addEventListener("click",()=>$("chatWindow").innerHTML="");

$("quickOptions").querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
  if(quizAnswered)return;quizAnswered=true;
  const correct=btn.dataset.answer==="correct";btn.classList.add(correct?"correct":"wrong");
  $("quickOptions").querySelectorAll("button").forEach(b=>{b.disabled=true;if(b.dataset.answer==="correct")b.classList.add("correct")});
  $("quickFeedback").textContent=correct?"Correct! Zinc reacts with dilute hydrochloric acid to release hydrogen gas.":"Not quite. The correct answer is Hydrogen.";
  appData.scores.push(correct?100:0);saveData();
}));
$("makeQuiz").addEventListener("click",()=>{
  const topic=$("quizTopic").value.trim();$("quizTopicFeedback").textContent=topic?`Practice topic saved: "${topic}". A topic-specific question bank is coming soon.`:"Please enter a topic first.";
});
$("saveNote").addEventListener("click",()=>{
  const title=$("notesTitle").value.trim(),body=$("notesBody").value.trim();
  if(!title||!body){$("noteFeedback").textContent="Add a title and some note content first.";return}
  appData.notes.unshift({title,body});saveData();$("notesTitle").value="";$("notesBody").value="";$("noteFeedback").textContent="Note saved on this device.";renderNotes();
});
function renderNotes(){
  $("savedNotes").innerHTML="";
  appData.notes.forEach((note,index)=>{
    const card=document.createElement("div");card.className="saved-note";
    const title=document.createElement("strong");title.textContent=note.title;
    const p=document.createElement("p");p.textContent=note.body;
    const del=document.createElement("button");del.textContent="Delete note";del.addEventListener("click",()=>{appData.notes.splice(index,1);saveData();renderNotes()});
    card.append(title,p,del);$("savedNotes").appendChild(card);
  });
}
updateStats();renderNotes();
