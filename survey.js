// Things to make
// 1. The survey window that will change the page after each question is answered
// 2. Make the survey transisition to the second survey page that will be gameified
// 3. Make the survey transisition to the writeup page

// const questions = await fetchJSON('../lib/questions.json');

const survey = document.querySelector('.survey');

async function fetchJSON(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`failed to fecth json: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("JSON OK!", data);

        return data;
    }

    catch (error) {
        console.error('Error fetching or pasing JSON data:', error);
    }
}

function createQuestion(question, index) {

    const qDiv = document.createElement('div');
    qDiv.classList.add('question');

    const qLabel = document.createElement('h3');
    qLabel.textContent = `Question ${index + 1}`;

    const qText = document.createElement('p');
    qText.textContent = question.question;

    qDiv.appendChild(qLabel);
    qDiv.appendChild(qText);

    const ul = document.createElement('ul');

    question.answers.forEach((answer) => {
        const li = document.createElement('li');
        li.textContent = answer.text;
        ul.appendChild(li); 
    });

    qDiv.appendChild(ul);

    survey.appendChild(qDiv);
}

function createSurvey(questions) {
    questions.forEach((question, index) => {
        createQuestion(question, index);
    });
}

fetchJSON('../lib/questions.json').then((questions) => {
    createSurvey(questions);
});