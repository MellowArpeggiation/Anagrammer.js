/** --------------------------------------
 *   Copyright 2012-2017 George Paton
 *   Anagrammer.js, requires jQuery 1.11+
 *  --------------------------------------
 */

(function () {

    // Default values
    var defaults = {
        // How many seconds between rearranges
        arrangeRate: 8000,

        // How long the animation lasts
        animationDuration: 3000,

        // Ensure that the words are true anagrams
        // Also ensure that all the letters have images associated
        words: [],
        fileFormat: '.svg',

        // Location where the images are stored, letters must be in the format 'a.svg' and within the first level
        // Don't forget trailing slash!
        imageLocation: 'http://mellowarpeggiation.github.io/Anagrammer.js/letters/',

        onStart: $.noop,
    };

    // --------------------------------------

    var $body = $('body');

    var Anagrammer = function ($container, options) {
        var self = this;

        if (!(self instanceof Anagrammer)) {
            return new Anagrammer();
        }

        self.opts = $.extend({}, defaults, options);
        self.$container = $container;

        self.init();
    };

    Anagrammer.prototype = {
        init: function () {
            var self = this;

            self.currentWord = self.opts.words[0];
            self.$anagramWord = $('<div class="anagram-word"></div>').appendTo(self.$container);
            self.$dummyWord = $('<div class="dummy-word"></div>').appendTo(self.$container);

            // Begin preloading assets
            self.preload();

            // // Pre arrange to prevent weird pop in
            // self.arrange(self.opts.words[1], true);
            // self.arrange(self.opts.words[0], true);
        },
        preload: function () {
            var self = this;

            var numCharacters = 0;
            var charactersLoaded = 0;
            var $preload = $('<div></div>').hide().appendTo($body);
        
            for (var i = 0; i < self.opts.words[0].length; i++) {
                if ((self.opts.words[0])[i] === ' ') {
                    continue;
                } else {
                    numCharacters++;

                    var imageLocation = self.opts.imageLocation + (self.opts.words[0])[i] + self.opts.fileFormat;
                    var $character = $('<img src="' + imageLocation + '">').appendTo($preload);

                    $character.on('load', function () {
                        charactersLoaded++;
                        // console.log('loaded image');
                        if (charactersLoaded >= numCharacters) {
                            // console.log('all images loaded');
                            // Once all the assets have successfully loaded, start the anagrammer
                            self.start();
                        }
                    });
                }
            }
        },
        build: function () {
            var self = this;

            var spaces = 0;
            for (var i = 0; i < self.currentWord.length; i++) {
                var character = self.currentWord[i];
                if (character === ' ') {
                    $('<br>').appendTo(self.$anagramWord);
                    spaces++;
                } else {
                    var characterImage = self.opts.imageLocation + character + self.opts.fileFormat;
                    var $character = $('<img src="' + characterImage + '" class="anagram-character ' + character + '">');
                    $character.data('index', i - spaces).appendTo(self.$anagramWord);
                }
            }
        },
        start: function () {
            var self = this;

            // Build the anagram objects
            self.build();

            // Run the onStart callback, which can include removing loading spinners and the like
            self.opts.onStart();

            // Start rearranging
            setTimeout(function () {
                self.arrange(self.opts.words[0]);
            }, self.opts.arrangeRate);
        },
        arrange: function (toWord) {
            var self = this;
            
            // console.log('Rearranging as ' + toWord + '...');

            // Clone the contents of anagramWord into the dummy
            self.$dummyWord.html(self.$anagramWord.html());

            // var offset = (self.$anagramWord.offset());
            self.$dummyWord.css({
                position: 'absolute',
                left: 0,
                top: 0,
            });

            var $letters = self.$anagramWord.find('img');
            var $dummyLetters = self.$dummyWord.find('img');

            var oldOffsets = [];
            $dummyLetters.each(function (index) {
                oldOffsets[index] = $($letters[index]).offset();
                $(this).css({
                    position: 'absolute',
                    left: oldOffsets[index].left,
                    top: oldOffsets[index].top,
                });
            });

            $letters.each(function (index) {
                $(this).data('index', index);
            });

            var $lettersRemaining = self.$anagramWord.find('img');

            $letters.detach();
            self.$anagramWord.empty();

            var newOffsets = [];

            // var spaces = 0;
            for (var i = 0; i < toWord.length; i++) {
                if (toWord[i] === ' ') {
                    $('<br>').appendTo(self.$anagramWord);
                    // spaces++;
                } else {
                    for (var j = 0; j < $lettersRemaining.length; j++) {
                        if ($($lettersRemaining[j]).hasClass(toWord[i])) {
                            self.$anagramWord.append($lettersRemaining[j]);
                            $lettersRemaining.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            $letters.each(function (index) {
                newOffsets[index] = $(this).offset();
            });

            self.$anagramWord.hide();
            self.$dummyWord.show();

            // Animate here
            $dummyLetters.each(function () {
                var $letter = $(this);
                $letter.animate({
                    left: newOffsets[$letter.data('index')].left,
                    top: newOffsets[$letter.data('index')].top,
                }, {
                    duration: self.opts.animationDuration,
                    complete: function () {
                        self.$anagramWord.show();
                        self.$dummyWord.hide();
                    },
                });
            });

            setTimeout(function () {
                self.arrange(self.opts.words[1]);
            }, self.opts.arrangeRate);
        },

    };

    window.Anagrammer = Anagrammer;
    
    $.fn.anagrammer = function (options) {
        var $element = this;

        var anagrammer = new Anagrammer($element, options);
        $element.data('anagrammer', anagrammer);      
    };
})();