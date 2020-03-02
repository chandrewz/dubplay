<template>
  <div class="player-wrapper flex-column">
    
    <!-- header -->
    <div class="player-header flex-row flex-center">
      <h2 class="flex-one">
        <i class="fa fa-headphones" title="A player inspired by Dubtrack.fm"></i> <span>DubPlayer</span>
      </h2>
      <div class="user-count"><i class="fa fa-user" title="Users online"></i> {{ users }}</div>
      <button class="btn-common" @click="isSearchOpen = !isSearchOpen">
        <i class="fa fa-bars" title="Search menu"></i>
      </button>
    </div>

    <!-- player -->
    <div class="player flex-row">
      <div class="flex-one">
        <youtube :video-id="videoId" :player-vars="playerVars" ref="youtube" @ended="ended" :width="500" :height="250"></youtube>
        <History :history="history" />
      </div>
      <div class="playlist flex-one">
        <table>
          <tr v-for="(video, index) in queue" :key="index" class="flex-center">
            <td class="monospace" :class="{ playing : index == 0 }">
              {{ index == 0 ? 'Playing' : index }}
            </td>
            <td @click="skip(index)">
              <img :src="video.thumbnail" class="thumbnail">
              <i class="fa fa-window-close-o skip"></i>
            </td>
            <td v-html="video.title"></td>
          </tr>
        </table>
      </div>
    </div>

    <Search :is-search-open="isSearchOpen" @queue="queueVideo" @close="isSearchOpen = false" />

  </div>
</template>

<script>
import ScaleDroneService from '../services/ScaleDroneService.js';
import History from './History.vue';
import Search from './Search.vue';

export default {
  name: 'Player',
  components: {
    History,
    Search
  },
  data() {
    return {
      queue: [],
      videoUrl: '',
      videoId: '',
      playerVars: {
        autoplay: 1
      },
      isSearchOpen: false,
      users: 0,
      history: []
    }
  },
  props: ['room'],
  methods: {
    playVideo() {
      this.videoId = this.queue[0].id;
      // added delay becase playing right after fails
      setTimeout(() => {
        this.player.playVideo();
        if (this.queue[0].timestamp) {
          this.player.seekTo(this.queue[0].timestamp);
        }
      }, 2000);
    },
    queueVideo(video, isLocal = true) {
      let item = isLocal ? {
        id: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.default.url
      } : video;
      this.queue.push(item);
      if (isLocal) {
        // queued from app, so publish; don't queue when broadcast is received
        ScaleDroneService.publish(item);
      }
      if (this.queue.length === 1) {
        this.playVideo();
      }
    },
    ended() {
      this.history.push(this.queue.shift());
      if (this.queue.length > 0) {
        this.playVideo();
      }
    },
    broadcastPlaylist() {
      if (this.queue.length > 0) {
        this.player.getCurrentTime().then(result => {
          let copy = [...this.queue];
          copy[0].timestamp = result;
          ScaleDroneService.publish({ action: 'sync', queue: copy });
        });
      }
    },
    skip(index) {
      this.queue.splice(index, 1);
      if (this.queue.length === 0) {
        this.player.stopVideo();
      }
      if (index === 0 && this.queue.length > 0) {
        this.playVideo();
        ScaleDroneService.publish({ action: 'sync', queue: this.queue, play: true });
      } else {
        ScaleDroneService.publish({ action: 'sync', queue: this.queue});
      }
    }
  },
  computed: {
    player() {
      return this.$refs.youtube.player
    }
  },
  mounted() {
    let hash = this.room;
    ScaleDroneService.connect(hash);
    ScaleDroneService.room.on('message', message => {
      console.log(message);

      // make sure message was not sent by us
      if (ScaleDroneService.getClientId() !== message.clientId) {

        if (message.data.action === 'sync') {

          const isNew = this.queue.length === 0 && this.queue.length !== message.data.length;

          // check if data received is different
          if (this.queue.length !== message.data.length) {
            this.queue = message.data.queue;

            if (message.data.queue.length === 0) {
              this.player.stopVideo();
            } else if (message.data.play || isNew) {
              this.playVideo();
            }
          }
        } else {
          this.queueVideo(message.data, false);
        }
      }
    });
    ScaleDroneService.room.on('member_join', () => {
      this.broadcastPlaylist();
      this.users++;
    });
    ScaleDroneService.room.on('member_leave', () => this.users--);
    ScaleDroneService.room.on('members', members => this.users = members.length);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../styles/_colors.scss';

.player-wrapper {
  background: $monokai-darker;
  width: 1080px;
  height: calc(100vh - 4em);
  max-height: 600px;
  overflow-y: scroll;
  position: relative;
}

.player-header {
  flex-wrap: no-wrap;
}

.playlist {

  .playing {
    color: $monokai-blue;
    font-weight: normal;
  }

  .skip {
    color: $monokai-red;
    display: none;
    position: absolute;
    transform: translate(-120%, 20%);
  }

  .thumbnail:hover + .skip {
    display: inline;
  }
}

.thumbnail {
  cursor: pointer;
}

.user-count {
  font-family: monospace;
  color: $monokai-purple;
  margin-right: 1em;
}
</style>
