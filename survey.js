// Things to make
// 1. The survey window that will change the page after each question is answered
// 2. Make the survey transition to the second survey page that will be gamified
// 3. Make the survey transition to the writeup page

const survey = document.querySelector('.survey');

const url = '../lib/questions.json';
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
    qDiv.classList.add('question', 'nes-container', 'is-rounded', `q${index + 1}`);

    const qLabel = document.createElement('h3');
    qLabel.classList.add('nes-text');
    qLabel.textContent = `Question ${index + 1}`;

    const qText = document.createElement('p');
    qText.classList.add('question-text'); // Add a custom class for styling
    qText.textContent = question.question;

    qDiv.appendChild(qLabel);
    qDiv.appendChild(qText);

    const ul = document.createElement('ul');

    const colors = ['rgb(5, 125, 5)', 'rgb(20, 89, 199)', 'rgb(90, 87, 87)', 'rgb(231, 161, 11)', 'rgb(176, 22, 22)'];

    question.answers.forEach((answer, i) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.classList.add('custom-checkbox'); // Add a custom class for styling

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = `question${index + 1}`;
        input.value = `option${i + 1}`;
        input.classList.add('custom-checkbox');
        input.disabled = true; // Initially disable the checkboxes

        const span = document.createElement('span');
        span.textContent = answer.text;

        // Apply different colors
        const color = colors[i % colors.length];
        if (color.startsWith('rgb')) {
            span.style.color = color;
        } else {
            span.classList.add(color);
        }

        label.appendChild(input);
        label.appendChild(span);
        li.appendChild(label);
        ul.appendChild(li);
        // make the next question visible when an answer is chosen 
        input.addEventListener('change', function () {
            if (input.checked) {
                const nextQuestion = document.querySelector(`.q${index + 2}`);
                if (nextQuestion) {
                    nextQuestion.classList.add('visible');
                }
            }
        });
    });

    qDiv.appendChild(ul);

    survey.appendChild(qDiv);
    
}

function createSurvey(questions) {
    questions.forEach((question, index) => {
        createQuestion(question, index);
    });

    // Add event listeners for checkboxes and update progress bar
    const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    const progressBar = document.getElementById('survey-progress');
    const totalQuestions = questions.length;
    let answeredQuestions = 0;

    const progressColors = ['is-error', 'is-warning', 'is-primary', 'is-success', 'is-pattern'];

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const questionName = this.name;
            const questionCheckboxes = document.querySelectorAll(`input[name="${questionName}"]`);

            // Ensure only one checkbox is selected per question
            questionCheckboxes.forEach(cb => {
                if (cb !== this) {
                    cb.checked = false;
                }
            });

            // Update progress bar
            answeredQuestions = Array.from(checkboxes).filter(cb => cb.checked).length;
            const progressValue = (answeredQuestions / totalQuestions) * 100;
            progressBar.value = progressValue;

            // Update progress bar color
            let colorIndex = Math.floor((answeredQuestions / totalQuestions) * (progressColors.length - 1));
            if (answeredQuestions === totalQuestions) {
                colorIndex = progressColors.length - 1; // Ensure the last color is used for 100%
            }
            progressBar.className = `nes-progress ${progressColors[colorIndex]}`;
        });
    });
}

// Show progress bar and enable checkboxes when start button is clicked
document.getElementById('start-button').addEventListener('click', function () {
    document.getElementById('progress-container').style.display = 'block';
    this.style.display = 'none'; // Hide the start button

    // Enable all checkboxes
    const checkboxes = document.querySelectorAll('.custom-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
    });

    // Make the first question visible
    const firstQuestion = document.querySelector('.q1');
    if (firstQuestion) {
        firstQuestion.classList.add('visible');
    }
});

fetchJSON(url).then((questions) => {
    createSurvey(questions);
});