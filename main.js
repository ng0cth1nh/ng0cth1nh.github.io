const socket = io('https://oletv.herokuapp.com/');
//const socket = io('http://localhost:3000');
let myId = null;

socket.on("connect", () => {
    console.log(socket.id); 
  });
  
socket.on("disconnect", () => {
    console.log(socket.id); 
});

socket.on('online_list', arrUserSize => {
 
    $('#online').text(`${arrUserSize} Users online`);
   
    socket.on('have_new_user', arrUserSize => {
        $('#online').text(`${arrUserSize} Users online`);
    });

    socket.on('user_disconnect', arrUserSize => {
        $('#online').text(`${arrUserSize} Users online`);
    });

});



function openStream(){
    const config = { audio: true, video: true };
    return navigator.mediaDevices.getUserMedia(config);
}


function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

const peer = new Peer(null, { host: "peerjs.92k.de", secure: true });

peer.on('open', function(id) {
    $.get("https://api.ipdata.co?api-key=1907be1d282be1f2ff823b04fb1eed6d15513034251a2dbf7d8fa203", function(response) {
        socket.emit('sign_up',{ country: response.country_name, peerId: id});    
        $('#connection').text(`Your connection: ${response.country_name}`);
        myId = id;
    }, "jsonp");   
});

peer.on('error', function(err) {
    console.log("Error: ", err);
});

$("#btnNext").click(() => {
    socket.emit('call', myId); 
});


$("#btnStop").click(() => {
    socket.emit('stop', myId); 
 });

socket.on('listen_call', connection => {

    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(connection.peerId, stream);
        call.on('stream', remoteStream => {
            playStream("remoteStream", remoteStream);
        })
    });
    $('#remote-connection').text(`Connection from: ${connection.country}`);
});



peer.on('call', call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => {
            playStream('remoteStream', remoteStream);
        })
    })
});
