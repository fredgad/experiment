import { getDatabase, ref, set, child, get } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-analytics.js";
// https://firebase.google.com/docs/web/setup#available-libraries

document.addEventListener("DOMContentLoaded", (e) => {
  const firebaseConfig = {
    apiKey: "AIzaSyCkT4vSBPK6y49K839lr_yqbTz9HWlOCYc",
    authDomain: "candy-poll.firebaseapp.com",
    databaseURL: "https://candy-poll-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "candy-poll",
    storageBucket: "candy-poll.appspot.com",
    messagingSenderId: "410505777255",
    appId: "1:410505777255:web:0b8ec00fb3c8a59ebb44c2",
    measurementId: "G-JXVWPD04GH"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase();
  const analytics = getAnalytics(app);
  // Variables
  const guessWithoutHelp = document.getElementById('guess-without-help');
  const guessWithHelp = document.getElementById('guess-with-help');
  const withoutHelpBlock = document.getElementById('without-help');
  const withHelpBlock = document.getElementById('with-help');
  const surveyBlock = document.getElementById('survey-block');
  const promptBlock = document.getElementById('prompt-block');
  const resultsBlock = document.getElementById('results-block');
  const promtDone = document.getElementById('promt-done');

  const exactCount = 81;
  const firstAnswersArray = [];
  const secondAnswersArray = [];
  const moreAccurateIndividualsArrayWithoutHelp = [];
  const moreAccurateIndividualsArrayWithHelp = [];
  const moreAccurateThenYouArrayWithoutHelp = [];
  const moreAccurateThenYouArrayWithHelp = [];
  let firstAnswerName;
  let secondAnswerName;

  // Init
  !function initialiseApp() {
    const storage = window.localStorage.getItem('answers');
    if (storage) {
      hideAllAndShowResults(storage);
    }
  }();

  // Events
  guessWithoutHelp.addEventListener('change', (e) => {
    e.preventDefault();
    firstAnswerName = `f_${Date.now()}`;
    writeUserAnswerWithoutHelp(guessWithoutHelp.value, firstAnswerName);
  });

  guessWithHelp.addEventListener('change', (e) => {
    e.preventDefault();
    secondAnswerName = `s_${Date.now()}`;
    writeUserAnswerWithHelp(guessWithHelp.value, secondAnswerName);
  });

  promtDone.addEventListener('click', () => {
    hidePromtShowSurveyAndSecondIntput();
  });


  // Functions
  function writeUserAnswerWithoutHelp(answer, firstAnswerName) {
    set(ref(database, `data/users-without-help/${firstAnswerName}`), answer);

    hideFirstBlockAndShowPrompt();
  }

  function writeUserAnswerWithHelp(answer) {
    set(ref(database, `data/users-with-help/s_${Date.now()}`), answer);

    hideAllAndShowResults()
  }


  function hideFirstBlockAndShowPrompt() {
    withoutHelpBlock.style.display = 'none';
    surveyBlock.style.display = 'none';
    promptBlock.style.display = 'flex';
  }

  function hidePromtShowSurveyAndSecondIntput() {
    promptBlock.style.display = 'none';
    surveyBlock.style.display = 'flex';
    withHelpBlock.style.display = 'flex';
  }

  function hideAllAndShowResults(storage) {
    surveyBlock.style.display = 'none';
    promptBlock.style.display = 'none';
    resultsBlock.style.display = 'flex';

    if (storage) {
      firstAnswerName = storage.split(',')[0];
      secondAnswerName = storage.split(',')[1];
    } else {
      window.localStorage.setItem('answers', [firstAnswerName, secondAnswerName]);
    }
    getData();
  }

  function getData() {
    get(child(ref(database), 'data')).then((snapshot) => {
      if (snapshot.exists()) {
        calculateData(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  function calculateData(value) {
    console.log(value, 'calculateData(value)')
    let firstAnswer,
        secondAnswer,
        peopleVoted,
        collectiveAnswerWithoutHelp,
        collectiveAnswerWithHelp,
        collectiveWithoutHelpMoreAccurate,
        collectiveWithHelpMoreAccurate,
        yourAnswerWithoutHelpMoreAccurate,
        yourAnswerWithHelpMoreAccurate;

    for (var key in value['users-without-help']) {
      // if (key !== firstAnswerName) {
        firstAnswersArray.push(value['users-without-help'][key])
      // }
    }

    for (var key in value['users-with-help']) {
      // if (key !== secondAnswerName) {
        secondAnswersArray.push(value['users-with-help'][key])
      // }
    }

    firstAnswer = value['users-without-help'][firstAnswerName];
    secondAnswer = value['users-with-help'][secondAnswerName];
    peopleVoted = firstAnswersArray.length;
    collectiveAnswerWithoutHelp = (firstAnswersArray.reduce((a, b) => (+a + +b)) / firstAnswersArray.length).toFixed(0);
    collectiveAnswerWithHelp = (secondAnswersArray.reduce((a, b) => (+a + +b)) / secondAnswersArray.length).toFixed(0);

    firstAnswersArray.forEach((answer) => {
      const collectiveAnswerWithoutHelpDifference = Math.abs(exactCount - collectiveAnswerWithoutHelp);
      const yourAnswerWithoutHelpDifference = Math.abs(exactCount - firstAnswer);
      const answerDifference = Math.abs(exactCount - answer);

      if (answerDifference < collectiveAnswerWithoutHelpDifference) {
        moreAccurateIndividualsArrayWithoutHelp.push(answerDifference);
      }
      collectiveWithoutHelpMoreAccurate =
        `${(100 - (moreAccurateIndividualsArrayWithoutHelp.length / firstAnswersArray.length * 100)).toFixed(2)}%`;

      if (answerDifference < yourAnswerWithoutHelpDifference) {
        moreAccurateThenYouArrayWithoutHelp.push(answerDifference);
      }
      yourAnswerWithoutHelpMoreAccurate =
        `${(100 - ((moreAccurateThenYouArrayWithoutHelp.length + 1) / firstAnswersArray.length * 100)).toFixed(2)}%`;
    });

    secondAnswersArray.forEach((answer) => {
      const collectiveAnswerWithHelpDifference = Math.abs(exactCount - collectiveAnswerWithHelp);
      const yourAnswerWithHelpDifference = Math.abs(exactCount - secondAnswer);
      const answerDifference = Math.abs(exactCount - answer);

      if (answerDifference < collectiveAnswerWithHelpDifference) {
        moreAccurateIndividualsArrayWithHelp.push(answerDifference);
      }
      collectiveWithHelpMoreAccurate = 
        `${(100 - (moreAccurateIndividualsArrayWithHelp.length / secondAnswersArray.length * 100)).toFixed(2)}%`;

      if (answerDifference < yourAnswerWithHelpDifference) {
        moreAccurateThenYouArrayWithHelp.push(answerDifference);
      }
      yourAnswerWithHelpMoreAccurate =
        `${(100 - ((moreAccurateThenYouArrayWithHelp.length + 1) / secondAnswersArray.length * 100)).toFixed(2)}%`;
    });

    const noComplited = firstAnswersArray.length - secondAnswersArray.length;
    console.log(noComplited, 'noComplited')

    displayData(
      firstAnswer,
      secondAnswer,
      peopleVoted,
      collectiveAnswerWithoutHelp,
      collectiveAnswerWithHelp,
      collectiveWithoutHelpMoreAccurate,
      collectiveWithHelpMoreAccurate,
      yourAnswerWithoutHelpMoreAccurate,
      yourAnswerWithHelpMoreAccurate,
      noComplited
    );
  }

  function displayData(
    firstAnswer,
    secondAnswer,
    peopleVoted,
    collectiveAnswerWithoutHelp,
    collectiveAnswerWithHelp,
    collectiveWithoutHelpMoreAccurate,
    collectiveWithHelpMoreAccurate,
    yourAnswerWithoutHelpMoreAccurate,
    yourAnswerWithHelpMoreAccurate,
    noComplited
    ) {
    document.getElementById('your-answer-without-help').innerText = firstAnswer;
    document.getElementById('your-answer-with-help').innerText = secondAnswer;
    document.getElementById('people-voted').innerText = peopleVoted;
    document.getElementById('no-complited').innerText = noComplited;
    document.getElementById('collective-answer-without-help').innerText = collectiveAnswerWithoutHelp;
    document.getElementById('collective-answer-with-help').innerText = collectiveAnswerWithHelp;
    document.getElementById('collective-answer-without-help-more-accurate').innerText = collectiveWithoutHelpMoreAccurate;
    document.getElementById('collective-answer-with-help-more-accurate').innerText = collectiveWithHelpMoreAccurate;
    document.getElementById('your-without-help-more-accurate').innerText = yourAnswerWithoutHelpMoreAccurate;
    document.getElementById('your-with-help-more-accurate').innerText = yourAnswerWithHelpMoreAccurate;

  }


  // Language swap
  const swapButton = document.getElementById('swap');
  const LangElements = document.querySelectorAll('.Lang');

  (function initLangFromStorage() {
    const langValue = localStorage.getItem('lang');
    if (langValue === "ENG") {
      changeLanguage(0)
      return;
    } 
    changeLanguage(1)
  })();

  function changeLanguage(bool) {
    Array.from(LangElements).forEach(el => {
      if(bool) {
          el.innerText =  el.getAttribute('data-r')
          localStorage.setItem('lang', 'ENG');
      } else {
          el.innerText =  el.getAttribute('data-e')
          localStorage.setItem('lang', 'РУС');
      }
    })
  }

  swapButton.addEventListener('click', () => {
    const langValue = localStorage.getItem('lang');
    if (langValue === "ENG") {
      changeLanguage(0)
    } else {
      changeLanguage(1)
    }
  });
  // Language swap
});
