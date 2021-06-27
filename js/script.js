// initially
let currentSong = "";
let isRecording = false;
let startBtn = $('#start-record')[0];
// let pauseBtn = $('#pause-record')[0];
let stopBtn = $('#stop-record')[0];
let ytPlayer = $("#video-player")[0];
let startRecordingTime, endRecordingTime;
let playPushed = false;

// event listener on start btn
startBtn.addEventListener("click", function () {
    alert("Click on any song card to start recording");
});


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
        viewMedia();
    }
});


// event listener listent on custom play
$(".custom-play").click(function (e) {
    let customVideoId = e.currentTarget.parentElement.children[0].value.split("=")[1];
    console.log(customVideoId);
    if (customVideoId) {
        $(".nav-link.selected").removeClass("selected");
        $("#custom-song-card").addClass("selected");
        changeSongTo(customVideoId);
        changeLyrics("Custom Song");
        playPushed = true;
        $("#custom-song-card").click();
    } else {
        alert("Youtube link Invalid!");
    }
})


// function to change the song
function changeSongTo(songId) {
    $("#video-player").attr("src", "https://www.youtube.com/embed/" + songId + "?autoplay=1&controls=0");
}


// function to change the lyrics on the right panel
function changeLyrics(nextSong) {
    $(".lyrics-text").empty();
    let currentLyrics = lyricsData[nextSong];

    if (currentLyrics == undefined) {
        let p_tag = `<p>Lyrics not available</p>`;
        $(".lyrics-text").append(p_tag);
        currentSong = "Custom";
    } else {
        currentSong = nextSong;
        currentLyrics.forEach(element => {
            let p_tag = `<p>${element}</p>`;
            $(".lyrics-text").append(p_tag);
        });
    }

    $(".lyrics-header h1:nth-child(1)").text(currentSong);
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
        let mediaRecorder = new MediaRecorder(userStream);

        let chunks = [];

        // event listener on each song card to change the song
        $(".song-card").click(function (e) {
            if (isRecording == true) {
                stopBtn.click();
            }
            if (e.currentTarget.innerText == "Custom" && playPushed == false) {
                alert("Error! Enter youtube link and push play to use this card");
                return;
            }
            else if (e.currentTarget.innerText == "Custom") {
                playPushed = false;
            }
            else {
                $(".song-card.selected").removeClass("selected");
                $(e.currentTarget).addClass("selected");
                let nextSong = e.currentTarget.children[1].innerText;
                changeSongTo(songs[nextSong]);
                changeLyrics(nextSong);
            }
            
            startBtn.hidden = true;
            // pauseBtn.hidden = false;
            stopBtn.hidden = false;
            mediaRecorder.start();
            isRecording = true;
            startRecordingTime = new Date().getSeconds();
            console.log("recording started");
            console.log(startRecordingTime);
            
        })

        // pauseBtn.addEventListener('click', function (e) {
        //     if (isRecording) {
        //         pauseBtn.innerText = "Resume Recording"
        //         mediaRecorder.pause();
        //         isRecording = false;
        //     } else {
        //         pauseBtn.innerText = "Pause Recording"
        //         mediaRecorder.resume();
        //         isRecording = true;
        //     }
        // })

        stopBtn.addEventListener('click', function (e) {
            mediaRecorder.stop();
            isRecording = false;
            startBtn.hidden = false;
            // pauseBtn.hidden = true;
            stopBtn.hidden = true;
            endRecordingTime = new Date().getSeconds();
            console.log("recording stopped");
            console.log(endRecordingTime);
            $("#video-player").attr("src", "https://www.youtube.com/embed/z4c14QYnBoU?autoplay=1&mute=1&controls=0");
            $(".song-card.selected").removeClass("selected");
        });

        mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        }

        mediaRecorder.onstop = function (e) {
            let blob = new Blob(chunks, { 'type': 'audio/mp3;' });
            chunks = [];
            let diff = endRecordingTime - startRecordingTime;
            let minutes = parseInt(diff / 60);
            let seconds = diff % 60;
            // console.log(`${minutes}:${seconds}`);
            saveRecording(blob, currentSong, "00:00", `${minutes}:${seconds}`);
            alert("Recording saved in My Recordings");
            // downloadFile(audioSrc);
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
