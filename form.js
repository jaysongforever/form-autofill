const isDict = dict => {
    return typeof dict === "object" && !Array.isArray(dict);
}

function remove(arrOriginal, elementToRemove) {
    return arrOriginal.filter(function (el) {
        return el !== elementToRemove
    });
}


function getElementsByXpath(path, parent) {
    let results = [];
    let query = document.evaluate(path, parent || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }
    return results;
}

function fuzzyMatch(questions, answers) {
    if (answers instanceof Array) {
        return answers
    }

    let newAnswers = [];
    questions.forEach((question) => {
        let title = question.querySelector('[role="heading"]')
        let titleText = title.textContent

        let deleteKey;
        for (const [key, value] of Object.entries(answers)) {
            if (titleText.includes(key)) {
                newAnswers.push(value)

                break
            }
        }

        if (deleteKey !== null) {
            delete answers[deleteKey]
        }
    })

    return newAnswers
}

function autoAnswer(questions, answers) {
    answers = fuzzyMatch(questions, answers)
    console.log(answers)
    for (let i = 0; i < questions.length; i++) {
        let question = questions[i]
        let answer = answers[i]

        switch (typeof answer) {
            case 'number':
                let choices = question.querySelectorAll('div[role="radio"]')
                let choice = choices[answer - 1]
                choice.click()
                break
            case 'string':
                if (answer === "") {
                    break
                }

                let inputField = question.querySelector("textarea") || question.querySelector("input")
                inputField.value = answer
                let event = document.createEvent('HTMLEvents');
                event.initEvent("input", true, true);
                event.eventType = 'message';
                inputField.dispatchEvent(event);
                break
            case 'object':
                if (Array.isArray(answer)) {
                    let choices = question.querySelectorAll('span[dir="auto"]')
                    choices.forEach((choice, index) => {
                        answer.forEach(answerChoice => {
                                if (index + 1 === answerChoice) {
                                    choice.click()
                                } else {

                                }
                            }
                        )
                    })
                } else if (isDict(answer)) {
                    autoMatchAnswer(question, answer)
                } else {
                    console.error(`not match info ${answers}`)
                }
                break
            default:
                break
        }

    }

    // let button = getElementByXpath('//*[@role="button"]//span[contains(text(),"提交")]')
    // button.click()
}

function autoMatchAnswer(question, answer) {
    let matchAnswer = answer["answer"]
    switch (typeof matchAnswer) {
        case 'string':
            let choices = question.querySelectorAll('.docssharedWizToggleLabeledContainer')
            choices.forEach(choice => {
                if (choice.textContent.includes(matchAnswer)) {
                    choice.click()
                }
            })
            break
        case 'object':
            if (Array.isArray(matchAnswer)) {
                    let choices = question.querySelectorAll('span[dir="auto"]')
                choices.forEach((choice) => {
                    let deleteValue;
                    matchAnswer.forEach((value) => {
                        console.log(choice.textContent, value)
                        if (choice.textContent.includes(value)) {
                            choice.click()
                            deleteValue = value
                        }

                    })

                    if (deleteValue !== null) {
                        matchAnswer = remove(matchAnswer, deleteValue)
                    }
                })
            }
    }


}


function getQuestions() {
    let itemPath = '//div[contains(@data-params, "%.@.")]'
    return getElementsByXpath(itemPath)
}

function exportQuestions() {
    let questions = getQuestions()

    let titles = ""
    questions.forEach((question) => {
        let title = question.querySelector('[role="heading"]')
        titles += title.textContent + "\n"
    })

    console.log(titles)

}

function run(answers) {
    let questions = getQuestions()
    autoAnswer(questions, answers)
}
