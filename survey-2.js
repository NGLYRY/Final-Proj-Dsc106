console.log("survey-2.js loaded");

const survey_2 = document.querySelector('.survey-2');
let startTime = null;
let endTime = null;
let answeredQuestions = 0;

async function fetchJSON(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`failed to fetch json: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("JSON OK!", data);

        return data;
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

function createQuestion(question, index) {
    const qDiv = document.createElement('div');
    qDiv.classList.add('question', 'nes-container', 'is-rounded'); // Add NES.css classes

    const qLabel = document.createElement('h3');
    qLabel.textContent = `Question ${index + 1}`;

    const qText = document.createElement('p');
    qText.textContent = question.question;

    qDiv.appendChild(qLabel);
    qDiv.appendChild(qText);

    const ul = document.createElement('ul');

    question.answers.forEach((answer, i) => {
        const li = document.createElement('li');
        li.classList.add('custom-checkbox'); // Add custom class for styling

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = `question${index + 1}`;
        input.value = `option${i + 1}`;
        input.classList.add('custom-checkbox'); // Add NES.css class for checkbox styling

        // Add event listener to enforce one-checkbox-per-question rule
        input.addEventListener('change', function() {
            if (!startTime) {
                startTime = new Date();
            }

            const checkboxes = document.querySelectorAll(`input[name="question${index + 1}"]`);
            checkboxes.forEach(checkbox => {
                if (checkbox !== this) {
                    checkbox.checked = false;
                }
            });

            if (this.checked) {
                answeredQuestions++;
            } else {
                answeredQuestions--;
            }

            if (answeredQuestions === 5) {
                endTime = new Date();
                const timeTaken = (endTime - startTime) / 1000; // Time in seconds
                localStorage.setItem('survey2Time', timeTaken);
                console.log(`Regular Survey: ${timeTaken} seconds`);
            }
        });

        const span = document.createElement('span');
        span.textContent = answer.text;

        li.appendChild(input);
        li.appendChild(span);
        ul.appendChild(li);
    });

    qDiv.appendChild(ul);

    survey_2.appendChild(qDiv); // Append to survey_2 container
}

function createSurvey(questions) {
    questions.forEach((question, index) => {
        createQuestion(question, index);
    });
}

fetchJSON('./lib/questions.json').then((questions) => {
    createSurvey(questions);
});