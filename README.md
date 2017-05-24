# How Many Can You Name
Javascript and markup for publishing open-ended "How many of X can you name?"-style quizzes. [Example](http://www.nydailynews.com/entertainment/movies/planets-original-star-wars-trilogy-article-1.3136516).

## Usage

### How to develop with this repo

1. Check out the repo.
2. Put the `www` directory somewhere on your web path.
3. Test your changes with the `_blank/index.php` file.

### How to create a quiz

1. Copy the `_blank` directory into a new directory, named after your quiz.
1. Edit your new index.php file.
    1. Edit the title element.
    2. Edit the canonical meta element.
    3. Edit the `<h2>`
    4. Edit the `<input id="answer_key" type="hidden"` and add your answers.
    5. If you need more than two minutes, edit the `<input id="time_limit" type="hidden" value="2" />` and the `<input id="timer" type="text" readonly="true" value="2:00" name="timer" />` elements.
    6. Edit the `var quiz_config = { ` object.
        1. Add the quiz title and slug.
        2. If your quiz doesn't have photos, change the has_photos property value to 0.
1. Add the quiz to the database.
    1. Copy the SQL from [www/sql/insert.sql](/nydailynews/how-many-can-you-name/blob/master/www/sql/insert.sql), `INSERT INTO howmany (slug, max, create_date) VALUES ('fast-and-furious', 8, NOW());`
    2. Replace the "fast-and-furious" value with whatever your quiz slug is.
    3. Log in to your database server and execute that query.
    

####

## About the code

### The split answers / the Dwight Gooden exception

Dwight Gooden also goes by Doc Gooden and we wanted people to be able to type in either Dwight or Doc Gooden and still have it count as a correct answer. Because of this, a lot of javascript was written. You can see most of it by searching for "SPLIT ANSWER" in the js.

## Credits

Design by Jeffrey Mariano, New York Daily News. Markup, CSS, most of the javascript by Joe Murphy, New York Daily News / Denver Post.

## Old Usage

### How to create a quiz, the old way

1. Copy the markup in full-page.html to a new html file.
2. Edit the markup in the places there's an `<!-- EDIT:` in the markup.
3. Upload the quiz.js to a server somewhere, if it's not up there already.
4. Upload the html file to the same directory quiz.js is in.
5. After you know the URL it will be iframe'd in, update the meta canonical value of the html file to point to there.
