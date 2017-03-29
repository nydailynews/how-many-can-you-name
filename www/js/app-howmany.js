var quizzer = {
    correct_count: 0,
    correct: new Array(),
    answer_key: new Array(),
    answer_key_merged: new Array(),
    answer_times: new Array(),
    split_answer: new Array(),
    answer_count: 0,
    mins: 0,
    secs: 0,
    time_on_current_answer: 0,
    config: 
    { 
        slug: '',
        log_url: '',
        has_photos: 0,
        log_answers: 0,
    },
    update_config: function(config) {
        // Take an external config object and update this config object.
        for ( var key in config )
        {
            if ( config.hasOwnProperty(key) )
            {
                this.config[key] = config[key];
            }
        }
    },
    time_count: function() 
    {
        // Count down.
        this.mins = 1 * this.min_count($('#time_limit').attr('value'));
        this.secs = 0 + this.sec_count(":01");
        this.counter();
    },
    min_count: function(input) 
    {
        // Pull out the minutes part of a time string, as in the "1" part of, say, "1:30"
        var len = input.length;

        for( var i = 0; i < len; i++ ) if( input.substring(i, i + 1) == ":" ) break;

        return input.substring(0, i);
    },
    sec_count: function(input) 
    {
        // Pull out the seconds part of a time string, as in the "30" part of, say, "1:30"
        var len = input.length;

        for( var i = 0; i < len; i++ ) if( input.substring(i, i + 1) == ":" ) break;

        return input.substring(i + 1, input.length);
    },
    counter: function() 
    {
        // Deal with the passage of time.
        if( this.correct_count == this.answer_key.length ) return;
        this.time_on_current_answer++;
        this.secs--;
        if( this.secs == -1 ) 
        {
            this.secs = 59;
            this.mins--;

            // This situation happens if we end a game early.
            if ( this.mins < 0 )
            {
                this.mins = 0;
                this.secs = 0;
            }
        }
        document.time_count.timer.value = this.display_time(this.mins,this.secs);

        if( this.mins == 0 && this.secs == 0 && this.alerted == 0 ) 
        {
            this.alerted = 1;
            this.show_answers(); 
        } 
        else 
        {
            cd = setTimeout("quizzer.counter()", 1000);
        }
    },
    display_time: function(mins,secs) 
    {
        // Format a string so we can show readers how much time they have left.
        var display;

        if ( mins <= 9 ) display = " ";
        else display = " ";

        display += mins + ":";

        if ( secs <= 9 ) display += "0" + secs;
        else display += secs;

        return display;
    },
    quit: function()
    {
        // Sometimes games end early.
        this.secs = 1;
        this.mins = 0;
        return false;
    },
    alerted: 0,
    slugify: function (text) {
        // from https://gist.github.com/mathewbyrne/1280286
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    },
    find_in_array: function(value, array)
    {
        // Loop through an array, if a string is found in the array then 
        // return the index of the array item found.
        // Otherwise, return -1.
        var len = array.length;
        for ( var i = 0; i < len; i++ )
        {
            if ( array[i].indexOf(value) !== -1 ) return i;
        }
        return -1;
    },
    is_true_in_array: function(value, array)
    {
        // The boolean version of find_in_array.
        if ( this.find_in_array(value, array) === -1 ) return false;
        return true;
    },
    check_answer: function(input)
    {
        // Take the current value of the input field people type their answers into.
        // If there's something in that field, and it matches any of the strings
        // remaining in the answer_key array, we have a new, correct answer.

        if ( input.value.length > 0 )
        {
            var len = this.answer_key_merged.length;
            for ( var i = 0; i < len; i++ )
            {
                if ( input.value.toLowerCase() == this.answer_key_merged[i].toLowerCase() )
                {
                    this.time_on_current_answer = 0;
                    var answer = this.answer_key_merged[i]
                    this.correct.unshift(answer)
                    this.answer_key_merged.splice(i,1);

                    // SPLIT ANSWWER
                    // See if the correct answer was one of the split answers and 
                    // if so, remove it from answer_key too.
                    if ( this.find_in_array(answer, this.split_answer) > -1 )
                    {
                        // It's a splitter, so find it in the answer_key, remove it from answer_key,
                        // and remove its partner from answer_key_merged
                        var splitter_in_main_key = this.find_in_array(answer, this.answer_key);
                        var other_split = this.answer_key[splitter_in_main_key].replace(answer, '').replace('/', '').trim();
                        var other_index = this.answer_key_merged.indexOf(other_split);
                        
                        // Clean up answer_key and answer_key_merged
                        this.answer_key_merged.splice(other_index, 1);
                        this.answer_key.splice(splitter_in_main_key, 1);
                
                    }
                    else
                    {
                        // It's not a splitter, so just find it in answer_key
                        // and remove it.
                        var j = this.answer_key.indexOf(answer);
                        this.answer_key.splice(j,1);
                    }
                    input.value = "";
                    this.correct_count++;
                    this.answer_times.push((this.mins * 60) + this.secs);

                    // PHOTO ANSWER
                    if ( this.config.has_photos === 0 )
                    {
                        $("#correct").append("<li>" + this.correct[0] + "</li>");
                    }
                    else
                    {
                        this.photo_activate(this.correct[0], 'correct');
                    }
                    
                    var remainmsg = " remain";
                    $("#remain").text( (this.answer_count - this.correct_count) + remainmsg );
                    if ( this.correct_count == this.answer_count ) window.alert("You win!"); 
                    return;
                }
            }
            // SEND HELP'ER
            if ( input.value.length > 2 )
            {
                // If they don't have a right answer yet, check to make sure they're
                // on the right track, and if not, color the text red.
                var all_wrong = 1;
                var len = this.answer_key.length;
                for ( var i = 0; i < len; i++ )
                {
                    var c = input.value.toLowerCase();
                    if ( this.answer_key[i].toLowerCase().indexOf(c) === 0 )
                    {
                        all_wrong = 0;
                    }
                }
                if ( all_wrong == 1 ) $('input#answer').addClass('wrong');
                else $('input#answer').removeClass('wrong');
            }
            else $('input#answer').removeClass('wrong');
        }
        else
        {
            if( input.value == " " ) input.value = "";
        }
    },
    photo_activate: function(answer, correct_toggle)
    {
        // Activate a photo in a photo answer. correct_toggle will be "correct" or "incorrect"
        var answer_slug = this.slugify(answer);
        $('#' + answer_slug).addClass(correct_toggle);
        $('#' + answer_slug).html('');
        $('#' + answer_slug).css('background-image', 'url(img/' + answer_slug + '.jpg)');
        var newlines = '\00BB \0020\A\00000a';
        //document.styleSheets[0].addRule('#' + answer_slug + ':after','content: ' + newlines + this.correct[0] + ';');
        //document.styleSheets[0].addRule('#' + answer_slug + ':after','content: HOOPS;');
        //document.styleSheets[0].addRule('.photos li:after','content: "HIHIH";');
        $('#' + answer_slug).append('<span class="caption">' + answer + '</span>');
    },
    show_answers: function()
    {
        // Handle the end.
        // Show the "End" graphic:
        // $('#the-end').removeClass('hide');
        $('#answer').remove();
        $('#end-it').remove();
        $('#remain').text('You got ' + this.correct_count + ' out of ' + this.answer_count);

        if ( this.config.log_answers !== 0 ) this.log_answer();

        var len = this.answer_key.length;
        // PHOTO ANSWER
        if ( this.config.has_photos === 0 )
        {
            for( var x=0; x < len; x++ ) $("#missed").append("<li>" + this.answer_key[x] + "</li>");
            $("#missed").before('<h3>Missed</h3>');
        }
        else
        {
            // Turn the photos for the unguessed answers on, color them red.
            for( var x=0; x < len; x++ )
            {
                this.photo_activate(this.answer_key[x], 'incorrect');
            }
        }

        $("#missed").removeClass('hide');
        $("#explanation").css('display', 'block');
    },
    log_answer: function ()
    {
        var correct = this.correct_count;
        var params = '?slug=' + this.config.slug + '&correct=' + correct + '&callback=';
        var jqxhr = $.getJSON( this.config.log_url + params, function(data) 
        {
            // SUCCESS
            // Display how the reader has done compared to everyone else.
            // data will look something like { "players": "1", "average": "8" }
            var average = Math.round(data.average*10) / 10;

            $('#result').append(' ' + data.players + ' other people have played. An average player guessed ' + average + ' correct.');
            if  ( typeof data.correct !== 'undefined' )
            {
                var people = "people";
                if ( data.correct == 1 ) people = "person";

                var percent_right = Math.round(data.correct/data.players*1000)/10;
                if ( data.players == 0 ) percent = 0;

                $('#result').append(' ' + data.correct + ' ' + people + ' (' + percent_right + '%) picked right.');

                // Calculate the percent of people they did worse / better than.
                var s = "s";
                if ( data.worse_than == 1 ) s = "";
                percent_further = Math.round(data.worse_than/data.players*1000)/10;
                percent_better = Math.round((100 - percent_right)*10)/10;
                var better_than = data.players - data.correct;

                // If they didn't do worse than anyone, we give them a
                // positive message of accomplishment
                if ( data.worse_than == 0 )
                {
                    if ( better_than == 1 ) s = "";
                    $('#result').append('<br><br>You did better than ' + better_than + ' other player' + s + '. That means you did better than ' + percent_better + '% of the people who played this, and tied the other ' + percent_right + '%');
                }
                else
                {
                    $('#result').append('<br><br>You did worse than ' + data.worse_than + ' other player' + s + '. That means you did worse than ' + percent_further + '% of the people who played this.');
                }

                if ( distance == 0 && data.correct == 1 )
                {
                    $('#result').append(' <span style="color:red; clear: both;">You\'re the first to get them all right! Congrats!</span>');
                }
                else if ( distance == 0 && data.correct < 11 )
                {
                    $('#result').append(' <span style="color:red; clear: both;">You\'re the ' + to_ordinal(data.correct) + ' to get them all right! Right on!</span>');
                }
            }
            })
            .fail(function() {
                $('#result').append('Sorry, we could not reach the upstream servers.');
                $('#result').addClass('error');
            })
            .always(function() {
            });
    },
    start: function()
    {
        // Start the quiz timer and show the quiz interface elements.
        $('#start-it').before($('#answer_field_container').html());
        $('#start-it').remove();
        $('#answer_field_container').remove();
        $('#quiz_interface').removeClass('hide');
        //this.counter();
        this.time_count();
        document.getElementById('answer').focus();
    },
    init: function() 
    {
        // Populate the answers, figure out how many answers the reader
        // has to get right, set the config.

        // Config handling. External config objects must be named quiz_config
        if ( typeof window.quiz_config !== 'undefined' ) { this.update_config(quiz_config); }

        var all_answers = $('#answer_key').attr('value');
        this.answer_key = all_answers.split(',');
        this.answer_count = this.answer_key.length;

        // SPLIT ANSWWER
        // Check if we need to handle a "split" answer -- where a single option
        // has more than one answer.
        if ( all_answers.indexOf('/') !== -1 )
        {
            // Pull the answers that are split.
            // We know that slashes would *never* be in an answer for any other
            // reason than the answer needs to be split. We know this.
            var splitters = this.answer_key.filter(/./.test, /\//);
            var len = splitters.length;
            for ( var i = 0; i < len; i ++ )
            {
                var s = this.answer_key.indexOf(splitters[i]);
                var a = this.answer_key[s];
                var answers = a.split('/');
                this.split_answer.push(answers[0].trim())
                this.split_answer.push(answers[1].trim())
            }
        }
        this.answer_key_merged = this.answer_key.concat(this.split_answer);
       
        // PHOTO ANSWER
        if ( this.config.has_photos === 0 )
        {
            $('#correct').addClass('textual');
            $('#missed').addClass('textual');
        }
        else
        {
            var len = this.answer_key.length;
            for ( var i = 0; i < len; i ++ )
            {
                var answer_slug = this.slugify(this.answer_key[i]);
                $('#correct').append('<li id="' + answer_slug + '">?</li>');
            }
            $('#correct').addClass('photos');
        }
    }
}

$(document).ready(function(){ quizzer.init(); });

