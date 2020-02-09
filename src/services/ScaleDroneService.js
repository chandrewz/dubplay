export default {

  connect(roomId) {
    this.roomName = `observable-${roomId}`;
    this.room = window._ScaleDrone.subscribe(this.roomName);
  },

  publish(data) {
    window._ScaleDrone.publish({
      room: this.roomName,
      message: data
    });
  },

  getClientId() {
    return window._ScaleDrone.clientId;
  }
}
