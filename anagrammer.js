// --------------------------------------
//   Copyright 2012-2015 George Paton
//   Anagrammer.js, requires jQuery 1.11+
// --------------------------------------

// * User variables *

// How many seconds between rearranges
	var arrangeRate = 8000;
// How long the animation lasts
	var animationDuration = 3000;
	var animationSegmentDuration = 100;

// Ensure that the words are true anagrams
// Also ensure that all the letters have images associated
	var words = ["mellow arpeggiation", "george william paton", "a germinate polliwog"];

// Location where the images are stored, letters must be in the format "a.png" and within the first level
	var imageLocation = "https://bf93433f972a5c5b9dcd92ff00e40c3e64683a0b.googledrive.com/host/0B-W0tG4VFD0sT2V6WWlWQVFqVXM/";

// *Not yet implemented*
// Set to cycle through the first two and randomly show the rest according to alternateAnagramChance
	var alternateAnagramChance = 0.45;

// --------------------------------------

//TODO: Implement random anagram cycle

function arrangeAsString(nameString, animDuration) {
	if ($("#anword").length == 0) {
		anword = document.createElement("div");
		anword.id = "anword";
		
		dummy = document.createElement("div");
		dummy.id = "dummy";
		
		$("#anagram").append(anword);
		$("#anagram").append(dummy);
		
		var spaces = 0;
		for (var i = 0; i < nameString.length; i++) {
			if (nameString[i] == ' ') {
				lBreak = document.createElement("br");
				$("#anword").append(lBreak);
				spaces++
			} else {
				character = document.createElement("img");
				character.src = imageLocation + nameString[i] + ".png";
				$(character).addClass(nameString[i]);
				$(character).addClass("anchar");
				$(character).attr("index", i-spaces);
				$("#anword").append(character);
			}
		}
	} else {
		console.log("Rearranging as " + nameString + "...");
		
		$("#dummy").empty();
		
		$("#anword *").clone().appendTo($("#dummy"));
		var offset = ($("#anword").offset());
		$("#dummy").css("position", "absolute")
			.css("left", 0)
			.css("top", 0);
		
		var oldOffsets = new Array();
		$("#dummy img").each(function(i) {
			oldOffsets[i] = $($("#anword img")[i]).offset();
			$(this).css("position", "absolute")
				.css("left", oldOffsets[i].left)
				.css("top", oldOffsets[i].top);
		})
		
		$("#anword img").each(function(i) {
			$(this).attr("index", i);
		})
		
		var letters = $("#anword img").detach();
		$("#anword").empty();
		
		var newOffsets = new Array();
		
		var spaces = 0;
		
		for (var i = 0; i < nameString.length; i++) {
			if (nameString[i] == ' ') {
				lBreak = document.createElement("br");
				$("#anword").append(lBreak);
				spaces++
			} else {
				for (var j = 0; j < letters.length; j++) {
					if ($(letters[j]).hasClass(nameString[i])) {
						$("#anword").append(letters[j]);
						letters.splice(j, 1);
						break;
					}
				}
			}
		}
		
		$("#anword img").each(function(i) {
			newOffsets[i] = $(this).offset();
		})
		
		$("#anword").hide();
		$("#dummy").show();
		
		// Animate here
		var temps = new Array();
		for (var i = 0; i < $("#dummy img").length; i++) {
			var currentImage = $("#dummy img")[i];
			$(currentImage).animate({
			    left: newOffsets[$(currentImage).attr("index")].left,
			    top: newOffsets[$(currentImage).attr("index")].top
			}, {duration: animDuration, complete: finishAnimating} );
		}
	}
}

function finishAnimating() {
	$("#anword").show();
	$("#dummy").hide();
}

function rearrangeLoop() {
	// Keep track of changes for timekeeping
	var animateCounter = 0;
	
	arrangeAsString(words[1], animationDuration);
	animateCounter++;
	
/*	
	if (randomArrange(animateCounter)) {
		animateCounter++;
	}
*/
	
	setTimeout(function() {arrangeAsString(words[0], animationDuration)}, arrangeRate * animateCounter);
	animateCounter++;
	
/*	
	if (randomArrange(animateCounter)) {
		animateCounter++;
	}
*/
	
	setTimeout(rearrangeLoop, arrangeRate * animateCounter);
}

var preload = document.createElement("div");
$(preload).hide();
for (var i = 0; i < words[0].length; i++) {
	if ((words[0])[i] == ' ') {
		continue;
	} else {
		character = document.createElement("img");
		character.src = imageLocation + (words[0])[i] + ".png";
		$(preload).append(character);
	}
}

$(preload).ready(function() {
	arrangeAsString(words[1], 1);
	arrangeAsString(words[0], 1);
	setTimeout(rearrangeLoop, arrangeRate - animationDuration);
});

function getRandomInt (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArrange (animateCounter) {
	setTimeout(function() {arrangeAsString(words[2], animationDuration)}, arrangeRate * animateCounter);
	return true;
}