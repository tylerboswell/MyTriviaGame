//Tyler Boswell 7-31-2018

var game = {
    generateVars: function () {
        this.choices = [];
        this.correct = 0;
        this.incorrect = 0;
        this.asked = 0;
        this.timeLeft = -1;
        this.difficulty = "";
        this.diffChoices = ["easy", "medium", "hard"];
        this.catId = "",
            this.clickable = true;
    },
    categoryQuery: function () {
        this.generateVars();
        var selDiv = $('<Div>');
        selDiv.attr('class', 'catSel');
        $('#timer').append(selDiv);
        $.ajax({
            url: "https://opentdb.com/api_category.php",
            method: "GET"
        }).then(function (response) {
            for (var c = 0; c < response.trivia_categories.length; c++) {
                var newCat = $('<button>');
                newCat.attr('data-id', response.trivia_categories[c].id)
                    .attr('class', 'category')
                    .text(response.trivia_categories[c].name)
                $('.catSel').append(newCat);
            }
        })
    },
    // Create difficulty buttons
    difficultyQuery: function () {
        this.cleanBoard();
        for (var i = 0; i < this.diffChoices.length; i++) {
            var newBtn = $('<button>');
            newBtn.attr('data-value', this.diffChoices[i]);
            newBtn.attr('class', 'difButton');
            newBtn.text(this.diffChoices[i].toLocaleUpperCase());
            $('#question').append(newBtn);
        }
    },
    start: function () {
        this.populateArrays();

    },
    // Shuffle answer choices within the array
    shuffleChoices: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    // Call trivia API and populate arrays
    populateArrays: function () {
        this.question = "";
        this.correct_answer = "";
        this.choices = [];
        $.ajax({
            url: "https://opentdb.com/api.php?amount=1&category=" + this.catId + "&difficulty=" + this.difficulty + "&type=multiple",
            method: "GET"
        }).then(function (response) {
            var question = response.results[0].question;
            game.question = question;
            game.correct_answer = response.results[0].correct_answer;
            for (var i = 0; i < response.results[0].incorrect_answers.length; i++) {
                game.choices.push(response.results[0].incorrect_answers[i]);
            }
            game.choices.push(game.correct_answer);
        });
        // populate timer
        setTimeout(game.populateBoard, 1000);
    },
    // Correct answer
    correctAnswer: function () {
        this.cleanBoard();
        $('#question').html('<h1 class="correct"> CORRECT!!!! </h1>');
        setTimeout(game.nextQuestion, 1000 * 1);
        this.correct++;
        this.asked++;
        this.timeLeft = -1;
    },
    // Wrong answer
    wrongAnswer: function (str) {
        this.cleanBoard();
        $('#question').html('<h1 class="wrong"> Nope!!!! </h1>');
        $('#choices').html('<h3 class="remove"> The correct answer was: ' + str + '</h3>');
        setTimeout(game.nextQuestion, 1000 * 1);
        this.incorrect++;
        this.asked++;
        this.timeLeft = -1;
    },
    timer: function () {
        this.timeLeft = 30;

        var timerId = setInterval(countdown, 1000);

        function countdown() {
            if (game.timeLeft === -1) {
                clearTimeout(timerId);
                $('#timer').empty();
            }
            else if (game.timeLeft === 0) {
                clearTimeout(timerId);
                game.outOFtime($('#question').attr('data-answer'));
            }
            else {
                $('#timer').html('You have ' + game.timeLeft + 's left.');
                game.timeLeft--;
            }
        }
    },
    outOFtime: function (str) {
        this.cleanBoard();
        $('#question').html('<h1 class="wrong"> Out of Time </h1>');
        $('#choices').html('<h3 class="remove"> The correct answer was: ' + str + '</h3>');
        this.incorrect++;
        this.asked++;
        setTimeout(game.nextQuestion, 1000 * 1);
    },
    populateBoard: function () {
        $('#question').empty();
        $('.multiChoice').remove();
        $('.remove').empty();
        $('#question').html(game.question);
        $('#question').attr('data-answer', game.correct_answer);
        game.shuffleChoices(game.choices);
        for (var i = 0; i < game.choices.length; i++) {
            var newQdiv = $('<div>');
            newQdiv.attr("class", "multiChoice");
            newQdiv.attr("data-value", game.choices[i]);
            newQdiv.html(game.choices[i]);
            $('#choices').append(newQdiv);
        }
        game.choices = [];
        game.timer();
    },
    nextQuestion: function () {
        if (game.asked > 9) {
            game.cleanBoard();
            $('#timer').text('Game Over');
            $('#question').append('Correct: ' + game.correct + '<br>');
            $('#question').append('Incorrect: ' + game.incorrect);
            var resetBtn = $('<button>');
            resetBtn.attr('onclick', "game.reset()");
            resetBtn.attr('class', 'resetBtn');
            resetBtn.text(' Play Again ');
            $('#choices').append(resetBtn);
        }
        else {
            game.start();
        }
    },
    cleanBoard: function () {
        $('#question').empty();
        $('#timer').empty();
        $('.remove').empty();
        $('#question').removeAttr('data-answer');
        $('.multiChoice').remove();
    },
    reset: function () {
        this.cleanBoard();
        $('.resetBtn').remove();
        this.categoryQuery();
    },
}
// Start game
game.categoryQuery();
$('#timer').on('click', '.category', function () {
    game.catId = $(this).attr('data-id');
    game.difficultyQuery();
});
// Difficulty chosen by user
$('#question').on('click', '.difButton', function () {
    if (game.clickable === true) {
        game.difficulty = $(this).attr('data-value');
        game.clickable = false;
        game.start();
    }
});

// Check answer
$('#choices').on('click', '.multiChoice', function () {
    if ($(this).attr('data-value') === $('#question').attr('data-answer')) {
        game.correctAnswer();
    }
    else {
        game.wrongAnswer($('#question').attr('data-answer'));
    }
});