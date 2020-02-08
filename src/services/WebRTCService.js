export default {
  connect(chatHash) {
    this.drone = window._ScaleDrone;
    // Scaledrone room name needs to be prefixed with 'observable-'
    this.roomName = 'observable-' + chatHash;

    // Wait for Scaledrone signaling server to connect
    this.drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      this.room = this.drone.subscribe(this.roomName);
      this.room.on('open', error => {
        if (error) {
          return console.error(error);
        }
        console.log('Connected to signaling server');
      });
      // We're connected to the room and received an array of 'members'
      // connected to the room (including us). Signaling server is ready.
      this.room.on('members', members => {
        if (members.length >= 3) {
          return alert('The room is full');
        }
        // If we are the second user to connect to the room we will be creating the offer
        const isOfferer = members.length === 2;
        this.startWebRTC(isOfferer);
      });
    });
  },

  sendSignalingMessage(message) {
    this.drone.publish({
      room: this.roomName,
      message
    });
  },

  startWebRTC(isOfferer) {
    console.log('Starting WebRTC in as', isOfferer ? 'offerer' : 'waiter');
    const configuration = {
      iceServers: [{
        url: 'stun:stun.l.google.com:19302'
      }]
    };
    this.pc = new RTCPeerConnection(configuration);
   
    // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
    // message to the other peer through the signaling server
    this.pc.onicecandidate = event => {
      if (event.candidate) {
        this.sendSignalingMessage({'candidate': event.candidate});
      }
    };
   
   
    if (isOfferer) {
      // If user is offerer let them create a negotiation offer and set up the data channel
      this.pc.onnegotiationneeded = () => {
        this.pc.createOffer(this.localDescCreated, error => console.error(error));
      }
      this.dataChannel = this.pc.createDataChannel('chat');
      this.setupDataChannel();
    } else {
      // If user is not the offerer let wait for a data channel
      this.pc.ondatachannel = event => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      }
    }
   
    this.startListentingToSignals();
  },

  setupDataChannel() {
    this.checkDataChannelState();
    this.dataChannel.onopen = this.checkDataChannelState;
    this.dataChannel.onclose = this.checkDataChannelState;
    this.dataChannel.onmessage = event =>
      console.log(JSON.parse(event.data), false)
  },
   
  checkDataChannelState() {
    console.log('WebRTC channel state is:', this.dataChannel.readyState);
    if (this.dataChannel.readyState === 'open') {
      console.log({content: 'WebRTC data channel is now open'});
    }
  },

  startListentingToSignals() {
    // Listen to signaling data from Scaledrone
    this.room.on('data', (message, client) => {
      // Message was sent by us
      if (client.id === this.drone.clientId) {
        return;
      }
      if (message.sdp) {
        // This is called after receiving an offer or answer from another peer
        this.pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
          console.log('pc.remoteDescription.type', this.pc.remoteDescription.type);
          // When receiving an offer lets answer it
          if (this.pc.remoteDescription.type === 'offer') {
            console.log('Answering offer');
            this.pc.createAnswer(this.localDescCreated, error => console.error(error));
          }
        }, error => console.error(error));
      } else if (message.candidate) {
        // Add the new ICE candidate to our connections remote description
        this.pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    });
  },

  localDescCreated(desc) {
    this.pc.setLocalDescription(
      desc,
      () => this.sendSignalingMessage({'sdp': this.pc.localDescription}),
      error => console.error(error)
    );
  }
}
