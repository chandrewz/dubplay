<template>
  <div class="player-wrapper flex-column">
    
    <!-- header -->
    <div class="player-header flex-row flex-middle flex-stretch">
      <h2 class="flex-one">
        <i class="fa fa-headphones"></i> <span>DubPlayer</span>
      </h2>
      <button class="btn-common" @click="isSearchOpen = !isSearchOpen">
        <i class="fa fa-bars"></i>
      </button>
    </div>

    <!-- player -->
    <div class="player flex-row">
      <div class="video flex-one">
        <youtube v-bind:video-id="videoId" v-bind:player-vars="playerVars" ref="youtube" @ended="ended"></youtube>
      </div>
      <div class="playlist flex-one">
        <table>
          <tr v-for="(video, index) in queue" v-bind:key="index" class="flex-center">
            <td class="number" v-bind:class="{ playing : index == 0 }">
              {{ index == 0 ? 'Playing' : index }}
            </td>
            <td><img v-bind:src="video.thumbnail"></td>
            <td v-html="video.title">{{ video.title }}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- search & queue -->
    <div class="search" v-bind:class="{ visible : isSearchOpen }">
      <div class="search-bar flex-row flex-center">
        <i class="fa fa-search"></i>
        <input class="search-input flex-one" type="text" placeholder="Search video..." v-model="searchText" v-on:keyup.enter="query">
        <button class="btn-common" @click="isSearchOpen = false">
          <i class="fa fa-times-circle"></i>
        </button>
      </div>
      <ul class="results">
        <li class="video flex-row flex-center" v-for="(video, index) in results.items" :key="index">
          <div class="thumbnail">
            <img v-bind:src="video.snippet.thumbnails.default.url" @click="queueVideo(video)">
          </div>
          <div class="title" v-html="video.snippet.title">{{ video.snippet.title }}</div>
          <div class="duration"></div>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import QueryService from '../services/QueryService.js'
import ScaleDroneService from '../services/ScaleDroneService.js'

export default {
  name: 'Player',
  data() {
    return {
      queue: [],
      videoUrl: "",
      videoId: '',
      playerVars: {
        autoplay: 1
      },
      isSearchOpen: false,
      searchText: '',
      results: {}
    }
  },
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
      if (this.queue.length == 1) {
        this.playVideo();
      }
    },
    ended() {
      this.queue.shift();
      if (this.queue.length > 0) {
        this.playVideo();
      }
    },
    query() {
      let component = this;
      QueryService.get(this.searchText).then(response => {
        component.results = response.data;
      });
    },
    broadcastPlaylist() {
      if (this.queue.length > 0) {
        this.player.getCurrentTime().then(result => {
          let copy = [...this.queue];
          copy[0].timestamp = result;
          ScaleDroneService.publish(copy);
        });
      }
    }
  },
  computed: {
    player() {
      return this.$refs.youtube.player
    }
  },
  mounted() {
    let hash = 'abc123';
    ScaleDroneService.connect(hash);
    ScaleDroneService.room.on('message', message => {
      console.log(message);
      if (ScaleDroneService.getClientId() !== message.clientId) {
        // make sure message was not sent by us
        if (Array.isArray(message.data)) {
          // sync playlists
          if (this.queue.length === 0 && this.queue.length !== message.data.length) {
            this.queue = message.data;
            this.playVideo();
          }
        } else {
          this.queueVideo(message.data, false);
        }
      }
    });
    ScaleDroneService.room.on('member_join', () => {
      this.broadcastPlaylist();
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../styles/_colors.scss';

.player-wrapper {
  background: $monokai-darker;
}

.player-header {
  flex-wrap: no-wrap;
}

.playlist .number {
  color: $monokai-grey;
  font-family: monospace;
  font-size: 15px;
  font-weight: bold;
}

.playlist .playing {
  color: $monokai-blue;
  font-weight: normal;
}

.search {
  position: absolute;
  right: -420px;
  top: 0;
  background-color: $monokai-dark;
  width: 420px;
}

.search .search-bar {
  margin: 0 1em 0 1em;
}

.search .search-bar .search-input {
  background-color: transparent;
  border: 0;
  border-bottom: 2px dotted $monokai-yellow;
  color: $monokai-white;
  font-size: 1em;
  outline: none;
  margin: 0 .5em;
}

.search .search-bar .search-input::placeholder {
  color: $monokai-grey;
}

.search .results .video .thumbnail {
  cursor: pointer;
}

.search.visible {
  transform: translateX(-420px);
}

</style>
