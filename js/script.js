// initially
let currentSong = "";
let isRecording = false;
let startBtn = $('#start-record')[0];
let pauseBtn = $('#pause-record')[0];
let stopBtn = $('#stop-record')[0];
let ytPlayer = $("#video-player")[0];

// event listener on each song card to change the song
$(".song-card").click(function (e) {
    $(".song-card.selected").removeClass("selected");
    $(e.currentTarget).addClass("selected");
    let nextSong = e.currentTarget.children[1].innerText;
    changeSongTo(songs[nextSong]);
    changeLyrics(nextSong);
    startBtn.disabled = false;
})

// event listener to switch the navbar tabs
$(".nav-link").click(function (e) {
    if ($(e.currentTarget).hasClass("active")) {
        return;
    }
    $(".nav-link.active").removeClass("active");
    $(e.currentTarget).addClass("active");

    if (e.currentTarget.text == "Karaoke") {
        $(".karaoke-container").removeClass("hidden");
        $(".recordings-container").addClass("hidden");
    } else {
        $(".recordings-container").removeClass("hidden");
        $(".karaoke-container").addClass("hidden");
    }
});

$(".song-search-input").click(function (e) {
    $(".nav-link.active").removeClass("selected");
    $("#custom-song-card").addClass("selected");
})

// function to change the song
function changeSongTo(songId) {
    $("#video-player").attr("src", "https://www.youtube.com/embed/" + songId + "?autoplay=1&controls=0");
}

// function to change the lyrics on the right panel
function changeLyrics(nextSong) {
    currentSong = nextSong;
    $(".lyrics-header h1:nth-child(1)").text(currentSong);
    $(".lyrics-text").empty();
    let currentLyrics = lyricsData[currentSong];

    if (currentLyrics == undefined) {
        let p_tag = `<p>Lyrics not available</p>`;
        $(".lyrics-text").append(p_tag);
    } else {
        currentLyrics.forEach(element => {
            let p_tag = `<p>${element}</p>`;
            $(".lyrics-text").append(p_tag);
        });
    }
}

// function to download file
function downloadFile(link) {
    let a = document.createElement("a");
    a.href = link;
    a.download = "recording.mp3";
    a.click();
    a.remove();
}



navigator.mediaDevices.getUserMedia({ audio: true })

    .then(function (userStream) {
        let audio = document.createElement("audio");
        audio.autoplay = true;

        let mediaRecorder = new MediaRecorder(userStream);

        let chunks = [];

        startBtn.addEventListener('click', function (e) {
            $(".container").append(audio);
            startBtn.hidden = true;
            pauseBtn.hidden = false;
            stopBtn.hidden = false;
            mediaRecorder.start();
            isRecording = true;
        })

        pauseBtn.addEventListener('click', function (e) {
            if (isRecording) {
                pauseBtn.innerText = "Resume Recording"
                mediaRecorder.pause();
                isRecording = false;
            } else {
                pauseBtn.innerText = "Pause Recording"
                mediaRecorder.resume();
                isRecording = true;
            }
        })

        stopBtn.addEventListener('click', function (e) {
            mediaRecorder.stop();
            startBtn.hidden = false;
            pauseBtn.hidden = true;
            stopBtn.hidden = true;
        });

        mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        }

        mediaRecorder.onstop = function (e) {
            let audioData = new Blob(chunks, { 'type': 'audio/mp3;' });
            chunks = [];

            let audioSrc = window.URL.createObjectURL(audioData);

            downloadFile(audioSrc);
        }
    })

// .catch(function (err) {
//     console.log(err.name, err.message);
// });


// perfect scrollbar
// const ps = new PerfectScrollbar('.songs-container');
// const ps = new PerfectScrollbar('.songs-container', {
//     wheelSpeed: 2,
//     wheelPropagation: true,
//     minScrollbarLength: 20
// });
